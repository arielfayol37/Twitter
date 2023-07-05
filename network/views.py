import json
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
from django.middleware import csrf

from .models import User

from django.core.paginator import Paginator
def index(request):
    # Get all posts ordered by timestamp
    posts = Post.objects.all().order_by('-timestamp')

    # Create a Paginator object with 10 posts per page
    paginator = Paginator(posts, 10)

    # Get the current page number from the request's GET parameters
    page_number = request.GET.get('page', 1)

    # Get the Page object for the specified page number
    page = paginator.get_page(page_number)

    context = {
        'page': page
    }
    return render(request, 'network/index.html', context)

def post(request, post_id):
    # Get all posts ordered by timestamp
    post = get_object_or_404(Post, id=post_id)
    # TODO: Handle the error in case the post doesn't exist
    replies = post.replies.all().order_by('-timestamp')

    # Create a Paginator object with 10 posts per page
    paginator = Paginator(replies, 10)

    # Get the current page number from the request's GET parameters
    page_number = request.GET.get('page', 1)

    # Get the Page object for the specified page number
    page = paginator.get_page(page_number)

    context = {
        'page': page,
        'post': post
    }
    return render(request, 'network/post.html', context)


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
    
    # Create a Paginator object with 10 posts per page
    paginator = Paginator(posts, 10)

    # Get the current page number from the request's GET parameters
    page_number = request.GET.get('page', 1)

    # Get the Page object for the specified page number
    page = paginator.get_page(page_number)
    is_following = profile_user.followers.filter(user=request.user).exists()

    if request.method == 'POST':
        form = ProfilePictureForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
    else:
        form = ProfilePictureForm(instance=request.user)

    context = {
        'page': page,
        'posts': posts,
        'profile_user': profile_user,
        'is_following': bool(is_following),
        'form': form
    }
    return render(request, 'network/profile.html', context)
    


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

            liked = not like_queryset.exists()

            if liked:
                like = Like(user=user, post=post)
                like.save()
                post.likes.add(user)
            else:
                like_queryset.delete()
                post.likes.remove(user)

            count = post.num_likes()
            return JsonResponse({'liked': liked, 'count': count})


@login_required(login_url='network:login')
def following(request):
    following_users = request.user.following.values_list('followed_user__id', flat=True)
    posts = Post.objects.filter(user__in=following_users).order_by('-timestamp')
    # Create a Paginator object with 10 posts per page
    paginator = Paginator(posts, 10)

    # Get the current page number from the request's GET parameters
    page_number = request.GET.get('page', 1)

    # Get the Page object for the specified page number
    page = paginator.get_page(page_number)
    context = {'page': page}
    return render(request, 'network/following.html', context)

@login_required(login_url='network:login')
def new_post(request):
    if request.method == "POST":
        form = newPostForm(request.POST, request.FILES)  # Include request.FILES in the form initialization
        if form.is_valid():
            post = form.save(commit=False)
            post.user = request.user
            post.save()
            messages.success(request, 'Post created successfully.')
            return redirect('network:index')
        else:
            messages.error(request, 'There was an error with your submission.')
    else:
        form = newPostForm()

    return render(request, "network/new_post.html", {'form': form})

@login_required(login_url='network:login')
@csrf_exempt
def modify_post(request, post_id):
    if request.method == 'POST':
        try:
            post = Post.objects.get(id=post_id)
            if request.user != post.user:
                return HttpResponseForbidden("You are not authorized to modify this post.")
            data = json.loads(request.body)
            # Retrieve the updated content from the request body
            content = data.get('content', '')

            # Update the post content
            post.content = content
            post.save()

            # Return a JSON response indicating the success
            return JsonResponse({'success': True})
        except Post.DoesNotExist:
            # Return a JSON response indicating the failure
            return JsonResponse({'success': False, 'error': 'Post not found'})
    
    # Return a JSON response indicating the incorrect HTTP method
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required(login_url='network:login')
@csrf_exempt
def follow_unfollow_user(request, username):
    target_user = User.objects.get(username=username)
    if request.method == 'POST':
        user = request.user

        # Definitely not the best way to go about it but anyways
        follow_queryset = Follower.objects.filter(user=user, followed_user=target_user)
        isfollowing = not follow_queryset.exists()

        if isfollowing:
            follow = Follower(user=user, followed_user=target_user)
            follow.save()
            # user.following.add(target_user) No need for the Follower model

        else:
            follow = follow_queryset.delete()
            # user.following.remove(target_user) No need for the Follower model
            
        
            

        num_followers = target_user.followers.count()
        num_following = target_user.following.count()
        context = {
            'following': isfollowing, 
            'num_followers': num_followers,
            'num_following': num_following,
            'success':True
        }
        return JsonResponse(context)

