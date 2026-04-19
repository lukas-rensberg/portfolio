const TECH_ICONS = {
    'html': 'assets/img/dialog-skills/html.svg',
    'css': 'assets/img/dialog-skills/css.svg',
    'javascript': 'assets/img/dialog-skills/js.svg',
    'typescript': 'assets/img/dialog-skills/ts.svg',
    'angular': 'assets/img/dialog-skills/angular.svg',
    'firebase': 'assets/img/dialog-skills/firebase.svg',
};

export default class ProjectDialog {
    #languageManager;
    #dialog;
    #closeBtn;
    #nextBtn;
    #dialogImg;
    #entries;
    #currentIndex = 0;

    constructor(languageManager) {
        this.#languageManager = languageManager;
    }

    init() {
        this.#dialog = document.querySelector('.project-preview-dialog');
        this.#closeBtn = document.querySelector('.dialog-close-button');
        this.#nextBtn = this.#dialog?.querySelector('.dialog-next-btn');
        this.#dialogImg = document.querySelector('.dialog-preview-img');
        this.#entries = Array.from(document.querySelectorAll('.project-entry'));

        if (!this.#dialog || !this.#closeBtn || !this.#dialogImg) return;

        this.#setupEventListeners();
    }

    #setupEventListeners() {
        this.#entries.forEach(entry => entry.addEventListener('click', () => this.#open(entry)));
        this.#closeBtn.addEventListener('click', () => this.#close());
        this.#dialog.addEventListener('click', e => { if (e.target === this.#dialog) this.#close(); });

        if (this.#nextBtn) {
            this.#nextBtn.addEventListener('click', () => {
                const next = (this.#currentIndex + 1) % this.#entries.length;
                this.#open(this.#entries[next]);
            });
        }
    }
    
    #open(entry) {
        this.#currentIndex = this.#entries.indexOf(entry);
        const name = entry.querySelector('.project-name')?.textContent?.trim() || '';
        const techText = entry.querySelector('.project-tech')?.textContent?.trim() || '';
        const descKey = entry.dataset.descriptionKey || '';

        this.#dialog.querySelector('.dialog-number').textContent = entry.dataset.number || '';
        this.#dialog.querySelector('.dialog-title').textContent = name;
        this.#dialog.querySelector('.dialog-description').textContent = this.#languageManager.getTranslation(document.documentElement.lang, descKey) || '';
        this.#dialogImg.src = entry.dataset.preview || '';
        this.#dialogImg.alt = name;

        const techList = this.#dialog.querySelector('.dialog-tech-list');
        const techs = techText.split('|').map(t => t.trim()).filter(Boolean);
        techList.replaceChildren(...techs.map(tech => this.#createTechBadge(tech)));

        this.#generateDialogLinks(entry);
        
        this.#dialog.removeAttribute('aria-hidden');
        this.#dialog.showModal();
        this.#closeBtn.focus({preventScroll: true});
    }

    #generateDialogLinks(entry) {
        const linksEl = this.#dialog.querySelector('.dialog-links');
        linksEl.replaceChildren();

        const dialogLinks = [
            {href: entry.dataset.github || '', label: 'GitHub'},
            {href: entry.dataset.live || '', label: 'Live Test'}
        ];

        dialogLinks.forEach(({href, label}) => {
            const a = this.#createLink(href, label);
            linksEl.appendChild(a);
        });
    }
    
    #close() {
        this.#dialog.setAttribute('aria-hidden', 'true');
        this.#dialog.close();
    }

    #createTechBadge(tech) {
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
    }

    #createLink(href, label) {
        if (!href) return null;
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'dialog-link';
        a.appendChild(document.createTextNode(label));
        a.appendChild(this.#createLinkArrow());
        return a;
    }

    #createLinkArrow() {
        const tmp = document.createElement('div');
        tmp.innerHTML = `<svg class="dialog-link-arrow" width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M9.19835 6.85859L0.921055 15.128C0.805638 15.2432 0.681471 15.2961 0.548555 15.2865C0.415499 15.2769 0.291263 15.2144 0.175846 15.099C0.0605686 14.9836 0.00292969 14.8573 0.00292969 14.72C0.00292969 14.5828 0.0605686 14.4565 0.175846 14.3411L8.42439 6.08463H1.24001C1.08654 6.08463 0.95786 6.0331 0.853971 5.93005C0.750221 5.82699 0.698346 5.69935 0.698346 5.54713C0.698346 5.39477 0.750221 5.26574 0.853971 5.16005C0.95786 5.05421 1.08654 5.0013 1.24001 5.0013H9.61168C9.80154 5.0013 9.96064 5.06546 10.089 5.1938C10.2174 5.32227 10.2817 5.48137 10.2817 5.67109V14.043C10.2817 14.1964 10.2302 14.325 10.1271 14.4288C10.024 14.5327 9.8964 14.5846 9.74418 14.5846C9.59182 14.5846 9.46272 14.5327 9.35689 14.4288C9.25119 14.325 9.19835 14.1964 9.19835 14.043V6.85859Z" fill="#3DCFB6"/></svg>`;
        return tmp.firstElementChild;
    }
}
