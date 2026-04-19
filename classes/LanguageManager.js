import TRANSLATIONS from '../i18n.js';

const LANGUAGE_STORAGE_KEY = 'siteLang';
const SUPPORTED_LANGUAGES = ['de', 'en'];

export default class LanguageManager {
    getValidLanguage(value) {
        if (!value) return null;
        const normalized = value.toLowerCase();
        return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : null;
    }

    getTranslation(language, key) {
        const langTranslations = TRANSLATIONS[language] || {};
        if (langTranslations[key]) return langTranslations[key];
        const defaultTranslations = TRANSLATIONS.de || {};
        return defaultTranslations[key] || null;
    }

    setLanguage(language) {
        const valid = this.getValidLanguage(language);
        if (!valid) return;

        this.#applyTranslations(valid);

        document.querySelectorAll('.lang_link[data-lang]').forEach(button => {
            const isActive = button.dataset.lang === valid;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        document.documentElement.lang = valid;

        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, valid);
        } catch {}
    }

    #applyTranslations(language) {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.getTranslation(language, key);
            if (!translation) return;
            if (element.tagName === 'TITLE') return document.title = translation;
            element.textContent = translation;
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.dataset.i18nAriaLabel;
            const translation = this.getTranslation(language, key);
            if (!translation) return;
            element.setAttribute('aria-label', translation);
        });
    }

    init() {
        const buttons = document.querySelectorAll('.lang_link[data-lang]');
        if (!buttons.length) return;

        buttons.forEach(button => {
            button.addEventListener('click', () => this.setLanguage(button.dataset.lang));
        });

        let storedLanguage;
        try {
            storedLanguage = this.getValidLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
        } catch {
            storedLanguage = null;
        }

        const htmlLanguage = this.getValidLanguage(document.documentElement.lang);
        const initialLanguage = storedLanguage || htmlLanguage || 'de';
        this.setLanguage(initialLanguage);
    }
}