@login_required(login_url='network:login')
@csrf_exempt
def like_unlike_reply(request, reply_id):
    reply = get_object_or_404(Reply, id=reply_id)
    user = request.user
    if request.method == 'POST':

        like_queryset = LikeReply.objects.filter(user=user, reply=reply)
        liked = not like_queryset.exists()

        if liked:
            like = LikeReply(user=user, reply=reply)
            like.save()
            reply.likes.add(user)
        else:
            like_queryset.delete()
            reply.likes.remove(user)

        count = reply.num_likes()
        return JsonResponse({'liked': liked, 'count': count})
    

@login_required(login_url='network:login')
def new_reply(request):
    if request.method == "POST":
        form = newReplyForm(request.POST, request.FILES)  # Include request.FILES in the form initialization
        if form.is_valid():
            reply = form.save(commit=False)
            reply.user = request.user
            reply.save()
            messages.success(request, 'Post created successfully.')
            return redirect('network:index')
        else:
            messages.error(request, 'There was an error with your submission.')
    else:
        reply = newPostForm()
    # TODO: Return a JSON instead
    return render(request, "network/new_post.html", {'form': form})


@login_required(login_url='network:login')
def reply_post(request, post_id):
    if request.method == "POST":
        try:
            post = Post.objects.get(id=post_id)
            reply = Reply(user=request.user, post = post)
            data = json.loads(request.body)
            # retrieve the content of the reply
            content = data.get('content')
            reply.content = content
            reply.save()
            hasProfilePic = bool(reply.user.profile_picture)
            if hasProfilePic:
                profilePicUrl = reply.user.profile_picture.url
            else:
                profilePicUrl = None
            # Return JSON response with the info normally used to render
            # reply_display.html. This is will be used by reply.js
            context = {
                'success': True,
                'replyId': reply.id,
                'userLink': reverse('network:profile', kwargs={'username': reply.user.username}),
                'replyUsername': reply.user.username,
                # 'replyImageUrl': reply.image.url, For later, in case there will be images for replies
                'userIsAuthenticated':True,
                'replyInUserLikedReplies':False,
                'replyNumLikes': 0, # when someone just posts, there are no likes yet. same for replies
                'replyTimestamp': 'Just now',
                'userIsReplyUser': True,
                # 'csrfToken': csrf.get_token(request), may use this later
                'replyContent': content,
                'numReplies': 0,
                'hasProfilePic':hasProfilePic,
                'profilePicUrl':profilePicUrl

            }

            return JsonResponse(context)
        except Post.DoesNotExist:
            # Return a JSON response indicating the failure
            return JsonResponse({'success': False, 'error': 'Post not found'})
    # Return a JSON response indicating the incorrect HTTP method
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


@login_required(login_url='network:login')
@csrf_exempt
def modify_reply(request, reply_id):
    if request.method == 'POST':
        try:
            reply = Reply.objects.get(id=reply_id)
            if request.user != reply.user:
                return HttpResponseForbidden("You are not authorized to modify this post.")
            data = json.loads(request.body)
            # Retrieve the updated content from the request body
            content = data.get('content', '')

            # Update the reply content
            reply.content = content
            reply.save()

            # Return a JSON response indicating the success
            return JsonResponse({'success': True})
        except Post.DoesNotExist:
            # Return a JSON response indicating the failure
            return JsonResponse({'success': False, 'error': 'Reply not found'})
    
    # Return a JSON response indicating the incorrect HTTP method
    return JsonResponse({'success': False, 'error': 'Invalid request method'})