document.addEventListener('DOMContentLoaded', () => {
const postSections= document.querySelectorAll('.post-li');
const innerLinks = document.querySelectorAll('.il');

 postSections.forEach(postSection => {
    postSection.addEventListener('click', function(event) {
        
    if (!(event.target.parentElement.classList.contains('il') 
    || event.target.parentElement.parentElement.classList.contains('il') )){
        // the condition above is because it seems like
        // fontawesome changes the structure of the like button
        // it is in unliked mode.
        const postId = event.currentTarget.dataset.postId;
        const url = `/post/${postId}`;
        navigateToPage(url);
    }
    })
});
/*
innerLinks.forEach(innerLink => {
    innerLink.addEventListener('click', function(event) {
    event.preventDefault();
})
});
*/
function navigateToPage(url) {
  window.location.href = url;
}


});