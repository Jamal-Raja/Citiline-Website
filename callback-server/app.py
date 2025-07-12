from flask import Flask, request, jsonify 
import os
import requests
from dotenv import load_dotenv
from flask_cors import CORS 

load_dotenv()

app = Flask(__name__)

# ✅ Allow only GitHub Pages origin explicitly
CORS(app, origins=["https://jamal-raja.github.io"])

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")


@app.route('/callback', methods=['POST', 'OPTIONS'])  # ✅ include OPTIONS
def callback():
    if request.method == 'OPTIONS':
        # Preflight request: just return OK
        return jsonify({'status': 'ok'}), 200

    if not SLACK_WEBHOOK_URL:
        print("❌ ERROR: SLACK_WEBHOOK_URL not set")
        return jsonify({"success": False, "message": "Server config error (missing webhook URL)"}), 500

    try:
        data = request.json
        print("📩 Received data:", data)

        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email")
        date = data.get("date")
        time = data.get("time")
        message_text = data.get("message")

        message = f"*📞 New Callback Request*\n👤 Name: {name}\n📧 Email: {email}\n📱 Phone: {phone}\n📅 Date: {date}\n🕒 Time: {time}\n💬 Message: {message_text}"

        response = requests.post(SLACK_WEBHOOK_URL, json={"text": message})

        print("✅ Slack response status:", response.status_code)
        print("📨 Slack response body:", response.text)

        if response.status_code == 200:
            return jsonify({"success": True, "message": "Callback request sent to Slack!"}), 200
        else:
            return jsonify({"success": False, "message": "Slack error"}), 500

    except Exception as e:
        print("💥 EXCEPTION:", str(e))
        return jsonify({"success": False, "message": "Server crashed"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
