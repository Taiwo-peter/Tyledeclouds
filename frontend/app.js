// frontend/app.js

document.addEventListener('DOMContentLoaded', () => {
    // Handle the mobile menu toggle
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');

    if (menu) {
        menu.addEventListener('click', () => {
            menu.classList.toggle('is-active');
            menuLinks.classList.toggle('active');
        });
    }

    // Fetch user data from backend API and log it
    fetch('/api/users')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log(data);
            // Update the UI with user data if necessary
        })
        .catch((error) => console.error('Error fetching user data:', error));
});
