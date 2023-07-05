
function parseReplies(){
document.addEventListener('DOMContentLoaded', () => {
    // 
    const replyTextArea = document.querySelector('.textarea-reply');
    const postReplyCount = document.querySelector('.post-reply-count');
    // Will be used to update the number of replies to a post, whenever the user
    // replies to the post
    
    const maxLength = 280; // A tikt's max number of characters. Should be same for new post in
                            // in the form class.
    const replyButton = document.querySelector('.reply-btn');
    const progressBar = document.querySelector('.circular-progress');
    

    
    const orignalColorOfReplyButton = replyButton.style.backgroundColor;
    disableButton(replyButton);

    //replyTextArea.style.display = 'none';
    const replyHeader = document.querySelector('.reply-header');
    replyHeader.style.display = 'none';

    replyTextArea.addEventListener('focus', function () {
        // Get the username and display 'replying to username'
        const username = replyButton.dataset.postUsername;
        replyHeader.innerHTML = `replying to <span class="username">
                <a href="/user/${username}"> @${username}</a></span>`;
        replyHeader.style.display ='block';

        // Add an event listener to the anchor tag
        const anchorTag = replyHeader.querySelector('a');
        anchorTag.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default navigation behavior
            const href = anchorTag.getAttribute('href');
            window.location.href = href; // Navigate to the specified link
        });
    });

    replyTextArea.addEventListener('blur', function () {
        replyHeader.innerHTML = '';
        setTimeout(() => {
            replyHeader.style.display ='none';
            }, 300);
        

    });

    replyTextArea.addEventListener('input', function () {

        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';

        const text = this.value;
        if (text.length > maxLength) {
        this.value = text.slice(0, maxLength); // Truncate the excess characters
        }
        const textLength = text.length;
        const progress = (textLength / maxLength);
        const progressValue = Math.floor(progress * 100);
        progressBar.style.background = `conic-gradient(
            #4d5bf9 ${progressValue * 3.6}deg,
            #cadcff ${progressValue * 3.6}deg
        )`;
        



        if (replyTextArea.value.trim() !== '') {
          // Textarea has some text
          enableButton(replyButton);
        } else {
          // Textarea is empty

          disableButton(replyButton);
        }
      });


    
    replyButton.addEventListener('click', () => {
        // For some reason, the user needs to click twice.
        replyPost(replyButton.dataset.postId, replyTextArea.value, document.querySelector(".reply-section"));
        disableButton(replyButton);
        replyTextArea.value = '';
        progressBar.style.background = `conic-gradient(
            #4d5bf9 ${0 * 3.6}deg,
            #cadcff ${0 * 3.6}deg
        )`;

    });
        
    

    function disableButton(button){
        // Get the computed styles of the button
        var styles = window.getComputedStyle(button);

        // Get the current background color
        var backgroundColor = styles.backgroundColor;

        // Parse the RGBA values from the background color
        var rgbaValues = backgroundColor.match(/\d+/g);
        var red = parseInt(rgbaValues[0]);
        var green = parseInt(rgbaValues[1]);
        var blue = parseInt(rgbaValues[2]);
        var alpha = parseFloat(rgbaValues[3]);

        // Reduce the alpha value to make the color fainter
        var faintAlpha = alpha * 0.5; // Adjust the multiplier as needed

        // Set the button's background color with the new faint alpha value
        button.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, ${faintAlpha})`;

        // Disable the button
        button.disabled = true;
    };

    function enableButton(button){
        button.style.backgroundColor = orignalColorOfReplyButton;
        button.disabled = false;
    }


    function replyPost(postId, content, replySection) {
        fetch(`/post/reply_post/${postId}`, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: JSON.stringify({ content }),
        })
        .then(response => response.json())
        .then(data => {
        
            if (data.success){
                // Display the reply among the replies to the post but with 
                // a different background, till the fetch is complete
                const newReply = generateReplyHTML(data); // Check reply_display.html and reproduce the same thing
                                            // Since there are conditions there, we will verify in the conditions
                                            // in the Django view and return the truth values.


                replySection.parentElement.querySelector('.user-reply').prepend(newReply);
                
                // Apply the CSS class to trigger the animation
                newReply.classList.add('animate-prepend');
                // Delay applying the 'show' class to allow the animation to take effect
                setTimeout(() => {
                newReply.classList.add('show');
                }, 10);
                // Remove the CSS classes after the animation completes
                setTimeout(() => {
                newReply.classList.remove('animate-prepend', 'show');
                }, 3000);
            
                    }
                
                    
                postReplyCount.textContent = `${parseInt(postReplyCount.textContent) + 1}`;
        })
        .catch(error => console.log(error));
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
          };




        function generateReplyHTML(data){
            const newReply = document.createElement('li');
            newReply.classList.add('reply-li');
            newReply.setAttribute('data-reply-id', data.replyId);

            const replySection = document.createElement('div');
            replySection.classList.add('reply-section');

            const userLink = document.createElement('a');
            userLink.classList.add('user-link');
            userLink.href = data.userLink;

            const spanInA = document.createElement('span');
            spanInA.classList.add('profile-image-container');

            if (data.hasProfilePic){
              spanInA.innerHTML = `<img src="${data.profilePicUrl}" 
              alt="Profile Image" class="profile-image">`;
            }
            userLink.appendChild(spanInA);
            const username = document.createElement('strong');
            username.textContent = data.replyUsername;
            userLink.appendChild(username);
            replySection.appendChild(userLink);

            const content = document.createElement('p');
            content.classList.add('r-content');
            content.textContent = data.replyContent;
            replySection.appendChild(content);

            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');
            replySection.appendChild(imageContainer);

            const justP = document.createElement('p');
            const likeCountSpanInP = document.createElement('span');
            likeCountSpanInP.classList.add('rlike-count');
            likeCountSpanInP.textContent = data.replyNumLikes + ' ';

            const likeButtonSpanInP = document.createElement('span');
            likeButtonSpanInP.classList.add('rlike-button');
            likeButtonSpanInP.setAttribute('data-reply-id', data.replyId);

            
            
            const heartIconInLikeButtonSpan = document.createElement('i');
            heartIconInLikeButtonSpan.classList.add('heart-icon', 'far', 'fa-heart');
            
            likeButtonSpanInP.appendChild(heartIconInLikeButtonSpan);
            justP.appendChild(likeCountSpanInP);
            justP.appendChild(likeButtonSpanInP);

            // Has to be in this order because the justP will be used
            // in the likeReply. I've tried to put this eventListener before
            // and it doesn't work.
            likeButtonSpanInP.addEventListener('click', () => {
                likeReply(likeButtonSpanInP, data.replyId);
              });

            const replyButton = document.createElement('a');
            replyButton.classList.add('reply-icon');
            replyButton.href = '#';
            
            const replyIcon = document.createElement('i');
            replyIcon.classList.add('fa', 'fa-reply');

            const replyCountSpanInP = document.createElement('span');
            replyCountSpanInP.classList.add('reply-reply-count');
            replyCountSpanInP.textContent = ' ' + data.numReplies + ' '; // This is to make
            // the display identical to other already loaded replies.
            replyButton.appendChild(replyIcon);
            const replyTextP = document.createElement('span');
            replyTextP.textContent = 'Reply'
            replyButton.appendChild(replyTextP);
            justP.appendChild(replyCountSpanInP);
            justP.appendChild(replyButton);

            const timestampP = document.createElement('p');
            timestampP.classList.add('timestamp');
            timestampP.textContent = data.replyTimestamp; 
            replySection.appendChild(justP);
            replySection.appendChild(timestampP);

            const editSection = document.createElement('div');
            editSection.classList.add('edit-section');
            const editDiv = document.createElement('div');
            const editButtonInEditSection = document.createElement('button');
            editButtonInEditSection.classList.add('btn', 'btn-primary', 'edit-btn');
            editButtonInEditSection.setAttribute('data-reply-id', data.replyId);
            editButtonInEditSection.textContent = 'Edit';
            editDiv.appendChild(editButtonInEditSection);

            const editDiv2 = document.createElement('div');
            const textarea = document.createElement('textarea');
            textarea.classList.add('textarea-edit');
            textarea.setAttribute('data-value', data.replyContent); 
            textarea.style.display = 'none';
            editDiv2.appendChild(textarea);

            editSection.appendChild(editDiv);
            editSection.appendChild(editDiv2);


            newReply.appendChild(replySection);
            newReply.appendChild(editSection);






            editButtonInEditSection.addEventListener('click', () => {

                // Get the associated text area
                
                textarea.addEventListener('input', function () {
                    if (maxLength > 300) {
                        textarea.style.height = 'auto';
                        textarea.style.height = textarea.scrollHeight + 'px';
                      }
                    
                    
            
                    const text = textarea.value;
                    if (text.length > maxLength) {
                        textarea.value = text.slice(0, maxLength); // Truncate the excess characters
                    }
                    if (text.trim() !== '') {
                        // Textarea has some text
                        editButtonInEditSection.disabled = false;
                      } else {
                        // Textarea is empty
              
                        editButtonInEditSection.disabled = true;
                      };
                });
                    
        
                const replySection = editSection.parentElement.querySelector('.reply-section');
                if (textarea.style.display === 'none') {
                    textarea.textContent = textarea.dataset.value;
                    textarea.style.display = 'block';
                    textarea.style.height = '0px';
                    textarea.style.width = '0px';
                    textarea.style.transition = 'height 2s, width 2s';
                    editButtonInEditSection.textContent = 'Save'; 
                    // Trigger the transition by delaying the height and width modifications
                    setTimeout(() => {
                        textarea.style.height = '200px';
                        textarea.style.width = '300px';
                    }, 10);
        
                    } else {
                        // Hiding the textarea
                    textarea.style.height = '0px';
                    textarea.style.width = '0px';
                    //textarea.style.transition = 'height 2s, width 2s';
        
        
        
                    // Wait for the transition to complete before hiding the textarea
                    const replyId = data.replyId;
                    const content = textarea.value;
                    setTimeout(() => {
                        textarea.style.display = 'none';
                        editButtonInEditSection.textContent = 'Edit'; 
            
                    }, 1600);
        
                        
                        modifyReply(replyId, content, replySection, textarea);
                }
                
            });

            return newReply;

        }

});
};

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
// Functions to handle like/unlike reply/ Tried to import from likeReply.js but doesn't work
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


  function modifyReply(replyId, content, replySection, textArea) {
    fetch(`/modify_reply/${replyId}`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
        body: JSON.stringify({ content }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response data or perform any necessary actions
        //console.log(data);
        if (data.success){
            replySection.querySelector('.r-content').textContent = content;
            textArea.dataset.value = content;
            textArea.textContent = ''; 
        }
    })
    .catch(error => console.log(error));
}


parseReplies();