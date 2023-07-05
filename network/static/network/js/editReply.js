document.addEventListener('DOMContentLoaded', () => {

    const editTextAreas = document.querySelectorAll('.textarea-edit');
    const editButtons = document.querySelectorAll('.edit-btn');
    const maxLength = 280;
    editTextAreas.forEach(textArea => {
        textArea.style.display = 'none';
    });
    
    editButtons.forEach(button => {
        if (!(button.classList.contains('po'))){
        button.addEventListener('click', () => {

        // Get the associated text area
        const editSection = button.parentElement.parentElement; 
        const textArea = editSection.querySelector('.textarea-edit');
        textArea.addEventListener('input', function () {

            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
    
            const text = this.value;
            if (text.length > maxLength) {
            this.value = text.slice(0, maxLength); // Truncate the excess characters
            }
            if (text.trim() !== '') {
                // Textarea has some text
               button.disabled = false;
              } else {
                // Textarea is empty
      
                button.disabled = true;
              };
        });
            

        const replySection = editSection.parentElement.querySelector('.reply-section');
        if (textArea.style.display === 'none') {
            /*
            replySection.style.display = 'none';
            replySection.style.height = '0px';
            replySection.style.opacity = '0';
            */
            textArea.textContent = textArea.dataset.value;
            textArea.style.display = 'block';
            textArea.style.height = '0px';
            textArea.style.width = '0px';
            textArea.style.transition = 'height 2s, width 2s';
            button.textContent = 'Save';

            // Trigger the transition by delaying the height and width modifications
            setTimeout(() => {
                textArea.style.height = '200px';
                textArea.style.width = '300px';
            }, 10);

            } else {
                // Hiding the textarea
            textArea.style.height = '0px';
            textArea.style.width = '0px';
            //textArea.style.transition = 'height 2s, width 2s';



            // Wait for the transition to complete before hiding the textarea
            const replyId = button.dataset.replyId;
            const content = textArea.value;
            setTimeout(() => {
                textArea.style.display = 'none';
                replySection.style.height = '0px';
                replySection.style.opacity = '0';
                replySection.style.transition = 'height 3s, opacity 3s';
                setTimeout(()=>{
                    replySection.style.display = 'block';
                    replySection.style.height = 'auto';
                    replySection.style.opacity = '1';
                }, 10);
                
                console.log('Imma really trying!');
                button.textContent = 'Edit';
            }, 1600);

                
                modifyReply(replyId, content, replySection, textArea);
        }
        
    }); };
});

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