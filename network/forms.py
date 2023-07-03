# import form class from django
from django import forms
   
# import the required models
from .models import Post, Reply
   
# create a ModelForm
class newPostForm(forms.ModelForm):
    image = forms.ImageField(required=False, widget=forms.FileInput(attrs={'placeholder': 'Choose Image'}))  # Add an ImageField to handle the image upload

    class Meta:
        model = Post
        fields = ['content', 'image']  # Include the 'image' field in the form

class newReplyForm(forms.ModelForm):
    image = forms.ImageField(required=False, widget=forms.FileInput(attrs={'placeholder': 'Choose Image'}))  # Add an ImageField to handle the image upload
    class Meta:
        model = Reply
        fields = ['content', 'image']  # Include the 'image' field in the form