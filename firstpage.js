// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Add hover effect for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Add a welcome message
    const mainContent = document.querySelector('.main-content');
    const currentHour = new Date().getHours();
    let greeting;

    if (currentHour < 12) {
        greeting = 'Good morning';
    } else if (currentHour < 18) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }

    const welcomeMessage = document.createElement('p');
    welcomeMessage.textContent = `${greeting}, welcome to our site!`;
    welcomeMessage.className = 'welcome-message';
    mainContent.insertBefore(welcomeMessage, mainContent.firstChild);

    // Add fade-in animation for main content
    document.querySelector('.main-content').style.opacity = '0';
    setTimeout(() => {
        document.querySelector('.main-content').style.opacity = '1';
        document.querySelector('.main-content').style.transition = 'opacity 1s ease-in';
    }, 500);
});