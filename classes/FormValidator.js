import TRANSLATIONS from '../i18n.js';

const LANG_KEY = 'siteLang';

export default class FormValidator {
    #form;
    #submitBtn;
    #textFields;
    #privacyField;
    #originalPlaceholders = new Map();

    constructor() {
        this.#form = document.querySelector('form');
        this.#submitBtn = this.#form.querySelector('button[type="submit"]');
        this.#textFields = ['name', 'email', 'message'].map(id => this.#form.querySelector(`#${id}`));
        this.#privacyField = this.#form.querySelector('#privacy');
    }

    init() {
        this.#textFields.forEach(f => this.#originalPlaceholders.set(f, f.placeholder));
        this.#textFields.forEach(f => f.addEventListener('focus', () => this.#resetTextError(f)));
        this.#textFields.forEach(f => f.addEventListener('blur', () => this.#onBlurText(f)));
        this.#textFields.forEach(f => f.addEventListener('input', () => this.#updateSubmitState()));
        this.#privacyField.addEventListener('change', () => this.#onChangeCheckbox());
        this.#form.addEventListener('submit', e => this.#handleSubmit(e));
        this.#bindLanguageListener();
        this.#updateSubmitState();
        return this;
    }

    #onBlurText(field) {
        if (field.value.trim() === '') {
            this.#showPlaceholderError(field, `validation.${field.id}.required`);
        } else if (field.id === 'email' && !this.#isValidEmail(field.value)) {
            this.#showInlineError(field, 'validation.email.invalid');
        }
    }

    #onChangeCheckbox() {
        if (this.#privacyField.checked) {
            this.#resetCheckboxError();
        } else {
            this.#showCheckboxError();
        }
        this.#updateSubmitState();
    }

    #handleSubmit(e) {
        const emailField = this.#form.querySelector('#email');
        if (this.#isValidEmail(emailField.value)) return;
        e.preventDefault();
        this.#showInlineError(emailField, 'validation.email.invalid');
    }

    #updateSubmitState() {
        const allFilled = this.#textFields.every(f => f.value.trim() !== '');
        this.#submitBtn.disabled = !(allFilled && this.#privacyField.checked);
    }

    #bindLanguageListener() {
        document.querySelectorAll('.topbar__lang-btn[data-lang]').forEach(btn => {
            btn.addEventListener('click', () => this.#refreshPlaceholderErrors(btn.dataset.lang));
        });
    }

    #refreshPlaceholderErrors(lang) {
        this.#textFields.forEach(field => {
            if (!field.dataset.activeErrorKey) return;
            field.placeholder = TRANSLATIONS[lang]?.[field.dataset.activeErrorKey] ?? field.placeholder;
        });
    }

    #showPlaceholderError(field, key) {
        field.dataset.activeErrorKey = key;
        field.placeholder = this.#t(key);
        field.classList.add('field-error');
    }

    #showInlineError(field, key) {
        const span = field.closest('.form-field')?.querySelector('.form-field__error');
        this.#revealSpan(span, key);
    }

    #showCheckboxError() {
        const wrapper = this.#privacyField.closest('.form-field--checkbox');
        wrapper.classList.add('field-error');
        this.#revealSpan(wrapper.querySelector('.form-field__error'), 'validation.privacy.required');
    }

    #revealSpan(span, key) {
        if (!span) return;
        span.dataset.i18n = key;
        span.textContent = this.#t(key);
        span.classList.add('is-visible');
    }

    #resetTextError(field) {
        field.placeholder = this.#originalPlaceholders.get(field);
        field.classList.remove('field-error');
        delete field.dataset.activeErrorKey;
        const span = field.closest('.form-field')?.querySelector('.form-field__error');
        if (span) this.#hideSpan(span);
    }

    #hideSpan(span) {
        span.removeAttribute('data-i18n');
        span.textContent = '';
        span.classList.remove('is-visible');
    }

    #resetCheckboxError() {
        const wrapper = this.#privacyField.closest('.form-field--checkbox');
        wrapper.classList.remove('field-error');
        const span = wrapper.querySelector('.form-field__error');
        if (span) this.#hideSpan(span);
    }

    #isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    #t(key) {
        const lang = localStorage.getItem(LANG_KEY) || 'de';
        return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.de?.[key] ?? key;
    }
}
