(function () {
    'use strict';

    var PLUGIN_ID = 'galflix_preload_v6';

    if (window[PLUGIN_ID]) return;
    window[PLUGIN_ID] = true;


    /*
     * ============================================================
     * SETTINGS
     * ============================================================
     */

    var SOUND_URL =
        'https://raw.githubusercontent.com/Mudas1003/Netflix-Clone/main/Netflix-Intro-Sound-Effect.mp3';


    /*
     * ============================================================
     * WAIT FOR LAMPA
     * ============================================================
     */

    function init() {

        if (!window.Lampa) {
            setTimeout(init, 250);
            return;
        }


        /*
         * ========================================================
         * CSS
         * ========================================================
         */

        if (!document.getElementById('galflix-v6-css')) {

            var style = document.createElement('style');

            style.id = 'galflix-v6-css';

            style.textContent = `

                /*
                 * ------------------------------------------------
                 * FULL PRELOAD SCREEN
                 * ------------------------------------------------
                 */

                .media-loading.media-loading--standalone {

                    background: #000 !important;

                    z-index: 99999 !important;
                }


                /*
                 * Remove Lampa movie backdrop.
                 */

                .media-loading.media-loading--standalone
                .media-loading__backdrop,

                .media-loading.media-loading--standalone
                .media-loading__shade {

                    display: none !important;
                }


                /*
                 * ------------------------------------------------
                 * GALFLIX CONTENT
                 * ------------------------------------------------
                 *
                 * Move the whole central section upward so it
                 * never collides with the bottom statistics.
                 */

                .media-loading.media-loading--standalone
                .media-loading__content {

                    position: absolute !important;

                    left: 50% !important;

                    top: 40% !important;

                    transform:
                        translate(-50%, -50%) !important;

                    width: 82vw !important;

                    max-width: 1000px !important;

                    display: flex !important;

                    flex-direction: column !important;

                    align-items: center !important;

                    justify-content: center !important;
                }


                /*
                 * Hide original Lampa logo/mark.
                 */

                .media-loading.media-loading--standalone
                .media-loading__mark {

                    display: none !important;
                }


                /*
                 * ------------------------------------------------
                 * GALFLIX LOGO
                 * ------------------------------------------------
                 */

                .galflix-logo {

                    color: #e50914 !important;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif !important;

                    font-weight: 900 !important;

                    font-size:
                        clamp(50px, 8vw, 105px) !important;

                    letter-spacing: -5px !important;

                    line-height: 1 !important;

                    text-align: center !important;

                    margin: 0 0 42px 0 !important;

                    padding: 0 !important;

                    user-select: none !important;

                    text-shadow:
                        0 0 30px
                        rgba(229, 9, 20, .20);
                }


                /*
                 * ------------------------------------------------
                 * PROGRESS BAR
                 * ------------------------------------------------
                 */

                .galflix-progress {

                    width: 100% !important;

                    height: 9px !important;

                    background:
                        rgba(255,255,255,.25) !important;

                    border-radius: 20px !important;

                    overflow: hidden !important;

                    box-shadow:
                        0 0 15px
                        rgba(0,0,0,.5);
                }


                .galflix-progress-fill {

                    width: 0%;

                    height: 100%;

                    background: #e50914 !important;

                    border-radius: 20px !important;

                    transition:
                        width .15s linear !important;
                }


                /*
                 * ------------------------------------------------
                 * PERCENTAGE
                 * ------------------------------------------------
                 *
                 * This is BELOW the bar.
                 */

                .galflix-percent {

                    margin-top: 14px !important;

                    min-height: 24px !important;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif !important;

                    font-size: 19px !important;

                    font-weight: 600 !important;

                    color:
                        rgba(255,255,255,.80) !important;

                    line-height: 24px !important;

                    text-align: center !important;
                }


                /*
                 * ------------------------------------------------
                 * ORIGINAL LAMPA STATUS
                 * ------------------------------------------------
                 *
                 * Peers + download speed remain at the very bottom.
                 */

                .media-loading.media-loading--standalone
                .media-loading__status {

                    position: fixed !important;

                    left: 0 !important;

                    right: 0 !important;

                    bottom: 7vh !important;

                    width: 100% !important;

                    height: auto !important;

                    margin: 0 !important;

                    padding: 0 !important;

                    transform: none !important;

                    display: flex !important;

                    justify-content: center !important;

                    align-items: center !important;

                    gap: 12px !important;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif !important;

                    font-size: 17px !important;

                    line-height: 22px !important;

                    color:
                        rgba(255,255,255,.72) !important;
                }


                /*
                 * Keep peers.
                 */

                .media-loading.media-loading--standalone
                .media-loading__peers {

                    display: inline-flex !important;

                    align-items: center !important;
                }


                /*
                 * Keep download speed.
                 */

                .media-loading.media-loading--standalone
                .media-loading__speed {

                    display: inline-block !important;
                }


                /*
                 * Keep separators.
                 */

                .media-loading.media-loading--standalone
                .media-loading__peers-separator,

                .media-loading.media-loading--standalone
                .media-loading__speed-separator {

                    display: inline-block !important;
                }


                /*
                 * Hide Lampa's original percentage because
                 * GALFLIX has its own percentage under the bar.
                 */

                .media-loading.media-loading--standalone
                .media-loading__percent {

                    display: none !important;
                }

            `;

            document.head.appendChild(style);
        }


        /*
         * ========================================================
         * TUDUM AUDIO
         * ========================================================
         *
         * IMPORTANT:
         *
         * We do NOT use Lampa.Sound.play().
         *
         * This means Lampa's:
         *
         *     System sounds = No
         *
         * does not disable GALFLIX.
         */

        var tudum = null;

        try {

            tudum = new Audio();

            tudum.preload = 'auto';

            tudum.src = SOUND_URL;

            tudum.volume = 1.0;

            /*
             * Start loading immediately.
             */

            tudum.load();

            console.log(
                '[GALFLIX] Tudum audio prepared'
            );

        }
        catch (e) {

            console.log(
                '[GALFLIX] Audio creation error:',
                e
            );
        }


        /*
         * ========================================================
         * PLAY TUDUM
         * ========================================================
         */

        function playTudum(loader) {

            if (!tudum) return;


            /*
             * Prevent duplicate playback for the same splash.
             */

            if (
                loader.getAttribute(
                    'data-galflix-sound'
                ) === 'played'
            ) {
                return;
            }


            loader.setAttribute(
                'data-galflix-sound',
                'played'
            );


            try {

                tudum.currentTime = 0;

                var promise =
                    tudum.play();


                if (promise &&
                    typeof promise.catch === 'function') {

                    promise.catch(
                        function (error) {

                            /*
                             * Do NOT retry repeatedly.
                             *
                             * Otherwise we get the exact
                             * "ta-ta-ta" problem we had before.
                             */

                            console.log(
                                '[GALFLIX] Tudum playback rejected:',
                                error
                            );
                        }
                    );
                }

                console.log(
                    '[GALFLIX] TUDUM PLAY'
                );

            }
            catch (e) {

                console.log(
                    '[GALFLIX] Tudum playback error:',
                    e
                );
            }
        }


        /*
         * ========================================================
         * RESET SOUND WHEN SPLASH DISAPPEARS
         * ========================================================
         *
         * The same DOM element can potentially be reused.
         *
         * Once it becomes hidden again, remove the flag so that
         * the next preload gets one new Tudum.
         */

        function resetSoundIfHidden(loader) {

            if (
                loader.classList.contains('hide')
            ) {

                if (
                    loader.getAttribute(
                        'data-galflix-sound'
                    ) === 'played'
                ) {

                    loader.removeAttribute(
                        'data-galflix-sound'
                    );
                }

                return true;
            }

            return false;
        }


        /*
         * ========================================================
         * BUILD GALFLIX UI
         * ========================================================
         */

        var progressTimers = new WeakMap();


        function buildLoader(loader) {

            if (!loader) return;


            var content =
                loader.querySelector(
                    '.media-loading__content'
                );


            if (!content) return;


            /*
             * Don't build the UI twice.
             */

            if (
                loader.getAttribute(
                    'data-galflix-ui'
                ) === '1'
            ) {

                return;
            }


            loader.setAttribute(
                'data-galflix-ui',
                '1'
            );


            /*
             * ----------------------------------------------------
             * LOGO
             * ----------------------------------------------------
             */

            var logo =
                document.createElement('div');

            logo.className =
                'galflix-logo';

            logo.textContent =
                'GALFLIX';


            /*
             * ----------------------------------------------------
             * BAR
             * ----------------------------------------------------
             */

            var bar =
                document.createElement('div');

            bar.className =
                'galflix-progress';


            var fill =
                document.createElement('div');

            fill.className =
                'galflix-progress-fill';


            bar.appendChild(
                fill
            );


            /*
             * ----------------------------------------------------
             * PERCENTAGE
             * ----------------------------------------------------
             */

            var percent =
                document.createElement('div');

            percent.className =
                'galflix-percent';

            percent.textContent =
                '0%';


            /*
             * ----------------------------------------------------
             * INSERT
             * ----------------------------------------------------
             */

            var status =
                content.querySelector(
                    '.media-loading__status'
                );


            content.insertBefore(
                logo,
                content.firstChild
            );


            if (status) {

                content.insertBefore(
                    bar,
                    status
                );

                content.insertBefore(
                    percent,
                    status
                );

            }
            else {

                content.appendChild(
                    bar
                );

                content.appendChild(
                    percent
                );
            }


            /*
             * ----------------------------------------------------
             * REAL LAMPA PROGRESS
             * ----------------------------------------------------
             */

            var originalFill =
                loader.querySelector(
                    '.media-loading__mark-fill'
                );


            var originalPercent =
                loader.querySelector(
                    '.media-loading__percent'
                );


            function syncProgress() {

                if (
                    !document.body.contains(loader)
                ) {

                    var timer =
                        progressTimers.get(loader);

                    if (timer) {

                        clearInterval(timer);

                        progressTimers.delete(loader);
                    }

                    return;
                }


                /*
                 * Lampa writes:
                 *
                 *     style="width: 35%"
                 *
                 * directly on this element.
                 *
                 * We copy that exact value.
                 */

                if (originalFill) {

                    var width =
                        originalFill.style.width;


                    if (width) {

                        fill.style.width =
                            width;


                        /*
                         * Use the exact percentage.
                         */

                        percent.textContent =
                            width;
                    }
                }


                /*
                 * Extra fallback from Lampa's text.
                 */

                if (
                    originalPercent &&
                    originalPercent.textContent
                ) {

                    var text =
                        originalPercent
                            .textContent
                            .trim();


                    if (
                        text &&
                        text.indexOf('%') !== -1
                    ) {

                        percent.textContent =
                            text;
                    }
                }
            }


            var timer =
                setInterval(
                    syncProgress,
                    100
                );


            progressTimers.set(
                loader,
                timer
            );


            syncProgress();
        }


        /*
         * ========================================================
         * DETECT SPLASH VISIBILITY
         * ========================================================
         *
         * THIS IS THE IMPORTANT PART.
         *
         * We don't care about:
         *
         *   keydown
         *   keyup
         *   hover
         *   enter
         *   mouse
         *
         * We simply watch for:
         *
         *     .media-loading
         *
         * becoming visible.
         */

        function checkLoaders() {

            var loaders =
                document.querySelectorAll(
                    '.media-loading.media-loading--standalone'
                );


            for (
                var i = 0;
                i < loaders.length;
                i++
            ) {

                var loader =
                    loaders[i];


                /*
                 * Build UI even if hidden.
                 */

                buildLoader(loader);


                /*
                 * If hidden, prepare it for the
                 * next preload.
                 */

                if (
                    resetSoundIfHidden(loader)
                ) {
                    continue;
                }


                /*
                 * Splash is visible.
                 *
                 * Play Tudum ONCE.
                 */

                if (
                    !loader.classList.contains('hide')
                ) {

                    playTudum(loader);
                }
            }
        }


        /*
         * ========================================================
         * MUTATION OBSERVER
         * ========================================================
         */

        if (
            typeof MutationObserver !==
            'undefined'
        ) {

            var observer =
                new MutationObserver(
                    function () {

                        checkLoaders();

                    }
                );


            observer.observe(
                document.body,
                {
                    childList: true,

                    subtree: true,

                    attributes: true,

                    attributeFilter: [
                        'class'
                    ]
                }
            );
        }


        /*
         * Initial scan.
         */

        checkLoaders();


        /*
         * Backup polling.
         *
         * This is deliberately slow and only checks state.
         * It cannot restart the sound because the loader is
         * marked as played.
         */

        setInterval(
            checkLoaders,
            500
        );


        console.log(
            '[GALFLIX] v6 loaded'
        );
    }


    init();

})();
