import firebase_admin
from firebase_admin import auth, credentials
from rest_framework import authentication
from django.conf import settings
from users.models import User

if not firebase_admin._apps:
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": settings.FIREBASE_PROJECT_ID,
        "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
        "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
        "client_email": settings.FIREBASE_CLIENT_EMAIL,
        "client_id": settings.FIREBASE_CLIENT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": settings.FIREBASE_CLIENT_CERT,
        "universe_domain": "googleapis.com"
    })
    firebase_admin.initialize_app(cred)


class NoAuthToken(Exception):
    pass

class InvalidAuthToken(Exception):
    pass

class FirebaseError(Exception):
    pass


class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        print(auth_header)
        if not auth_header:
            raise NoAuthToken("No auth token provided")

        id_token = auth_header.split(" ").pop()
        return handle_auth(id_token, throw_error=True)

class FirebaseOptionalAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):

        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if not auth_header:
            return None

        id_token = auth_header.split(" ").pop()
        return handle_auth(id_token)


def authenticate_token(id_token):
    return handle_auth(id_token)

def handle_auth(id_token, throw_error=False):
    try:
        decoded_token = auth.verify_id_token(id_token)
    except Exception as err:
        if throw_error:
            raise InvalidAuthToken("Invalid auth token")
        return None

    if not id_token or not decoded_token:
        return None

    try:
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")

        if not email:
                if throw_error:
                    raise FirebaseError("No email in token")
                return None

        try:
            user = User.objects.get(firebase_uid=uid)
            return user, False
        except User.DoesNotExist:
            try:
                existing_user = User.objects.get(email=email)
                existing_user.firebase_uid = uid
                existing_user.save()
                return existing_user, False
            except User.DoesNotExist:
                user = User.objects.create(firebase_uid=uid, email=email)
                return user, True

    except Exception:
        if throw_error:
            raise FirebaseError()
        return None

    user, created = User.objects.get_or_create(firebase_uid=uid)
    return (user, None)