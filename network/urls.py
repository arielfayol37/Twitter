from django.urls import path
from . import views

app_name = 'network'

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('register', views.register, name='register'),
    path('posts', views.posts, name='posts'),
    path('profile/<str:username>', views.profile, name='profile'),
    path('user/<str:username>', views.profile, name='profile'),
    path('following', views.following, name='following'),
    path('new_post', views.new_post, name='new_post'),
    path('follow_user/<str:username>', views.follow_unfollow_user, name='follow_user'),
    path('unfollow_user/<str:username>', views.follow_unfollow_user, name='unfollow_user'),
    path('like_post/<int:post_id>/<int:likepost>', views.like_unlike_post, name='like_post'),
    path('unlike_post/<int:post_id>/<int:likepost>', views.like_unlike_post, name='unlike_post'),
    path('like_unlike_post/<int:post_id>', views.like_unlike_post, name='like_unlike_post'),
    path('modify_post/<int:post_id>', views.modify_post, name='modify_post')
]
