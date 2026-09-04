(function () {
    'use strict';

    var PLUGIN_ID = 'galflix_preload_v5';

    /*
     * Netflix-style Tudum sound.
     *
     * If you later host the MP3 yourself, change this URL.
     */
    var SOUND_URL =
        'https://raw.githubusercontent.com/Mudas1003/Netflix-Clone/main/Netflix-Intro-Sound-Effect.mp3';

    if (window[PLUGIN_ID]) return;
    window[PLUGIN_ID] = true;


    function init() {

        var Lampa = window.Lampa;

        if (!Lampa) {
            setTimeout(init, 300);
            return;
        }


        /* =========================================================
         * CSS
         * ========================================================= */

        if (!document.getElementById('galflix-v5-css')) {

            var style = document.createElement('style');

            style.id = 'galflix-v5-css';

            style.textContent = `

                /*
                 * Main preload screen
                 */

                .media-loading.media-loading--standalone {
                    background: #000 !important;
                    z-index: 99999 !important;
                }


                /*
                 * Remove Lampa backdrop
                 */

                .media-loading.media-loading--standalone
                .media-loading__backdrop,

                .media-loading.media-loading--standalone
                .media-loading__shade {

                    display: none !important;
                }


                /*
                 * Center GALFLIX content
                 */

                .media-loading.media-loading--standalone
                .media-loading__content {

                    position: absolute !important;

                    left: 50% !important;
                    top: 50% !important;

                    transform:
                        translate(-50%, -50%) !important;

                    width: 82vw !important;
                    max-width: 1000px !important;

                    display: flex !important;
                    flex-direction: column !important;

                    align-items: center !important;
                }


                /*
                 * Hide original Lampa loading mark.
                 */

                .media-loading.media-loading--standalone
                .media-loading__mark {

                    display: none !important;
                }


                /*
                 * GALFLIX logo
                 */

                .galflix-logo {

                    color: #e50914;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    font-weight: 900;

                    font-size:
                        clamp(50px, 8vw, 105px);

                    letter-spacing: -5px;

                    line-height: 1;

                    text-align: center;

                    margin-bottom: 38px;

                    user-select: none;

                    text-shadow:
                        0 0 25px
                        rgba(229, 9, 20, 0.18);
                }


                /*
                 * Loading bar
                 */

                .galflix-progress {

                    width: 100%;

                    height: 9px;

                    background:
                        rgba(255,255,255,0.25);

                    border-radius: 20px;

                    overflow: hidden;

                    box-shadow:
                        0 0 15px
                        rgba(0,0,0,0.5);
                }


                /*
                 * Red progress
                 */

                .galflix-progress-fill {

                    width: 0%;

                    height: 100%;

                    background: #e50914;

                    border-radius: 20px;

                    transition:
                        width 0.15s linear;
                }


                /*
                 * Percentage BELOW the bar
                 */

                .galflix-percent {

                    margin-top: 14px;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    font-size: 18px;

                    font-weight: 600;

                    color:
                        rgba(255,255,255,0.78);

                    min-height: 22px;

                    text-align: center;
                }


                /*
                 * ORIGINAL LAMPA STATUS
                 *
                 * Keep peers + speed at bottom.
                 */

                .media-loading.media-loading--standalone
                .media-loading__status {

                    position: fixed !important;

                    left: 50% !important;

                    bottom: 7vh !important;

                    transform:
                        translateX(-50%) !important;

                    width: 100vw !important;

                    margin: 0 !important;

                    display: flex !important;

                    justify-content: center !important;

                    align-items: center !important;

                    gap: 12px !important;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif !important;

                    font-size: 17px !important;

                    color:
                        rgba(255,255,255,0.72) !important;
                }


                /*
                 * Keep peers
                 */

                .media-loading.media-loading--standalone
                .media-loading__peers {

                    display: inline-block !important;
                }


                /*
                 * Keep download speed
                 */

                .media-loading.media-loading--standalone
                .media-loading__speed {

                    display: inline-block !important;
                }


                /*
                 * Keep separators
                 */

                .media-loading.media-loading--standalone
                .media-loading__peers-separator,

                .media-loading.media-loading--standalone
                .media-loading__speed-separator {

                    display: inline-block !important;
                }


                /*
                 * Hide Lampa's original percentage.
                 *
                 * We display it directly under our bar.
                 */

                .media-loading.media-loading--standalone
                .media-loading__percent {

                    display: none !important;
                }

            `;

            document.head.appendChild(style);
        }


        /* =========================================================
         * SOUND
         * ========================================================= */

        var galflixSound = null;

        function setupSound() {

            if (!Lampa.Sound ||
                typeof Lampa.Sound.add !== 'function') {

                console.log(
                    '[GALFLIX] Lampa.Sound unavailable'
                );

                return;
            }

            try {

                /*
                 * Register through Lampa's own Sound engine.
                 */

                galflixSound =
                    Lampa.Sound.add(
                        'galflix_tudum',
                        {
                            url: SOUND_URL,
                            volume: 1
                        }
                    );

                if (galflixSound) {

                    console.log(
                        '[GALFLIX] Tudum sound registered'
                    );

                }

            }
            catch (e) {

                console.log(
                    '[GALFLIX] Sound error:',
                    e
                );

            }
        }


        function playTudum() {

            if (!galflixSound) return;

            try {

                /*
                 * IMPORTANT:
                 *
                 * We deliberately DO NOT use:
                 *
                 *     Lampa.Sound.play()
                 *
                 * because that obeys the global
                 * interface_sound_play setting.
                 *
                 * Direct .play() means GALFLIX can have
                 * its own sound even when navigation sounds
                 * are disabled.
                 */

                galflixSound.play();

                console.log(
                    '[GALFLIX] TUDUM'
                );

            }
            catch (e) {

                console.log(
                    '[GALFLIX] Tudum play error:',
                    e
                );

            }
        }


        /* =========================================================
         * ONLY PLAY SOUND FOR TORRENT OK
         * ========================================================= */

        function setupKeypadSound() {

            if (!Lampa.Keypad ||
                !Lampa.Keypad.listener ||
                typeof Lampa.Keypad.listener.follow !== 'function') {

                console.log(
                    '[GALFLIX] Keypad listener unavailable'
                );

                return;
            }


            /*
             * This event is fired by Lampa when the user
             * presses OK / Enter.
             *
             * We check whether the currently focused element
             * is actually inside .torrent-files.
             *
             * Therefore:
             *
             * Arrow left  -> NO sound
             * Arrow right -> NO sound
             * Arrow up    -> NO sound
             * Arrow down  -> NO sound
             * OK on menu  -> NO sound
             * OK on movie -> NO sound
             * OK on torrent -> TUDUM
             */

            Lampa.Keypad.listener.follow(
                'enter',
                function () {

                    var torrentFocus =
                        document.querySelector(
                            '.torrent-files .selector.focus'
                        );


                    /*
                     * Some Lampa configurations may not
                     * have the .focus class, so also check
                     * the active torrent selector.
                     */

                    if (!torrentFocus) {

                        var active =
                            document.querySelector(
                                '.torrent-files .selector'
                            );

                        /*
                         * Don't use the fallback unless
                         * there is exactly one torrent item.
                         */

                        var torrents =
                            document.querySelectorAll(
                                '.torrent-files .selector'
                            );

                        if (torrents.length === 1) {
                            torrentFocus = torrents[0];
                        }
                    }


                    if (!torrentFocus) return;


                    /*
                     * Small delay is NOT used here.
                     *
                     * We want Audio.play() to happen inside
                     * the same user interaction chain.
                     */

                    playTudum();

                }
            );


            console.log(
                '[GALFLIX] Keypad sound hook installed'
            );
        }


        /* =========================================================
         * PRELOAD UI
         * ========================================================= */

        var progressTimer = null;


        function buildLoader(loader) {

            if (!loader) return;


            if (
                loader.getAttribute(
                    'data-galflix'
                ) === '1'
            ) {
                return;
            }


            var content =
                loader.querySelector(
                    '.media-loading__content'
                );


            if (!content) return;


            loader.setAttribute(
                'data-galflix',
                '1'
            );


            /* -----------------------------------------------------
             * Logo
             * ----------------------------------------------------- */

            var logo =
                document.createElement('div');

            logo.className =
                'galflix-logo';

            logo.textContent =
                'GALFLIX';


            /* -----------------------------------------------------
             * Progress bar
             * ----------------------------------------------------- */

            var progress =
                document.createElement('div');

            progress.className =
                'galflix-progress';


            var progressFill =
                document.createElement('div');

            progressFill.className =
                'galflix-progress-fill';


            progress.appendChild(
                progressFill
            );


            /* -----------------------------------------------------
             * Percentage
             * ----------------------------------------------------- */

            var percentage =
                document.createElement('div');

            percentage.className =
                'galflix-percent';

            percentage.textContent =
                '0%';


            /* -----------------------------------------------------
             * Insert
             * ----------------------------------------------------- */

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
                    progress,
                    status
                );

                content.insertBefore(
                    percentage,
                    status
                );

            }
            else {

                content.appendChild(
                    progress
                );

                content.appendChild(
                    percentage
                );

            }


            /*
             * Find Lampa's REAL progress element.
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

                    if (progressTimer) {

                        clearInterval(
                            progressTimer
                        );

                        progressTimer = null;
                    }

                    return;
                }


                /*
                 * Lampa writes the REAL percentage
                 * directly into style.width.
                 *
                 * Example:
                 *
                 *     3%
                 *     17%
                 *     52%
                 *     94%
                 */

                if (originalFill) {

                    var width =
                        originalFill.style.width;


                    if (width) {

                        progressFill.style.width =
                            width;

                        percentage.textContent =
                            width;
                    }
                }


                /*
                 * Extra fallback using Lampa's percent text.
                 */

                if (
                    originalPercent &&
                    originalPercent.textContent
                ) {

                    var text =
                        originalPercent.textContent
                            .trim();


                    if (
                        text &&
                        text.indexOf('%') >= 0
                    ) {

                        percentage.textContent =
                            text;

                    }
                }

            }


            if (progressTimer) {

                clearInterval(
                    progressTimer
                );
            }


            /*
             * Polling at 50ms is cheap and gives us
             * a smooth visual bar while Lampa itself
             * updates every ~1 second.
             */

            progressTimer =
                setInterval(
                    syncProgress,
                    50
                );


            syncProgress();
        }


        /* =========================================================
         * WATCH FOR LAMPA PRELOAD
         * ========================================================= */

        function watchLoader() {

            if (
                typeof MutationObserver ===
                'undefined'
            ) {
                return;
            }


            var observer =
                new MutationObserver(
                    function () {

                        var loaders =
                            document.querySelectorAll(
                                '.media-loading.media-loading--standalone'
                            );


                        for (
                            var i = 0;
                            i < loaders.length;
                            i++
                        ) {

                            buildLoader(
                                loaders[i]
                            );
                        }

                    }
                );


            observer.observe(
                document.body,
                {
                    childList: true,
                    subtree: true
                }
            );


            /*
             * Handle an already-existing loader.
             */

            var existing =
                document.querySelectorAll(
                    '.media-loading.media-loading--standalone'
                );


            for (
                var i = 0;
                i < existing.length;
                i++
            ) {

                buildLoader(
                    existing[i]
                );
            }
        }


        /* =========================================================
         * START
         * ========================================================= */

        setupSound();

        setupKeypadSound();

        watchLoader();


        console.log(
            '[GALFLIX] v5 loaded'
        );
    }


    /*
     * Wait for Lampa.
     */

    if (window.Lampa) {

        init();

    }
    else {

        var wait =
            setInterval(
                function () {

                    if (window.Lampa) {

                        clearInterval(wait);

                        init();

                    }

                },
                100
            );
    }

})();
