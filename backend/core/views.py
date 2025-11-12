from rest_framework.response import Response
from .serializers import UserSerializer, IssueTokenRequestSerializer, TokenSerializer, PostSerializer, LikeSerializer, DislikeSerializer, CommentSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.request import Request
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from .models import Post, Like, Dislike, Comment
from django.db.models import Count
import json

# Создание пользователя
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request: Request):
  data = request.data
  required_fields = ['username', 'password', 'first_name', 'last_name']
  missing = [field for field in required_fields if not data.get(field) or not str(data.get(field)).strip()]
  if missing:
    return Response({'error': f'Поля не могут быть пустыми: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)
  if User.objects.filter(username=data['username']).exists():
    return Response({'error': 'Имя пользователя занято'}, status=status.HTTP_400_BAD_REQUEST)
  try:
    user = User.objects.create(
      username = data['username'],
      password = make_password(data['password']),
      first_name = data['first_name'],
      last_name = data['last_name']
    )
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
  except Exception as e:
    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Авторизация
@api_view(['POST'])
@permission_classes([AllowAny])
def issue_token(request: Request):
  serializer = IssueTokenRequestSerializer(data=request.data)
  if serializer.is_valid():
    authenticated_user = authenticate(**serializer.validated_data)
    if not authenticated_user:
      return Response({"error": "Неверное имя пользователя или пароль"}, status=status.HTTP_401_UNAUTHORIZED)
    try:
      token = Token.objects.get(user=authenticated_user)
    except Token.DoesNotExist:
      token = Token.objects.create(user=authenticated_user)
    return Response(TokenSerializer(token).data)
  else:
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Логаут
@api_view(['POST'])
def logout(request: Request):
  token = request.META.get('HTTP_AUTHORIZATION')
  token_value = None
  if token and token.startswith('Token '):
    token_value = token.split()[1]
  else:
    try:
      data = json.loads(request.body)
      token_value = data.get('token')
    except Exception:
      pass

  user = None
  if token_value:
    try:
      user = Token.objects.get(key=token_value).user
    except Token.DoesNotExist:
      pass

  if user:
    try:
      user.auth_token.delete()
    except Exception:
      return Response({"error": "Ошибка при выходе"}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": "Вы успешно вышли"}, status=status.HTTP_200_OK)
  return Response({"error": "Пользователь не найден или не авторизован"}, status=status.HTTP_401_UNAUTHORIZED)

# Список постов
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def post_list(request: Request):
  ordering = request.query_params.get('ordering', '-created')
  allowed_orderings = ['created', '-created', 'liked', 'commented']
  if ordering not in allowed_orderings:
    ordering = '-created'
  if ordering == 'liked':
    posts = Post.objects.annotate(likes_count=Count('likes')).order_by('-likes_count')
  elif ordering == 'commented':
    posts = Post.objects.annotate(comments_count=Count('comments')).order_by('-comments_count')
  else:
    posts = Post.objects.all().order_by(ordering)
  serializer = PostSerializer(posts, many=True, context={'request': request})
  return Response(serializer.data)

# Добавить пост
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def create_post(request: Request):
  serializer = PostSerializer(data=request.data)
  if serializer.is_valid():
    serializer.validated_data['owner'] = request.user
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)
  return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Изменить пост
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def edit_post(request: Request, post_id: int):
  try:
     post = Post.objects.get(id = post_id)
  except Post.DoesNotExist:
    return Response({"error": "Пост не найден"}, status=status.HTTP_404_NOT_FOUND) 
  
  if post.owner != request.user:
    return Response({"error": "Только автор поста может редактировать его"}, status=status.HTTP_403_FORBIDDEN)

  serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})
  if serializer.is_valid():
    serializer.save(update_fields=['title', 'info', 'image'])
    return Response(serializer.data)
  return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Удалить пост
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def delete_post(request: Request, post_id: int):
  try:
    post = Post.objects.get(id = post_id)
  except Post.DoesNotExist:
    return Response({"error": "Пост не найден"}, status=status.HTTP_404_NOT_FOUND)
  
  if post.owner != request.user:
    return Response({"error": "Только автор поста может удалить его"}, status=status.HTTP_403_FORBIDDEN)
  
  post.delete()
  return Response(status=status.HTTP_204_NO_CONTENT)

# Лайк посту
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def like_post(request: Request, post_id: int):
  try:
    post = Post.objects.get(id = post_id)
  except Post.DoesNotExist:
    return Response({"error": "Пост не найден"}, status=status.HTTP_404_NOT_FOUND)

  Dislike.objects.filter(post = post_id, user = request.user).delete()
  like, created = Like.objects.get_or_create(post = post, user=request.user)
  if not created:
    return Response({"detail": "Лайк уже поставлен"}, status=status.HTTP_400_BAD_REQUEST)

  return Response(PostSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)

# Удаление лайка
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def remove_like(request: Request, post_id: int):
  try:
    post = Post.objects.get(id=post_id)
  except Post.DoesNotExist:
    return Response({"error": "Пост не найден"}, status=status.HTTP_404_NOT_FOUND)

  deleted, _ = Like.objects.filter(post=post, user=request.user).delete()
  if deleted == 0:
    return Response({"detail": "Лайк не найден"}, status=status.HTTP_404_NOT_FOUND)
  return Response(PostSerializer(post, context={'request': request}).data)

# Дислайк посту
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def dislike_post(request: Request, post_id: int):
  try:
    post = Post.objects.get(id = post_id)
  except Post.DoesNotExist:
    return Response({"error": "Пост не найден"}, status=status.HTTP_404_NOT_FOUND)

  Like.objects.filter(post = post_id, user = request.user).delete()
  dislike, created = Dislike.objects.get_or_create(post = post, user=request.user)
  if not created:
    return Response({"detail": "Дислайк уже поставлен"}, status=status.HTTP_400_BAD_REQUEST)

  return Response(PostSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)

# Удаление дизлайка
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def remove_dislike(request: Request, post_id: int):
  try:
    post = Post.objects.get(id=post_id)
  except Post.DoesNotExist:
    return Response({"error": "Пост не найден"}, status=status.HTTP_404_NOT_FOUND)

  deleted, _ = Dislike.objects.filter(post=post, user=request.user).delete()
  if deleted == 0:
    return Response({"detail": "Дислайк не найден"}, status=status.HTTP_404_NOT_FOUND)
  return Response(PostSerializer(post, context={'request': request}).data)

# Комментарий посту
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def comment_post(request: Request, post_id: int):
  try:
    post = Post.objects.get(id = post_id)
  except Post.DoesNotExist:
    return Response({"error": "Пост не найден"}, status=status.HTTP_404_NOT_FOUND)

  text = request.data.get('text', '').strip()
  if not text:
    return Response({"error": "Комментарий не может быть пустым"}, status=status.HTTP_400_BAD_REQUEST)

  comment = Comment.objects.create(
    user = request.user,
    post = post,
    text = text
  )

  return Response({
    'post': PostSerializer(post, context={'request': request}).data,
    'comment': CommentSerializer(comment).data
  }, status=status.HTTP_201_CREATED)

# Получение информации о текущем пользователе
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def user(request: Request):
  return Response({
    'data': UserSerializer(request.user).data
  })