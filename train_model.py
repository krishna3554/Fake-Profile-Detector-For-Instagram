import pandas as pd
import numpy as np
import re
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

def digit_ratio(text):
    text = str(text)
    return sum(c.isdigit() for c in text) / max(1, len(text))

def has_url(bio):
    return 1 if re.search(r"http|www|\.com", str(bio).lower()) else 0

def auto_label(followers, following, posts):
    score = 0
    if followers < 50: score += 2
    if following > 500: score += 2
    if posts < 10: score += 1
    if followers / max(1, following) < 0.1: score += 2
    return 1 if score >= 4 else 0

# -------------------------------------------------
# Load datasets
# -------------------------------------------------
df1 = pd.read_csv("instagram_dataset.csv")
df2 = pd.read_csv("final-v1.csv")

print("📄 final-v1.csv columns:", df2.columns.tolist())

# -------------------------------------------------
# Normalize Dataset 2 (RAW → FEATURES)
# -------------------------------------------------
df2_features = pd.DataFrame()

# -------- Username column detection (SAFE) --------
username_col = None
for col in ["username", "user_name", "profile_name", "screen_name"]:
    if col in df2.columns:
        username_col = col
        break

if username_col:
    df2_features["nums/length username"] = df2[username_col].astype(str).apply(digit_ratio)
else:
    df2_features["nums/length username"] = 0.0

# -------- Full name --------
if "full_name" in df2.columns:
    df2_features["fullname words"] = df2["full_name"].astype(str).apply(lambda x: len(x.split()))
else:
    df2_features["fullname words"] = 0

# -------- Bio --------
if "bio" in df2.columns:
    df2_features["description length"] = df2["bio"].astype(str).apply(len)
    df2_features["external URL"] = df2["bio"].apply(has_url)
else:
    df2_features["description length"] = 0
    df2_features["external URL"] = 0

# -------- Counts --------
followers = df2.get("followers", df2.get("follower_count", 0))
following = df2.get("following", df2.get("followings", 0))
posts = df2.get("posts", df2.get("post_count", 0))

df2_features["#followers"] = followers
df2_features["#follows"] = following
df2_features["#posts"] = posts

# -------- Other fields --------
df2_features["profile pic"] = df2.get("profile_pic", 1)
df2_features["private"] = df2.get("is_private", 0)

# -------- AUTO LABEL (IMPORTANT) --------
df2_features["fake"] = [
    auto_label(f, fo, p)
    for f, fo, p in zip(df2_features["#followers"],
                        df2_features["#follows"],
                        df2_features["#posts"])
]

# -------------------------------------------------
# Normalize Dataset 1 (Already engineered)
# -------------------------------------------------
REQUIRED_COLS = [
    'profile pic',
    'nums/length username',
    'fullname words',
    'description length',
    'external URL',
    'private',
    '#posts',
    '#followers',
    '#follows',
    'fake'
]

df1 = df1[REQUIRED_COLS]

# -------------------------------------------------
# Merge datasets
# -------------------------------------------------
df = pd.concat([df1, df2_features], ignore_index=True)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# -------------------------------------------------
# Train model
# -------------------------------------------------
X = df.drop("fake", axis=1)
y = df["fake"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=18,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train, y_train)

# -------------------------------------------------
# Evaluation
# -------------------------------------------------
print("\n📊 Classification Report:\n")
print(classification_report(y_test, model.predict(X_test)))

# -------------------------------------------------
# Save model
# -------------------------------------------------
joblib.dump(model, "fake_account_model.pkl")
print("\n✅ Model trained and saved successfully")
