document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners to all like buttons
    const likeButtons = document.querySelectorAll('.like-button');  
    likeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const postId = button.dataset.postId;
        likePost(button, postId);
      });
    });
  
    // Functions to handle like/unlike post
    function likePost(button, postId) {
      fetch(`/like_unlike_post/${postId}`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
      })
        .then(response => response.json())
        .then(data => {
          if (data.liked) {
            button.innerHTML = 'Unlike';
          } else {
            button.innerHTML = 'Like';
          }
  
          const likeCountElement = button.parentNode.querySelector('.like-count');
          likeCountElement.innerHTML = data.count;
        })
        .catch(error => console.log(error));
    }
  
    // Function to get CSRF token from cookies
    function getCookie(name) {
      if (!document.cookie) {
        return null;
      }
  
      const csrfCookie = document.cookie
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith(name + '='));
  
      if (!csrfCookie) {
        return null;
      }
  
      return decodeURIComponent(csrfCookie.split('=')[1]);
    }
  });