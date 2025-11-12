from django.db import models
from django.core.validators import MaxLengthValidator
from django.contrib.auth.models import User

class Post(models.Model):
  created = models.DateTimeField(
    auto_now_add=True
  )
  owner = models.ForeignKey(
    User, 
    on_delete=models.CASCADE,
    related_name='posts'
  )
  title = models.CharField(
    max_length=250, 
    blank=True,
    validators=[MaxLengthValidator(250)]
  )
  info = models.CharField(
    max_length=700, 
    blank=True,
    validators=[MaxLengthValidator(700)]
  )
  image = models.ImageField(
    upload_to='posts/images/',
    null=True,
    blank=True,
    default=None
  )

  class Meta:
    ordering = ['created']
    db_table = 'post'
  
  def like_count(self):
    return self.likes.count()
  
  def dislike_count(self):
    return self.dislikes.count()
  
  def comment_count(self):
    return self.comments.count()

  def __str__(self):
    return self.title

class Like(models.Model):
  user = models.ForeignKey(
    User, 
    on_delete=models.CASCADE,
    related_name='likes'
  )
  post = models.ForeignKey(
    Post, 
    on_delete=models.CASCADE,
    related_name='likes'
  )
  created = models.DateTimeField(
    auto_now_add=True
  )

  class Meta:
    db_table = 'like'
    unique_together = [['post', 'user']]

  def __str__(self):
    return f"{self.user}: Like to {self.post}"

class Dislike(models.Model):
  user = models.ForeignKey(
    User, 
    on_delete=models.CASCADE,
    related_name='dislikes'
  )
  post = models.ForeignKey(
    Post, 
    on_delete=models.CASCADE,
    related_name='dislikes'
  )
  created = models.DateTimeField(
    auto_now_add=True
  )

  class Meta:
    db_table = 'dislike'
    unique_together = [['post', 'user']]

  def __str__(self):
    return f"{self.user}: Dislike to {self.post}"

class Comment(models.Model):
  user = models.ForeignKey(
    User, 
    on_delete=models.CASCADE,
    related_name='comments'
  )
  post = models.ForeignKey(
    Post, 
    on_delete=models.CASCADE,
    related_name='comments'
  )
  created = models.DateTimeField(
    auto_now_add=True
  )
  text = models.CharField(
    max_length=500,
    blank=False,
    validators=[MaxLengthValidator(500)]
  )

  class Meta:
    db_table = 'comment'
    unique_together = [['post', 'user']]

  def __str__(self):
    return f"{self.user}: Comment to {self.post}"