const currentUser = document.querySelector(".current-user");
const spanPageNumber = document.querySelector(".page-number");
const divReplies = document.querySelector(".replies");
document.addEventListener("DOMContentLoaded", () => {

    
    
    const postId = document.querySelector('.post-li').dataset.postId;
    // If the user has scrolled to the bottom of the page:
    window.addEventListener('scroll', function() {
       // if (isUserAtBottom()) {
        if(window.innerHeight + window.scrollY >= (document.body.offsetHeight-10)){
          // User has reached the bottom of the page
          // Fetch more posts and modify page number in fetchMoreReplies()
          //console.log('User reached the bottom of the page');
          const pagenum = spanPageNumber.dataset.pageNumber
          if (!(pagenum == -1)){fetchMoreReplies(postId, pagenum);}
          

          // TODO: Add event listeners to the edit buttond of the new replies

          
        }
      });

});

function appendFetchedRepliesToHtml(data){
    // Access the replies and add them to the HTML
    const page = data.page;
    
    page.forEach((reply) => {
      // Create HTML elements for each reply
      const replyElement = renderReply(reply);
      
      // Add the reply element to the container
      divReplies.appendChild(replyElement);

    });
    if (data.page_has_next){spanPageNumber.setAttribute("data-page-number", spanPageNumber.dataset.pageNumber +
    1);}else {
      spanPageNumber.setAttribute("data-page-number", -1);
    }

    //console.log('Added Fetched Replied to HTML')
}

function fetchMoreReplies(postId, pageNum){

    fetch(`/post/${postId}/1/${pageNum}`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
    })
    .then(response => response.json())
    .then(data => { appendFetchedRepliesToHtml(data);
    }).catch(error => console.log(error));
}





function renderReply(reply) {
  // Create the necessary HTML elements
  const replyLi = document.createElement('li');
  replyLi.classList.add('reply-li');
  replyLi.dataset.replyId = reply.id;

  const replySection = document.createElement('div');
  replySection.classList.add('reply-section');

  const userLink = document.createElement('a');
  userLink.classList.add('user-link');
  userLink.href = `/profile/${reply.user_username}`;

  const profileImageContainer = document.createElement('span');
  profileImageContainer.classList.add('profile-image-container');
  
  if (!(reply.user_profile_picture_url===false)){
    const profileImage = document.createElement('img');
    profileImage.src = reply.user_profile_picture_url;
    profileImage.alt = 'Profile Image';
    profileImage.classList.add('profile-image');
    profileImageContainer.appendChild(profileImage);
  }
  

  const username = document.createElement('strong');
  username.textContent = reply.user_username;

  const content = document.createElement('p');
  content.classList.add('r-content');
  content.textContent = reply.content;

  const replyImageContainer = document.createElement('div');
  replyImageContainer.classList.add('image-container');
  if ((!reply.image_url===false)){
    const replyImage = document.createElement('img');
    replyImage.src = reply.image_url;
    replyImage.alt = 'Reply Image';
    replyImage.classList.add("post-image");
    replyImageContainer.appendChild(replyImage)
  

  }
  
  const justP = document.createElement('p');
  var itag = '';
  if (!(currentUser == null)){
    if (reply.user_liked){
      itag = '<i class="heart-icon fas fa-heart liked"></i>';
    }else {
      itag = '<i class="heart-icon far fa-heart"></i>';
    };

    
    justP.innerHTML = `
          <span class="rlike-count">${reply.num_likes}</span>
            <span class="rlike-button" data-reply-id="${reply.id}" >
                ${itag}
            </span>
            
            <span class="reply-reply-count">${reply.num_replies}</span>
            <a href="#" class="reply-icon">
                <i class="fa fa-reply"></i> Reply
            </a>

    `;

  }else {
    justP.innerHTML = `
    <i class="far fa-heart"></i> <span class="rlike-count">${reply.num_likes} </span>
    `;
  }
  const p2 = document.createElement('p');
  p2.classList.add('timestamp');
  p2.innerHTML = `${moment(reply.timestamp).fromNow()} ago`;

  const divEditSection = document.createElement('div');
  divEditSection.classList.add('edit-section');

  if ((currentUser.currentUserid === reply.user_id)){
    divEditSection.innerHTML = `
    <div><button class="btn btn-primary edit-btn" data-reply-id="${reply.id}">Edit</button></div>
        <div><textarea class="textarea-edit" data-value="${reply.content}"></textarea></div>  
    `;
  };

  // Add the created elements to the appropriate parent elements
  
  userLink.appendChild(profileImageContainer);
  userLink.appendChild(username);
  
  replySection.appendChild(userLink);
  replySection.appendChild(content);
  replySection.appendChild(replyImageContainer);
  replySection.appendChild(justP);
  replySection.appendChild(p2)

  replyLi.appendChild(replySection);
  replyLi.appendChild(divEditSection);

  return replyLi
}



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



function isUserAtBottom() {

    // SEEMS LIKE It DOESN't WORK
    // Get the scroll position of the window

    
    const scrollPosition = document.documentElement.scrollTop;
  
    // Get the height of the document
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
  
    // Get the height of the viewport
    const viewportHeight = window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
  
    // Check if the user has reached the bottom of the page
    
    return scrollPosition + viewportHeight >= documentHeight;
  };

