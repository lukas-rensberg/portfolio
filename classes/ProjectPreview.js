export default class ProjectPreview {
    #list;
    #previewCol;
    #previewWrapper;
    #entries;
    #previewImg;

    init() {
        this.#list = document.querySelector('.projects-list');
        this.#previewCol = document.querySelector('.projects-preview-col');
        this.#previewWrapper = document.querySelector('.projects-preview-wrapper');
        this.#entries = Array.from(document.querySelectorAll('.project-entry'));
        this.#previewImg = document.querySelector('.projects-preview-img');

        if (!this.#list || !this.#previewCol || !this.#previewWrapper || !this.#entries.length || !this.#previewImg) return;

        this.#entries.forEach(entry => {
            entry.addEventListener('mouseenter', () => this.#onMouseEnter(entry));
            entry.addEventListener('mouseleave', () => this.#previewWrapper.classList.remove('is-visible'));
        });
    }

    #onMouseEnter(entry) {
        const src = entry.dataset.preview;
        if (!src) return;

        if (this.#previewImg.src !== new URL(src, location.href).href) {
            this.#previewImg.src = src;
            this.#previewImg.onload = () => this.#applyPosition(entry);
        } else {
            this.#applyPosition(entry);
        }

        this.#previewWrapper.classList.add('is-visible');
    }

    #applyPosition(entry) {
        const index = this.#entries.indexOf(entry);
        const isFirst = index === 0;
        const isLast = index === this.#entries.length - 1;

        const listRect = this.#list.getBoundingClientRect();
        const colRect = this.#previewCol.getBoundingClientRect();
        const entryRect = entry.getBoundingClientRect();
        const imgHeight = this.#previewWrapper.offsetHeight;

        let top = this.#calculatePosition(isFirst, isLast, listRect, colRect, entryRect, imgHeight);

        this.#previewWrapper.style.top = top + 'px';
    }
    
    #calculatePosition(isFirst, isLast, listRect, colRect, entryRect, imgHeight) {
        let top;
        if (isFirst) {
            top = listRect.top - colRect.top;
        } else if (isLast) {
            top = listRect.bottom - colRect.top - imgHeight;
        } else {
            top = (entryRect.top + entryRect.height / 2) - colRect.top - imgHeight / 2;
        }
        
        return top;
    }
}
