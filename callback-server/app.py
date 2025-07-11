from flask import Flask, request, jsonify
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")

@app.route('/callback', methods=['POST'])
def callback():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    date = data.get("date")
    time = data.get("time")

    message = f"📞 *New Callback Request*\n👤 Name: {name}\n📧 Email: {email}\n📅 Date: {date}\n🕑 Time: {time}"

    response = requests.post(SLACK_WEBHOOK_URL, json={"text": message})

    if response.status_code == 200:
        return jsonify({"success": True, "message": "Callback request sent to Slack!"}), 200
    else:
        return jsonify({"success": False, "message": "Failed to send to Slack"}), 500

if __name__ == '__main__':
    app.run(debug=True)
