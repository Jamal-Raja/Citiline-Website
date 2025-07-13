from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os
import traceback

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["https://jamal-raja.github.io"])

# Slack webhook from environment
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")

@app.route('/')
def home():
    return "Flask server is running ✅"

@app.route('/callback', methods=['POST', 'OPTIONS'])
def callback():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    if not SLACK_WEBHOOK_URL:
        print("❌ ERROR: SLACK_WEBHOOK_URL not set")
        return jsonify({
            "success": False,
            "message": "Server misconfiguration: missing Slack webhook URL"
        }), 500

    try:
        data = request.get_json()
        print("📩 Received data:", data)

        # Validate required fields
        required_fields = ['name', 'phone', 'email', 'date', 'time', 'message']
        missing = [field for field in required_fields if not data.get(field)]

        if missing:
            return jsonify({
                "success": False,
                "message": f"Missing fields: {', '.join(missing)}"
            }), 400

        # Construct Slack message
        message = (
            "*📞 New Callback Request*\n"
            f"👤 Name: {data['name']}\n"
            f"📧 Email: {data['email']}\n"
            f"📱 Phone: {data['phone']}\n"
            f"📅 Date: {data['date']}\n"
            f"🕒 Time: {data['time']}\n"
            f"💬 Message: {data['message']}"
        )

        slack_response = requests.post(SLACK_WEBHOOK_URL, json={"text": message})
        print("✅ Slack status:", slack_response.status_code)
        print("📨 Slack response:", slack_response.text)

        if slack_response.status_code == 200:
            return jsonify({
                "success": True,
                "message": "Callback request sent to Slack!"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to post to Slack"
            }), 500

    except Exception as e:
        print("💥 Exception occurred:", str(e))
    traceback.print_exc()  # 👈 This prints the error traceback
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
