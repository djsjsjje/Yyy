(function () {
    'use strict';

    function install() {
        if (window.GALFLIX_TEST_INSTALLED) return;
        window.GALFLIX_TEST_INSTALLED = true;

        console.log('[GALFLIX] Plugin installed');

        var style = document.createElement('style');

        style.id = 'galflix-test-style';

        style.textContent = `
            .media-loading {
                background: #141414 !important;
            }

            .media-loading__backdrop {
                display: none !important;
            }

            .media-loading__shade {
                display: none !important;
            }

            .media-loading__mark-background {
                display: none !important;
            }

            .media-loading__mark-fill {
                display: none !important;
            }

            .media-loading__mark-content {
                display: none !important;
            }

            .media-loading__mark::after {
                content: "GALFLIX" !important;

                display: block !important;

                font-family: Impact, "Arial Black", Arial, sans-serif !important;

                font-size: 90px !important;

                font-weight: 900 !important;

                letter-spacing: 8px !important;

                color: #E50914 !important;

                text-align: center !important;

                white-space: nowrap !important;

                text-shadow:
                    0 0 15px rgba(229,9,20,.6),
                    0 0 40px rgba(229,9,20,.35) !important;
            }

            .media-loading__status {
                color: white !important;
                margin-top: 40px !important;
            }
        `;

        document.head.appendChild(style);

        /*
         * Detect Lampa's actual loading screen.
         */

        var observer = new MutationObserver(function () {

            var loader = document.querySelector('.media-loading');

            if (loader) {
                console.log('[GALFLIX] MEDIA LOADING FOUND');

                loader.classList.add('galflix-active');
            }

        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        /*
         * Check immediately too.
         */

        if (document.querySelector('.media-loading')) {
            console.log('[GALFLIX] MEDIA LOADING ALREADY EXISTS');
        }
    }


    /*
     * Wait for Lampa.
     */

    var timer = setInterval(function () {

        if (typeof Lampa !== 'undefined') {

            clearInterval(timer);

            install();

        }

    }, 100);


})();
