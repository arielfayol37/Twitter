document.addEventListener('DOMContentLoaded', () => {

    const editTextAreas = document.querySelectorAll('.textarea-edit');
    const editButtons = document.querySelectorAll('.edit-btn');
    const maxLength = 280;
    editTextAreas.forEach(textArea => {
        textArea.style.display = 'none';
    });
    
    editButtons.forEach(button => {
        if (button.classList.contains('po')){
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
                    

                const postSection = editSection.parentElement.querySelector('.post-section');
                if (textArea.style.display === 'none'){
                    postSection.style.display = 'none';
                    textArea.textContent = textArea.dataset.value;
                    textArea.style.display = 'block';
                    
                    
                    textArea.style.height = '200px';
                    textArea.style.width = '300px';
                    button.textContent = 'Save';
                }else {
                    textArea.style.display = 'none';
                    setTimeout(() => {textArea.classList.remove('show');
                    textArea.classList.add('hide');}, 10);  // may be can work without this
                    
                    postSection.style.display = 'block';
                    const postId = button.dataset.postId;
                    const content = textArea.value;
                    button.textContent = 'Edit';
                        
                        modifyPost(postId, content, postSection, textArea);
                }
                
            });
        };
        
});

    function modifyPost(postId, content, postSection, textArea) {
        fetch(`/modify_post/${postId}`, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: JSON.stringify({ content }),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response data or perform any necessary actions
            console.log(data);
            if (data.success){
                postSection.querySelector('.p-content').textContent = content;
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