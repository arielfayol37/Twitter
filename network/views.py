from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseForbidden
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from .forms import *
from .models import *
from django.shortcuts import get_object_or_404

from .models import User


def index(request):
    context = {
        "posts": Post.objects.all().order_by('-timestamp')
    }
    return render(request, "network/index.html",context)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("network:index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("network:index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("network:index"))
    else:
        return render(request, "network/register.html")


@login_required(login_url='network:login')
def posts(request):
    if request.method == 'POST':
        content = request.POST['content']
        post = Post(user=request.user, content=content)
        post.save()
        return redirect('network:posts')
    # TODO: Reimplement this using Pagination 
    posts = Post.objects.select_related('user').annotate(like_count=Count('likess')).order_by('-timestamp')
    return render(request, 'network/posts.html', {
        'posts': posts,
        'liked_posts': request.user.liked_posts.all()
    })


@login_required(login_url='network:login')
def profile(request, username):
    profile_user = User.objects.get(username=username)
    posts = profile_user.posts.order_by('-timestamp')
    is_following = profile_user.followers.filter(user=request.user).exists()
    return render(request, 'network/profile.html', {
        'profile_user': profile_user,
        'posts': posts,
        'is_following': is_following
    })


@login_required(login_url='network:login')
@csrf_exempt
def like_unlike_post(request, post_id, likepost=None):
    post = get_object_or_404(Post, id=post_id)
    user = request.user

    if request.method == 'POST':
        if likepost == 1:  # Like post
            like = Like.objects.filter(user=user, post=post).first()
            if like is None:
                like = Like(user=user, post=post)
                like.save()
                post.likes.add(user)
            liked = True
        elif likepost == 0:  # Unlike post
            like_queryset = Like.objects.filter(user=user, post=post)
            if like_queryset.exists():
                like_queryset.delete()
                post.likes.remove(user)
            liked = False
        else:  # Not specified
            like_queryset = Like.objects.filter(user=user, post=post)
            if like_queryset.exists():
                like = like_queryset.first()
                post.likes.remove(like.user)
                like.delete()
                liked = False
            else:
                like = Like(user=user, post=post)
                like.save()
                post.likes.add(like.user)
                liked = True

        count = post.num_likes()
        return JsonResponse({'liked': liked, 'count': count})


@login_required(login_url='network:login')
def following(request):
    following_users = request.user.following.values_list('followed_user__id', flat=True)
    posts = Post.objects.filter(user__in=following_users).order_by('-timestamp')
    return render(request, 'network/following.html', {'posts': posts})

@login_required(login_url='network:login')
def new_post(request):
    if request.method == "POST":
        form = newPostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.user = request.user
            post.save()
            messages.success(request, 'post created successfully.')
            return redirect('network:index')
        else:
            messages.error(request, 'There was an error with your submission.')
    else:
        form = newPostForm()

    return render(request, "network/new_post.html", {'form': form})

@login_required(login_url='network:login')
@csrf_exempt
def follow_unfollow_user(request, username):
    target_user = User.objects.get(username=username)
    if request.method == 'POST':
        user = request.user
        # Definitely not the best way to go about it but anyways
        try:
            follower = Follower.objects.get(user=user, followed_user=target_user)
            follower.delete()
            following = False
        except Like.DoesNotExist:
            follower = Follower(user=user, followed_user=target_user)
            follower.save()
            following = True

        num_followers = target_user.followers.count()
        num_following = target_user.following.count()
        context = {
            'following': following, 
            'num_followers': num_followers,
            'num_following': num_following
        }
        return JsonResponse(context)
