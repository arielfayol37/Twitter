document.addEventListener('DOMContentLoaded', () => {
    const followersCount = document.querySelector('.followers-count');
    const followingCount = document.querySelector('.following-count');
    const followButton = document.querySelector('.follow-button');
    if (followButton) {
        // if button found on the page, then add event
      followButton.addEventListener('click', () => {
        const username = followButton.dataset.username;
        follow_unfollow_User(username);
      });
    }
  
    function follow_unfollow_User(username) {
      fetch(`/follow_user/${username}`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
      })
        .then(response => response.json())
        .then(data => {
          if (data.following) {
            followButton.textContent = 'Unfollow';
          }
          else{
            followButton.textContent = 'Follow';
          }

          followersCount.textContent = data.num_followers;
          followingCount.textContent = data.num_following;
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
  