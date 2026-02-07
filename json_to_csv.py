import os
import json
import pandas as pd

BASE_PATH = r"C:\Users\admin\Downloads\archive\db"
rows = []

def auto_label(user):
    followers = user['edge_followed_by']['count']
    following = user['edge_follow']['count']
    posts = user['edge_owner_to_timeline_media']['count']

    # Simple heuristic (acceptable for project)
    if followers < 100 and following > 1000 and posts < 20:
        return 1  # fake
    return 0      # real

def extract_features(profile):
    user = profile['graphql']['user']

    username = user['username']
    fullname = user.get('full_name') or ""
    bio = user.get('biography') or ""

    label = auto_label(user)

    return {
        'profile pic': int(bool(user.get('profile_pic_url_hd'))),
        'nums/length username': sum(c.isdigit() for c in username) / max(1, len(username)),
        'fullname words': len(fullname.split()),
        'description length': len(bio),
        'external URL': int(bool(user.get('external_url'))),
        'private': int(user.get('is_private')),
        '#posts': user['edge_owner_to_timeline_media']['count'],
        '#followers': user['edge_followed_by']['count'],
        '#follows': user['edge_follow']['count'],
        'fake': label
    }

for file in os.listdir(BASE_PATH):
    if file.endswith(".json"):
        with open(os.path.join(BASE_PATH, file), "r", encoding="utf-8") as f:
            profile = json.load(f)
            rows.append(extract_features(profile))

df = pd.DataFrame(rows)
df.to_csv("instagram_dataset.csv", index=False)

print("✅ Dataset created")
print(df['fake'].value_counts())
print("Total samples:", len(df))
