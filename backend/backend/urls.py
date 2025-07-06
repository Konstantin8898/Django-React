"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from article import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', views.register_user, name='register_user'),
    path('login/', views.issue_token, name='issue_token'),
    path('posts/', views.Post_List, name='posts'),
    path('post/<int:pk>/delete/', views.delete_post, name='delete_post'),
    path('post/<int:pk>/edit/', views.edit_post, name='edit_post'),
    path('post/create/', views.create_post, name='create_post'),
    path('user/', views.user),
]