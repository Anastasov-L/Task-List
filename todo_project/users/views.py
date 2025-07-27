from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import PublicUserSerializer, RegisterSerializer
from .authentication import FirebaseOptionalAuthentication
from .permissions import is_admin
from firebase_admin import auth
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


class AuthCheckView(APIView):
    authentication_classes = [FirebaseOptionalAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({"detail": "Unauthorized"}, status=401)

        return Response(PublicUserSerializer(user).data)

class PublicUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.none()
    serializer_class = PublicUserSerializer
    permission_classes = [AllowAny]
    authentication_classes = [FirebaseOptionalAuthentication]

    def get_queryset(self):
            user = self.request.user
            if user and user.is_authenticated and is_admin(user):
                return User.objects.all()
            else:
                return User.objects.exclude(user_type='admin')


import logging
logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        user = request.user
        is_authenticated = user
        data = request.data.copy()
        print("📨 Incoming register data:", data)

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=423)

        if User.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=411)

        serializer = RegisterSerializer(data=data)
        if not serializer.is_valid():
            print(" Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=499)

        saved_user = serializer.save()

        try:
            user_record = auth.create_user(email=email, password=password)
            saved_user.firebase_uid = user_record.uid
            saved_user.save()
        except Exception as e:
            saved_user.delete()  # failure cleanup
            return Response({"error": f"Firebase user creation failed: {e}"}, status=500)

        return Response({"message": "User registered successfully"}, status=201)