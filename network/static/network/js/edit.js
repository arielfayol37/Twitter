document.addEventListener('DOMContentLoaded', () => {

    const editTextAreas = document.querySelectorAll('.textarea-edit');
    const editButtons = document.querySelectorAll('.edit-btn');
    editTextAreas.forEach(textArea => {
        textArea.style.display = 'none';
    });
    
    editButtons.forEach(button => {
        button.addEventListener('click', () => {

        // Get the associated text area
        const editSection = button.parentElement.parentElement; 
        const textArea = editSection.querySelector('.textarea-edit');
        const postSection = editSection.parentElement.querySelector('.post-section');
        if (textArea.style.display === 'none'){
            postSection.style.display = 'none';
            textArea.style.display = 'block';
            textArea.style.height = '200px';
            textArea.style.width = '300px';
            button.textContent = 'Save';
        }else {
            textArea.style.display = 'none';
            postSection.style.display = 'block';
            const postId = button.dataset.postId;
            const content = textArea.value;
            button.textContent = 'Edit';
                
                modifyPost(postId, content, postSection);
        }
        
    });
});

    function modifyPost(postId, content, postSection) {
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