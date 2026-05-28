from rest_framework import serializers
from django.contrib.auth import get_user_model
from sbi_backend.utils.validators import validate_phone_number
from sbi_backend.utils.security import validate_email, validate_password_strength

User = get_user_model()

def validate_password_custom(password):
    """Custom password validation"""
    is_valid, message = validate_password_strength(password)
    if not is_valid:
        raise serializers.ValidationError(message)

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'first_name', 'last_name', 'role', 'phone_number', 
                  'location_region', 'is_verified', 'created_at']
        read_only_fields = ['id', 'is_verified', 'created_at']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.get_full_name()


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password_custom])
    confirm_password = serializers.CharField(write_only=True, required=True)
    full_name = serializers.CharField(required=True, write_only=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    location_region = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['sme', 'investor'], required=False, default='sme')
    
    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'confirm_password', 'role', 
                  'phone_number', 'location_region']
    
    def validate_email(self, value):
        if not validate_email(value):
            raise serializers.ValidationError("Invalid email format")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value.lower()
    
    def validate_phone_number(self, value):
        if value and not validate_phone_number(value):
            raise serializers.ValidationError("Invalid phone number format")
        return value
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        full_name = validated_data.pop('full_name', '')
        parts = full_name.split(' ', 1)
        validated_data['first_name'] = parts[0] if parts else ''
        validated_data['last_name'] = parts[1] if len(parts) > 1 else ''
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    role = serializers.ChoiceField(choices=['sme', 'investor'], required=False, allow_blank=True)
    device_fingerprint = serializers.CharField(required=False, allow_blank=True)
    device_info = serializers.JSONField(required=False)
    
    def validate_email(self, value):
        if not validate_email(value):
            raise serializers.ValidationError("Invalid email format")
        return value.lower()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password_custom])
    confirm_new_password = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "Passwords do not match"})
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.CharField(required=True)
    
    def validate_email(self, value):
        if not validate_email(value):
            raise serializers.ValidationError("Invalid email format")
        return value.lower()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password_custom])
    confirm_new_password = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "Passwords do not match"})
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone_number', 'location_region']
        read_only_fields = ['id', 'email']