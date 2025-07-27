import firebase_admin
from firebase_admin import credentials
import os

cred_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    'firebase-key.json'
)

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
