from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Post, Like, Dislike, Comment

class UserSerializer(serializers.ModelSerializer):
  posts = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

  class Meta:
    model = User
    fields = ['id', 'username', 'first_name', 'last_name', 'posts']

class IssueTokenRequestSerializer(serializers.Serializer):
  model = User
  username = serializers.CharField(required=True)
  password = serializers.CharField(required=True)

class TokenSerializer(serializers.ModelSerializer):

  class Meta:
    model = Token
    fields = ['key']

class PostSerializer(serializers.ModelSerializer):
  title = serializers.CharField(required=True)
  info = serializers.CharField(required=False, allow_blank=True)
  image = serializers.ImageField(required=False, allow_null=True)
  likes = serializers.SerializerMethodField()
  dislikes = serializers.SerializerMethodField()
  comments = serializers.SerializerMethodField()
  comments_list = serializers.SerializerMethodField()
  isliked = serializers.SerializerMethodField()
  isdisliked = serializers.SerializerMethodField()

  class Meta:
    model = Post
    fields = ['id', 'title', 'info', 'image', 'owner', 'created', 'likes', 'dislikes', 'comments', 'comments_list', 'isliked', 'isdisliked']
    read_only_fields = ['id', 'owner', 'created', 'likes', 'dislikes', 'comments', 'comments_list', 'isliked', 'isdisliked']

  def get_likes(self, obj):
    return obj.like_count()
  
  def get_dislikes(self, obj):
    return obj.dislike_count()
  
  def get_comments(self, obj):
    return obj.comment_count()

  def get_comments_list(self, obj):
    comments = Comment.objects.filter(post=obj).order_by('created')
    return CommentSerializer(comments, many=True).data

  def get_isliked(self, obj):
    request = self.context.get('request', None)
    print(request)
    if request and request.user.is_authenticated:
      return Like.objects.filter(user=request.user, post=obj).exists()
    return False
  
  def get_isdisliked(self, obj):
    request = self.context.get('request', None)
    print(request)
    if request and request.user.is_authenticated:
      return Dislike.objects.filter(user=request.user, post=obj).exists()
    return False

class LikeSerializer(serializers.ModelSerializer):
  class Meta:
    model = Like
    fields = ['user', 'post', 'created']
    read_only_fields = ['created']

class DislikeSerializer(serializers.ModelSerializer):
  class Meta:
    model = Dislike
    fields = ['user', 'post', 'created']
    read_only_fields = ['created']

class CommentSerializer(serializers.ModelSerializer):
  author = serializers.SerializerMethodField()

  class Meta:
    model = Comment
    fields = ['id', 'user', 'author', 'post', 'created', 'text']
    read_only_fields = ['id', 'created']

  def get_author(self, obj):
    u = obj.user
    return {
      'id': u.id,
      'username': u.username,
      'first_name': u.first_name,
      'last_name': u.last_name,
    }