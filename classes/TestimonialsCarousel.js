export default class TestimonialsCarousel {
    #swiper;
    #realSlidesCount = 3;

    /**
     * Initializes the testimonials carousel by creating a Swiper instance and setting up the necessary event listeners.
     * @return {void}
     */
    init() {
        const swiperEl = '.testimonial-swiper';
        if (!document.querySelector(swiperEl)) return;

        this.#swiper = new Swiper(swiperEl, {
            loop: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            spaceBetween: 30,
            speed: 400,
            pagination: this.#getPaginationConfig(),
            navigation: this.#getNavigationConfig(),
        });

        this.#initBulletsFaker();
    }

    /**
     * Generates the configuration object for the Swiper navigation buttons.
     * @returns {{nextEl: string, prevEl: string}}
     */
    #getNavigationConfig() {
        return {
            nextEl: '.testimonial-next',
            prevEl: '.testimonial-prev',
        }
    }

    /**
     * Generates the configuration object for the Swiper pagination, including a custom bullet rendering function that limits the number of visible bullets to the count of real slides.
     * @returns {{el: string, clickable: boolean, renderBullet: function(*, *): (string|string)}}
     */
    #getPaginationConfig() {
        return {
            el: '.testimonial-dots',
            clickable: true,
            renderBullet: (index, className) => {
                if (index < this.#realSlidesCount) return `<span class="${className}"></span>`;
                return '';
            },
        };
    }

    /**
     * Updates the active state of pagination bullets based on the Swiper's current slide index.
     * @return {void}
     */
    #initBulletsFaker() {
        this.#swiper.on('slideChange', () => {
            const bullets = document.querySelectorAll('.swiper-pagination-bullet');
            let realIndex = this.#swiper.realIndex;

            bullets.forEach((b, i) => {
                if (realIndex >= 3) realIndex -= 3;
                b.classList.toggle('swiper-pagination-bullet-active', i === realIndex || realIndex * 2 - i === i);
            });
        });
    }
}
