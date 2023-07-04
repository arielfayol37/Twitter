from django.contrib import admin

# Register your models here.
from .models import User, Post, Like, LikeReply, Follower

admin.site.register(User)
admin.site.register(Post)
admin.site.register(Like)
admin.site.register(LikeReply)
admin.site.register(Follower)