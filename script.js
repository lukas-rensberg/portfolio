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

function initProjectPreview() {
	const list = document.querySelector('.projects-list');
	const previewCol = document.querySelector('.projects-preview-col');
	const previewWrapper = document.querySelector('.projects-preview-wrapper');
	const entries = Array.from(document.querySelectorAll('.project-entry'));
	const previewImg = document.querySelector('.projects-preview-img');

	if (!list || !previewCol || !previewWrapper || !entries.length || !previewImg) return;

	function applyPosition(entry) {
		const index = entries.indexOf(entry);
		const isFirst = index === 0;
		const isLast = index === entries.length - 1;

		const listRect = list.getBoundingClientRect();
		const colRect = previewCol.getBoundingClientRect();
		const entryRect = entry.getBoundingClientRect();
		const imgH = previewWrapper.offsetHeight;

		let top;
		if (isFirst) {
			top = listRect.top - colRect.top;
		} else if (isLast) {
			top = listRect.bottom - colRect.top - imgH;
		} else {
			top = (entryRect.top + entryRect.height / 2) - colRect.top - imgH / 2;
		}

		previewWrapper.style.top = top + 'px';
	}

	entries.forEach(entry => {
		entry.addEventListener('mouseenter', () => {
			const src = entry.dataset.preview;
			if (!src) return;

			if (previewImg.src !== new URL(src, location.href).href) {
				previewImg.src = src;
				previewImg.onload = () => applyPosition(entry);
			} else {
				applyPosition(entry);
			}

			previewWrapper.classList.add('is-visible');
		});

		entry.addEventListener('mouseleave', () => {
			previewWrapper.classList.remove('is-visible');
		});
	});
}

const TECH_ICONS = {
	'html':       'img/skills/html.svg',
	'css':        'img/skills/css.svg',
	'javascript': 'img/skills/js.svg',
	'typescript': 'img/skills/ts.svg',
	'angular':    'img/skills/angular.svg',
	'supabase':   'img/skills/supabase.svg',
	'git':        'img/skills/git.svg',
	'rest api':   'img/skills/api.svg',
	'scrum':      'img/skills/scrum.svg',
};

function initProjectDialog() {
	const dialog = document.querySelector('.project-preview-dialog');
	const closeBtn = document.querySelector('.dialog-close-button');
	const dialogImg = document.querySelector('.dialog-preview-img');
	const entries = document.querySelectorAll('.project-entry');

	if (!dialog || !closeBtn || !dialogImg) return;

	function openDialog(entry) {
		const number      = entry.dataset.number || '';
		const src         = entry.dataset.preview || '';
		const name        = entry.querySelector('.project-name')?.textContent?.trim() || '';
		const techText    = entry.querySelector('.project-tech')?.textContent?.trim() || '';
		const descKey     = entry.dataset.descriptionKey || '';
		const description = getTranslation(document.documentElement.lang, descKey) || '';
		const github      = entry.dataset.github || '';
		const live        = entry.dataset.live || '';

		dialog.querySelector('.dialog-number').textContent      = number;
		dialog.querySelector('.dialog-title').textContent       = name;
		dialog.querySelector('.dialog-description').textContent = description;

		// Tech badges
		const techList = dialog.querySelector('.dialog-tech-list');
		const techs = techText.split('|').map(t => t.trim()).filter(Boolean);
		techList.replaceChildren(...techs.map(tech => {
			const badge = document.createElement('span');
			badge.className = 'dialog-tech-badge';
			const icon = TECH_ICONS[tech.toLowerCase()];
			if (icon) {
				const img = document.createElement('img');
				img.src = icon;
				img.alt = '';
				img.setAttribute('aria-hidden', 'true');
				badge.appendChild(img);
			}
			badge.appendChild(document.createTextNode(tech));
			return badge;
		}));

		// Links
		const linksEl = dialog.querySelector('.dialog-links');
		linksEl.replaceChildren();
		[{ href: github, label: 'GitHub ↗' }, { href: live, label: 'Live Test ↗' }].forEach(({ href, label }) => {
			if (!href || href === '#') return;
			const a = document.createElement('a');
			a.href = href;
			a.target = '_blank';
			a.rel = 'noopener noreferrer';
			a.className = 'dialog-link';
			a.textContent = label;
			linksEl.appendChild(a);
		});

		dialogImg.src = src;
		dialogImg.alt = name;

		dialog.removeAttribute('aria-hidden');
		dialog.showModal();
		closeBtn.focus({ preventScroll: true });
	}

	function closeDialog() {
		dialog.setAttribute('aria-hidden', 'true');
		dialog.close();
	}

	entries.forEach(entry => entry.addEventListener('click', () => openDialog(entry)));
	closeBtn.addEventListener('click', closeDialog);
	dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(); });
}

document.addEventListener('DOMContentLoaded', () => {
	initLanguageSwitcher();
	initProjectPreview();
	initProjectDialog();
});

