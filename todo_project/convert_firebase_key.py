import json

with open("firebase_key.json") as f:
    data = json.load(f)

print("Add the following lines to your .env file:\n")
print(f"FIREBASE_PROJECT_ID={data['project_id']}")
print(f"FIREBASE_PRIVATE_KEY_ID={data['private_key_id']}")
print("FIREBASE_PRIVATE_KEY=" + data["private_key"])
print(f"FIREBASE_CLIENT_EMAIL={data['client_email']}")
print(f"FIREBASE_CLIENT_ID={data['client_id']}")
print(f"FIREBASE_CLIENT_CERT={data['client_x509_cert_url']}")