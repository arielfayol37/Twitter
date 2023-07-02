document.addEventListener('DOMContentLoaded', () => {
    const followButton = document.querySelector('.follow-button');
    if (followButton) {
        // if button found on the page, then add event
      followButton.addEventListener('click', () => {
        const username = followButton.dataset.username;
        followUser(username);
      });
    }
  
    const unfollowButton = document.querySelector('.unfollow-button');
    if (unfollowButton) {
      unfollowButton.addEventListener('click', () => {
        const username = unfollowButton.dataset.username;
        unfollowUser(username);
      });
    }
  
    function followUser(username) {
      fetch(`/follow_user/${username}`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
      })
        .then(response => response.json())
        .then(data => {
          if (data.following) {
            followButton.style.display = 'none';
            unfollowButton.style.display = 'inline-block';
          }
        })
        .catch(error => console.log(error));
    }
  
    function unfollowUser(username) {
      fetch(`/unfollow_user/${username}`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
      })
        .then(response => response.json())
        .then(data => {
          if (!data.following) {
            followButton.style.display = 'inline-block';
            unfollowButton.style.display = 'none';
          }
        })
        .catch(error => console.log(error));
    }
  
    function getCookie(name) {
      if (!document.cookie) {
        return null;
      }
      const csrfCookie = document.cookie.split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith(name + '='));
      if (csrfCookie.length === 0) {
        return null;
      }
      return decodeURIComponent(csrfCookie[0].split('=')[1]);
    }
  });
  