from flask import Flask, request, jsonify
import os
import requests

app = Flask(__name__)

SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL")

@app.route("/callback", methods=["POST"])
def callback():
    try:
        if request.content_type != "application/json":
            return jsonify({"error": "Content-Type must be application/json"}), 400

        data = request.get_json(force=True)

        name = data.get("name")
        phone = data.get("phone")
        email = data.get("email")
        callback_date = data.get("callbackDate")
        callback_time = data.get("callbackTime")
        message = data.get("message")

        if not all([name, phone, email, callback_date, callback_time, message]):
            return jsonify({"error": "Missing required fields"}), 400

        slack_message = {
            "text": f"📞 *New Callback Request*\n*Name:* {name}\n*Phone:* {phone}\n*Email:* {email}\n*Date:* {callback_date}\n*Time:* {callback_time}\n*Message:* {message}"
        }

        slack_response = requests.post(SLACK_WEBHOOK_URL, json=slack_message)
        if slack_response.status_code != 200:
            return jsonify({"error": "Failed to send to Slack"}), 500

        return jsonify({"success": True, "message": "Callback request sent successfully."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # fallback to 5000 locally
    app.run(host='0.0.0.0', port=port)
