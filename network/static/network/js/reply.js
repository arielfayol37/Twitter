document.addEventListener('DOMContentLoaded', () => {
    // 
    const replyTextArea = document.querySelector('.textarea-reply');
    const maxLength = 450; // same as in the Django model for a post
    const replyButton = document.querySelector('.reply-btn');
    const progressBar = document.querySelector('.circular-progress');
    

    
    const orignalColorOfReplyButton = replyButton.style.backgroundColor;
    disableButton(replyButton);

    //replyTextArea.style.display = 'none';
    const replyHeader = document.querySelector('.reply-header');
    replyHeader.style.display = 'none';

    replyTextArea.addEventListener('focus', function () {
        // Get the username and display 'replying to username'
        replyHeader.innerHTML = `replying to <span class="username"> @${replyButton.dataset.postUsername}</span>`;
        replyHeader.style.display ='block';
    });

    replyTextArea.addEventListener('blur', function () {
        replyHeader.innerHTML = '';
        replyHeader.style.display ='none';

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
                const newReply = document.createElement('div');
                // Display the reply among the replies to the post but with 
                // a different background, till the fetch is complete
                newReply.innerHTML = generateReplyHTML(data); // Check reply_display.html and reproduce the same thing
                                            // Since there are conditions there, we will verify in the conditions
                                            // in the Django view and return the truth values.


                replySection.parentElement.querySelector('.user-reply').prepend(newReply);
            }
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
            const htmlContent = `
            

            <!--network: reply_display.html-->
<li class="reply-li" data-reply-id="${data.replyId}">
    <div class="reply-section">
    <a class="user-link" href="${data.userLink}"><strong>${data.replyUsername}</strong></a>
    <p class="r-content">${data.replyContent}</p>
    <div class="image-container">
    </div>
    
        <p>
            <span class="rlike-count">${data.replyNumLikes}</span>
            <span class="rlike-button" data-reply-id="${data.replyId}" >
                    <i class="heart-icon far fa-heart"></i>
            </span>

            
            
            <a href="#" class="reply-icon">
                <i class="fa fa-reply"></i> Reply
            </a>

        </p>
        
    <p class="timestamp">${data.replyTimestamp}</p>
    </div>
    <div class="edit-section">
        <div><button class="btn btn-primary edit-btn" data-reply-id="${data.replyId}">Edit</button></div>
    
    
        <!--<div><textarea class="textarea-edit" value="${data.replyContent}"> ${data.replyContent}</textarea></div> -->    
   
   
     </div>
  
</li>
            
            `;
            return htmlContent;
        }  

});