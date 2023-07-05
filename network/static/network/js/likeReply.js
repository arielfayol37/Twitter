document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners to all like buttons
    const likeButtons = document.querySelectorAll('.rlike-button');
    likeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const replyId = button.dataset.replyId;
        likeReply(button, replyId);
      });
    });
  
    // Functions to handle like/unlike reply
    function likeReply(button, replyId) {
      fetch(`/like_unlike_reply/${replyId}`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
      })
        .then(response => response.json())
        .then(data => {
            if (data.liked) {
                button.innerHTML = '<i class="heart-icon fas fa-heart liked"></i>';
            
              } else {
                button.innerHTML = '<i class="heart-icon far fa-heart"></i>';
        
              }
      
  
          const likeCountElement = button.parentNode.querySelector('.rlike-count');
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
  