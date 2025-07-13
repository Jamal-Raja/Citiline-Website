from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import traceback

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["https://jamal-raja.github.io"])

# Slack webhook from environment
SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL")

@app.route("/")
def home():
    return "✅ Flask server is running!"

@app.route("/callback", methods=["POST", "OPTIONS"])
def callback():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    if not SLACK_WEBHOOK_URL:
        return jsonify({
            "success": False,
            "message": "Server misconfiguration: missing Slack webhook URL"
        }), 500

    try:
        # Ensure JSON
        if not request.is_json:
            return jsonify({
                "success": False,
                "message": "Request body must be JSON"
            }), 400

        data = request.get_json(force=True)
        print("📩 Received data:", data)

        # Validate fields
        required_fields = ['name', 'phone', 'email', 'date', 'time', 'message']
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return jsonify({
                "success": False,
                "message": f"Missing fields: {', '.join(missing_fields)}"
            }), 400

        # Compose Slack message
        slack_text = (
            "*📞 New Callback Request Received:*\n"
            f"👤 *Name*: {data['name']}\n"
            f"📧 *Email*: {data['email']}\n"
            f"📱 *Phone*: {data['phone']}\n"
            f"📅 *Date*: {data['date']}\n"
            f"🕒 *Time*: {data['time']}\n"
            f"💬 *Message*: {data['message']}"
        )

        response = requests.post(SLACK_WEBHOOK_URL, json={"text": slack_text})
        print("✅ Slack status:", response.status_code)
        print("📨 Slack response:", response.text)

        if response.status_code == 200:
            return jsonify({
                "success": True,
                "message": "Callback request sent successfully!"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to post to Slack"
            }), 500

    except Exception as e:
        print("💥 Error:", str(e))
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "Internal server error"
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
