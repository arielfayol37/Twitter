# import form class from django
from django import forms
   
# import the required models
from .models import Post
   
# create a ModelForm
class newPostForm(forms.ModelForm):

    class Meta:
        model = Post
        fields = ["content"]