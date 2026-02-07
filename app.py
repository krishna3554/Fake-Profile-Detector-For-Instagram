import os
from pyexpat import features
import joblib
import numpy as np
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import instaloader
import requests
from flask import Response


app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# ---------------------------------------------------
# 1. Load Trained ML Model (Safe Loading)
# ---------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "fake_account_model.pkl")

model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded successfully from: {MODEL_PATH}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
else:
    print(f"⚠️ Model file not found at {MODEL_PATH}. Prediction will fail.")

# ---------------------------------------------------
# 2. Setup Instaloader
# ---------------------------------------------------
L = instaloader.Instaloader(
    download_pictures=False,
    download_videos=False, 
    save_metadata=False
)

# ---------------------------------------------------
# 3. Feature Extraction Function
# ---------------------------------------------------
def extract_features(data):
    """
    Converts raw profile data into the 9 numerical features expected by the model.
    """
    username = str(data.get('username', ''))
    fullname = str(data.get('full_name', ''))
    bio = str(data.get('bio', ''))

    # Safe extraction of numbers
    def safe_int(key):
        try:
            val = data.get(key, 0)
            return int(val) if val is not None else 0
        except:
            return 0

    return np.array([[
        safe_int('has_profile_pic'),                                
        sum(c.isdigit() for c in username) / max(1, len(username)), 
        len(fullname.split()),                                      
        len(bio),                                                   
        1 if re.search(r'http|www|\.com', bio) else 0,              
        safe_int('is_private'),                             
        safe_int('posts'),                                  
        safe_int('followers'),                              
        safe_int('following')                               
    ]])

# ---------------------------------------------------
# 4. API Route
# ---------------------------------------------------
@app.route('/predict', methods=['POST'])
def predict():
    # 1. Validate Model
    if not model:
        return jsonify({'error': 'Server Error: ML Model not loaded.'}), 500

    # 2. Parse Request
    try:
        req = request.json
        if not req:
            return jsonify({'error': 'No data provided'}), 400
            
        username = req.get('username', 'unknown')
        print(f"\n🔎 Request Received for: {username}")

        raw_data = {}

        # -------------------------------------------
        # MODE A: MANUAL INPUT (Prioritize this)
        # -------------------------------------------
        # We check if 'followers' is provided to confirm manual mode
        if 'followers' in req:
            print("📝 Mode: Manual Input")
            raw_data = {
                'username': username,
                'full_name': req.get('full_name', username),
                'bio': req.get('bio', ''),
                'followers': req.get('followers', 0),
                'following': req.get('following', 0),
                'posts': req.get('posts', 0),
                'is_private': int(req.get('is_private', 0)),
                'has_profile_pic': int(req.get('has_profile_pic', 1)),
                'is_verified': 0
            }

        # -------------------------------------------
        # MODE B: AUTO SCRAPER
        # -------------------------------------------
        else:
            print("🕷️ Mode: Auto Scraping")
            if not username or username == 'unknown':
                return jsonify({'error': 'Username is required for auto-analysis'}), 400

            try:
                # Clean username
                clean_username = username.replace('@', '').strip()
                if 'instagram.com' in clean_username:
                    clean_username = clean_username.rstrip('/').split('/')[-1]

                # Attempt Scrape
                profile = instaloader.Profile.from_username(L.context, clean_username)
                
                raw_data = {
                    'username': profile.username,
                    'full_name': profile.full_name,
                    'bio': profile.biography,
                    'followers': profile.followers,
                    'following': profile.followees,
                    'posts': profile.mediacount,
                    'is_private': int(profile.is_private),
                    'has_profile_pic': 1 if profile.profile_pic_url else 0,
                    'profile_pic_url': profile.profile_pic_url,
                    'is_verified': 1 if profile.is_verified else 0
                }
                print("✅ Scraping Successful")

            except Exception as scrape_err:
                print(f"⚠️ Scraping Failed: {scrape_err}")
                return jsonify({
                    'error': 'Could not scrape account (Instagram blocked connection).', 
                    'details': 'Please try "Manual Input" mode instead.'
                }), 400

        # -------------------------------------------
        # 5. Prediction Logic
        # -------------------------------------------
        
        features = extract_features(raw_data)

        prob_fake = model.predict_proba(features)[0][1]
        risk_score = int(prob_fake * 100)
        # Heuristic Adjustment: High following / low followers = SUSPICIOUS
        followers = int(raw_data['followers'])
        following = int(raw_data['following'])
        
        if following > 500 and followers < (following / 5):
            print("🚩 Heuristic: High following ratio detected. Boosting risk score.")
            risk_score += 25

        # Clamp Score
        risk_score = max(1, min(risk_score, 99))
        is_fake = 1 if risk_score > 50 else 0

        response_data = {
            "is_fake": is_fake,
            "risk_score": risk_score,
            "profile_preview": raw_data
        }
        
        print(f"📊 Result: Score {risk_score}% | Fake? {is_fake}")
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Critical Server Error: {e}")
        return jsonify({'error': f'Server Error: {str(e)}'}), 500

@app.route("/profile-pic")
def proxy_profile_pic():
    url = request.args.get("url")
    if not url:
        return "", 400

    try:
        headers = {
            "User-Agent": "Mozilla/5.0"
        }
        resp = requests.get(url, headers=headers, timeout=10)
        return Response(resp.content, content_type=resp.headers["Content-Type"])
    except Exception as e:
        return "", 404
if __name__ == '__main__':
    app.run(debug=True, port=5000)