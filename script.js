import LanguageManager from './classes/LanguageManager.js';
import ProjectPreview from './classes/ProjectPreview.js';
import ProjectDialog from './classes/ProjectDialog.js';
import TestimonialsCarousel from './classes/TestimonialsCarousel.js';
import FormValidator from './classes/FormValidator.js';

document.addEventListener('DOMContentLoaded', () => {
    const languageManager = new LanguageManager();
    languageManager.init();

    new ProjectPreview().init();
    new ProjectDialog(languageManager).init();
    new TestimonialsCarousel().init();

    const pathname = window.location.pathname;

    // Debug: last pathname is for compatibility with PhpStorm
    // TODO: Delete last entry in production and comment above
    if (pathname === '/' || pathname === '/index.html' || pathname === "/lukas-rensberg.de/index.html") {
        new FormValidator().init();
    }

    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

    initNavLinks();
});

function initNavLinks() {
    const navLinks = document.querySelectorAll('.navbar_link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('topbar__link--active'));
            link.classList.add('topbar__link--active');
        });
    });
}

const contactForm = document.getElementById('contactForm');
contactForm.onsubmit = async function (event) {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('http://localhost:63341/lukas-rensberg.de/send-mail.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const text = await response.text(); // safer for debugging
        console.log("RAW RESPONSE:", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch {
            throw new Error("Invalid JSON from server");
        }

        if (response.ok && result.success) {
            console.log("Success");
            contactForm.reset();
        } else {
            console.error("Server error:", result);
        }

    } catch (error) {
        console.error("Request failed:", error);
    }
};
