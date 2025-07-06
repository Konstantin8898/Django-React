from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Post


class UserSerializer(serializers.ModelSerializer):
    posts = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'posts']


class PostSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True)
    desc = serializers.CharField(required=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'desc', 'owner', 'created']
        read_only_fields = ['id', 'owner', 'created']


class IssueTokenRequestSerializer(serializers.Serializer):
    model = User
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)


class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = ['key']
