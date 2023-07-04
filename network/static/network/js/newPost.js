document.addEventListener('DOMContentLoaded', () => { 
    const postFormDiv = document.querySelector('.post-form');
    const newPostTextArea = postFormDiv.querySelector('textarea');
    const progressBar = document.querySelector('.circular-progress');
    const maxLength = 280; // A tikt's max number of characters. Should be same for replies .

    newPostTextArea.addEventListener('input', function () {

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

    });
} );
