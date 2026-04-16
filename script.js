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
	'html':       'assets/img/dialog-skills/html.svg',
	'css':        'assets/img/dialog-skills/css.svg',
	'javascript': 'assets/img/dialog-skills/js.svg',
	'typescript': 'assets/img/dialog-skills/ts.svg',
	'angular':    'assets/img/dialog-skills/angular.svg',
	'firebase':   'assets/img/dialog-skills/firebase.svg',
};

function createLinkArrow() {
	const tmp = document.createElement('div');
	tmp.innerHTML = `<svg class="dialog-link-arrow" width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M9.19835 6.85859L0.921055 15.128C0.805638 15.2432 0.681471 15.2961 0.548555 15.2865C0.415499 15.2769 0.291263 15.2144 0.175846 15.099C0.0605686 14.9836 0.00292969 14.8573 0.00292969 14.72C0.00292969 14.5828 0.0605686 14.4565 0.175846 14.3411L8.42439 6.08463H1.24001C1.08654 6.08463 0.95786 6.0331 0.853971 5.93005C0.750221 5.82699 0.698346 5.69935 0.698346 5.54713C0.698346 5.39477 0.750221 5.26574 0.853971 5.16005C0.95786 5.05421 1.08654 5.0013 1.24001 5.0013H9.61168C9.80154 5.0013 9.96064 5.06546 10.089 5.1938C10.2174 5.32227 10.2817 5.48137 10.2817 5.67109V14.043C10.2817 14.1964 10.2302 14.325 10.1271 14.4288C10.024 14.5327 9.8964 14.5846 9.74418 14.5846C9.59182 14.5846 9.46272 14.5327 9.35689 14.4288C9.25119 14.325 9.19835 14.1964 9.19835 14.043V6.85859Z" fill="#3DCFB6"/></svg>`;
	return tmp.firstElementChild;
}

function initProjectDialog() {
	const dialog = document.querySelector('.project-preview-dialog');
	const closeBtn = document.querySelector('.dialog-close-button');
	const nextBtn = dialog?.querySelector('.dialog-next-btn');
	const dialogImg = document.querySelector('.dialog-preview-img');
	const entriesArr = Array.from(document.querySelectorAll('.project-entry'));

	if (!dialog || !closeBtn || !dialogImg) return;

	let currentIndex = 0;

	function openDialog(entry) {
		currentIndex = entriesArr.indexOf(entry);
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
		[{ href: github, label: 'GitHub' }, { href: live, label: 'Live Test' }].forEach(({ href, label }) => {
			if (!href || href === '#') return;
			const a = document.createElement('a');
			a.href = href;
			a.target = '_blank';
			a.rel = 'noopener noreferrer';
			a.className = 'dialog-link';
			a.appendChild(document.createTextNode(label));
			a.appendChild(createLinkArrow());
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

	entriesArr.forEach(entry => entry.addEventListener('click', () => openDialog(entry)));
	closeBtn.addEventListener('click', closeDialog);
	dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(); });
	if (nextBtn) {
		nextBtn.addEventListener('click', () => {
			const next = (currentIndex + 1) % entriesArr.length;
			openDialog(entriesArr[next]);
		});
	}
}

function initTestimonials() {
	const swiperEl = document.querySelector('.testimonial-swiper');
	if (!swiperEl) return;

	const originalSlideCount = swiperEl.querySelectorAll('.swiper-slide').length;

	const swiper = new Swiper('.testimonial-swiper', {
		loop: true,
		centeredSlides: true,
		slidesPerView: 'auto',
		spaceBetween: 32,
		speed: 400,
	});

	const prevBtn = document.querySelector('.testimonial-prev');
	const nextBtn = document.querySelector('.testimonial-next');
	if (prevBtn) prevBtn.addEventListener('click', () => swiper.slidePrev());
	if (nextBtn) nextBtn.addEventListener('click', () => swiper.slideNext());

	const dotsContainer = document.querySelector('.testimonial-dots');
	if (dotsContainer) {
		const dots = Array.from({ length: originalSlideCount }, (_, i) => {
			const btn = document.createElement('button');
			btn.className = 'testimonial-dot';
			btn.setAttribute('aria-label', 'Slide ' + (i + 1));
			btn.addEventListener('click', () => swiper.slideToLoop(i));
			dotsContainer.appendChild(btn);
			return btn;
		});

		function updateDots() {
			dots.forEach((dot, i) => dot.classList.toggle('active', i === swiper.realIndex));
		}

		swiper.on('slideChange', updateDots);
		updateDots();
	}
}

document.addEventListener('DOMContentLoaded', () => {
	initLanguageSwitcher();
	initProjectPreview();
	initProjectDialog();
	initTestimonials();
});

