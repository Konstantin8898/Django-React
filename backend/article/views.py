from rest_framework.response import Response
from .serializers import UserSerializer, IssueTokenRequestSerializer, TokenSerializer, PostSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.request import Request
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from .models import Post

# Просмотр всего списка статей
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def Post_List(request):
    posts = Post.objects.all().order_by('-created')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

# Запрос на удаление собственных постов
@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_post(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({"error": "Пост не найден"}, status=404)

    # Проверка, является ли текущий пользователь владельцем поста
    if post.owner != request.user:
        return Response({"error": "Только автор поста может удалить его"}, status=403)

    post.delete()
    return Response({"error": "Пост удален"}, status=204)

# Запрос на редактирование собственных постов
@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def edit_post(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({"error": "Пост не найден"}, status=404)

    # Проверка, является ли текущий пользователь владельцем поста
    if post.owner != request.user:
        return Response({"error": "Только автор поста может редактировать его"}, status=403)

    serializer = PostSerializer(post, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save(update_fields=['title', 'desc'])  # изменения только для указанных полей
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# Запрос на добавление собственных постов
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_post(request):
    serializer = PostSerializer(data=request.data)
    if serializer.is_valid():
        serializer.validated_data['owner'] = request.user  # текущий пользователь — владелец поста
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# Запрос на регистрацию нового пользователя
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    try:
        user = User.objects.create(
            username=data['username'],
            password=make_password(data['password']),
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email']
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Запрос на авторизацию пользователя
@api_view(['POST'])
@permission_classes([AllowAny])
def issue_token(request):
    serializer = IssueTokenRequestSerializer(data=request.data)
    if serializer.is_valid():
        authenticated_user = authenticate(**serializer.validated_data)
        if not authenticated_user:
            return Response({"detail": "Неправильные учетные данные"}, status=401)
        try:
            token = Token.objects.get(user=authenticated_user)
        except Token.DoesNotExist:
            token = Token.objects.create(user=authenticated_user)
        return Response(TokenSerializer(token).data)
    else:
        return Response(serializer.errors, status=400)

# Получение информации по токену пользователя
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def user(request: Request):
    return Response({
        'data': UserSerializer(request.user).data
    })
