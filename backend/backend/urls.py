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
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('register', views.register_user, name='register_user'),
    path('login', views.issue_token, name='issue_token'),
    path('logout', views.logout, name='logout'),
    path('posts', views.post_list, name='posts'),
    path('post/create', views.create_post, name='create_post'),
    path('post/<int:post_id>/edit', views.edit_post, name='edit_post'),
    path('post/<int:post_id>/delete', views.delete_post, name='delete_post'),
    path('post/<int:post_id>/like', views.like_post, name='like_post'),
    path('post/<int:post_id>/like/remove', views.remove_like, name='remove_like'),
    path('post/<int:post_id>/dislike', views.dislike_post, name='dislike_post'),
    path('post/<int:post_id>/dislike/remove', views.remove_dislike, name='remove_dislike'),
    path('post/<int:post_id>/comment', views.comment_post, name='comment_post'),
    path('user', views.user, name='user'),
]

# Для раздачи медиафайлов в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
