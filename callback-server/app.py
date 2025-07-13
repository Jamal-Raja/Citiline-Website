from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import traceback

app = Flask(__name__)

# Dynamically handle CORS origins
def cors_config():
    allowed_origins = [
        "https://jamal-raja.github.io",  # Production origin
        "http://127.0.0.1:5500",         # Local development origin
        "http://localhost:5500"          # Alternative local origin
    ]
    return {'origins': allowed_origins}

CORS(app, resources={
    r"/callback": cors_config(),
    r"/tax-enquiry": cors_config()
}, supports_credentials=True)

SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL")

@app.route("/")
def home():
    return "✅ Flask server is running!"

@app.route("/callback", methods=["POST", "OPTIONS"])
def callback():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        origin = request.headers.get('Origin')
        if origin in ["https://jamal-raja.github.io", "http://127.0.0.1:5500", "http://localhost:5500"]:
            response.headers.add("Access-Control-Allow-Origin", origin)
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200

    if not SLACK_WEBHOOK_URL:
        return jsonify({"success": False, "message": "Server misconfiguration: missing Slack webhook URL"}), 500

    try:
        if not request.is_json:
            return jsonify({"success": False, "message": "Request body must be JSON"}), 400

        data = request.get_json(force=True)
        print("📩 Received data:", data)

        required_fields = ['name', 'phone', 'email', 'date', 'time', 'message']
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing_fields)}"}), 400

        slack_text = (
            "*📞 New Callback Request Received:*\n"
            f"👤 *Name*: {data['name']}\n"
            f"📧 *Email*: {data['email']}\n"
            f"📱 *Phone*: {data['phone']}\n"
            f"📅 *Date*: {data['date']}\n"
            f"🕒 *Time*: {data['time']}\n"
            f"💬 *Message*: {data['message']}"
        )

        response = requests.post(SLACK_WEBHOOK_URL, json={"text": slack_text}, timeout=10)
        print("✅ Slack status:", response.status_code)
        print("📨 Slack response:", response.text)

        if response.status_code == 200:
            return jsonify({"success": True, "message": "Callback request sent successfully!"}), 200
        else:
            return jsonify({"success": False, "message": f"Failed to post to Slack: {response.text}"}), 500

    except requests.RequestException as e:
        print("💥 Slack request error:", str(e))
        traceback.print_exc()
        return jsonify({"success": False, "message": f"Failed to connect to Slack: {str(e)}"}), 500
    except Exception as e:
        print("💥 Unexpected error:", str(e))
        traceback.print_exc()
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route("/tax-enquiry", methods=["POST", "OPTIONS"])
def tax_enquiry():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        origin = request.headers.get('Origin')
        if origin in ["https://jamal-raja.github.io", "http://127.0.0.1:5500", "http://localhost:5500"]:
            response.headers.add("Access-Control-Allow-Origin", origin)
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200

    if not SLACK_WEBHOOK_URL:
        return jsonify({"success": False, "message": "Server misconfiguration: missing Slack webhook URL"}), 500

    try:
        if not request.is_json:
            return jsonify({"success": False, "message": "Request body must be JSON"}), 400

        data = request.get_json(force=True)
        print("📩 Received tax enquiry data:", data)

        required_fields = ['name', 'email']
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing_fields)}"}), 400

        slack_text = (
            "*📧 New Enquiry Received:*\n"
            f"👤 *Name*: {data['name']}\n"
            f"📧 *Email*: {data['email']}\n"
            f"📱 *Phone*: {data['phone'] or 'Not provided'}\n"
            f"🏢 *Company*: {data['company'] or 'Not provided'}\n"
            f"💼 *Service Required*: {data['service'] or 'Not specified'}\n"
            f"💬 *Message*: {data['message'] or 'None'}"
        )

        response = requests.post(SLACK_WEBHOOK_URL, json={"text": slack_text}, timeout=10)
        print("✅ Slack status:", response.status_code)
        print("📨 Slack response:", response.text)

        if response.status_code == 200:
            return jsonify({"success": True, "message": "Tax enquiry sent successfully!"}), 200
        else:
            return jsonify({"success": False, "message": f"Failed to post to Slack: {response.text}"}), 500

    except requests.RequestException as e:
        print("💥 Slack request error:", str(e))
        traceback.print_exc()
        return jsonify({"success": False, "message": f"Failed to connect to Slack: {str(e)}"}), 500
    except Exception as e:
        print("💥 Unexpected error:", str(e))
        traceback.print_exc()
        return jsonify({"success": False, "message": "Internal server error"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)