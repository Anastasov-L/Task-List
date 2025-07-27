from rest_framework import serializers
from .models import User

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
                  'id',  'firebase_uid', 'email', 'phone', 'first_name', 'last_name',
                    'birthday', 'is_active', 'user_type', 'created_at'
                ]

class RegisterSerializer(serializers.ModelSerializer):
    user_type = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = [
            'firebase_uid',
            'email',
            'password',
            'first_name',
            'last_name',
            'phone',
            'birthday',
            'user_type',
            'is_active',
        ]
        extra_kwargs = {
            'firebase_uid': {'required': False},
                'password': {'write_only': True},
                'user_type': {'required': False},
                'is_active': {'required': False},
                'first_name': {'required': False, 'allow_blank': True},
                'last_name': {'required': False, 'allow_blank': True},
                'phone': {'required': False, 'allow_blank': True},
                'birthday': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        validated_data.pop('password', None)
        validated_data.setdefault('user_type', 'user')
        validated_data.setdefault('is_active', True)
        return User.objects.create(**validated_data)
