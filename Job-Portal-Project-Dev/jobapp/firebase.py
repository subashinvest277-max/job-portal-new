import firebase_admin

from firebase_admin import credentials


cred = credentials.Certificate(
    "jobapp/firebase/firebase-service-account.json"
)

firebase_admin.initialize_app(cred)