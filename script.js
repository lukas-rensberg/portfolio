import TRANSLATIONS from "./i18n.js";

const LANGUAGE_STORAGE_KEY = 'siteLang';
const SUPPORTED_LANGUAGES = ['de', 'en'];

function getValidLanguage(value) {
	if (!value) {
		return null;
	}

	const normalizedValue = value.toLowerCase();
	return SUPPORTED_LANGUAGES.includes(normalizedValue) ? normalizedValue : null;
}

function setLanguage(language) {
	const validLanguage = getValidLanguage(language);
	if (!validLanguage) {
		return;
	}

	applyTranslations(validLanguage);

	const languageButtons = document.querySelectorAll('.lang_link[data-lang]');
	languageButtons.forEach((button) => {
		const isActive = button.dataset.lang === validLanguage;
		button.classList.toggle('active', isActive);
		button.setAttribute('aria-pressed', String(isActive));
	});

	document.documentElement.lang = validLanguage;

	try {
		localStorage.setItem(LANGUAGE_STORAGE_KEY, validLanguage);
	} catch (error) {
		// Ignore storage errors (private mode / blocked storage).
	}
}

function getTranslation(language, key) {
	const languageTranslations = TRANSLATIONS[language] || {};
	if (languageTranslations[key]) {
		return languageTranslations[key];
	}

	const defaultTranslations = TRANSLATIONS.de || {};
	return defaultTranslations[key] || null;
}

function applyTranslations(language) {
	document.querySelectorAll('[data-i18n]').forEach((element) => {
		const key = element.dataset.i18n;
		const translation = getTranslation(language, key);

		if (!translation) {
			return;
		}

		if (element.tagName === 'TITLE') {
			document.title = translation;
			return;
		}

		element.textContent = translation;
	});

	document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
		const key = element.dataset.i18nAriaLabel;
		const translation = getTranslation(language, key);

		if (!translation) {
			return;
		}

		element.setAttribute('aria-label', translation);
	});
}

function initLanguageSwitcher() {
	const languageButtons = document.querySelectorAll('.lang_link[data-lang]');
	if (!languageButtons.length) {
		return;
	}

	languageButtons.forEach((button) => {
		button.addEventListener('click', () => {
			setLanguage(button.dataset.lang);
		});
	});

	let storedLanguage;
	try {
		storedLanguage = getValidLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
	} catch (error) {
		storedLanguage = null;
	}

	const htmlLanguage = getValidLanguage(document.documentElement.lang);
	const initialLanguage = storedLanguage || htmlLanguage || 'de';

	setLanguage(initialLanguage);
}

document.addEventListener('DOMContentLoaded', initLanguageSwitcher);

