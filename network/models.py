from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    profile_picture = models.ImageField(upload_to='network/images/profile_images/', blank=True, null=True)


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='network/images/post_images/', blank=True, null=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.content[:50]}"

    def num_likes(self):
        return self.likes.count()
    def num_replies(self):
        return self.replies.count()

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likess')

    def __str__(self):
        return f"{self.user.username} likes {self.post}"
    


class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    followed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')

    def __str__(self):
        return f"{self.user.username} follows {self.followed_user.username}"

    
class Reply(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='replies')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='replies')
    parent_reply = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='network/images/reply_images/', blank=True, null=True)
    likes = models.ManyToManyField(User, related_name='liked_replies', blank=True)

    def __str__(self):
        if self.parent_reply is None:
            return f"{self.user.username} replying to {self.post}"
        else:
            return f"{self.user.username} replied to {self.parent_reply}"
    def num_likes(self):
        return self.likes.count()
    def num_replies(self):
        return self.replies.count()
    
class LikeReply(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reply = models.ForeignKey(Reply, on_delete=models.CASCADE, related_name='repliess')

    def __str__(self):
        return f"{self.user.username} likes {self.reply}"
