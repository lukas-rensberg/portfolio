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
    if (pathname === '/' || pathname === '/index.html' || pathname === "/lukas-rensberg.de/index.html") {
        new FormValidator().init();
    }



    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const navLinks = document.querySelectorAll('.navbar_link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('topbar__link--active'));
            link.classList.add('topbar__link--active');
        });
    });
});
