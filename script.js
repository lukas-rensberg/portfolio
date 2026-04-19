import LanguageManager from './classes/LanguageManager.js';
import ProjectPreview from './classes/ProjectPreview.js';
import ProjectDialog from './classes/ProjectDialog.js';
import TestimonialsCarousel from './classes/TestimonialsCarousel.js';

document.addEventListener('DOMContentLoaded', () => {
    const languageManager = new LanguageManager();
    languageManager.init();

    new ProjectPreview().init();
    new ProjectDialog(languageManager).init();
    new TestimonialsCarousel().init();
});
