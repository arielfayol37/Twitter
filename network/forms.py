# import form class from django
from django import forms
   
# import the required models
from .models import Post
   
# create a ModelForm
class newPostForm(forms.ModelForm):
    image = forms.ImageField(required=False)  # Add an ImageField to handle the image upload

    class Meta:
        model = Post
        fields = ['content', 'image']  # Include the 'image' field in the form