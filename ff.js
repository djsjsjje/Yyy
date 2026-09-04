(function () {
    'use strict';

    var PLUGIN_ID = 'galflix_preload_v6';

    if (window[PLUGIN_ID]) return;
    window[PLUGIN_ID] = true;

    var SOUND_URL =
        'https://raw.githubusercontent.com/Mudas1003/Netflix-Clone/main/Netflix-Intro-Sound-Effect.mp3';

    function init() {
        if (!window.Lampa) {
            setTimeout(init, 250);
            return;
        }

        /* =========================================================
           GALFLIX PRELOAD SCREEN
           ========================================================= */

        var style = document.createElement('style');

        style.textContent = `
        /* ---------------------------------------------------------
           FULLSCREEN LOADER
           --------------------------------------------------------- */

        .media-loading.media-loading--standalone {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;

            width: 100vw !important;
            height: 100vh !important;

            margin: 0 !important;
            padding: 0 !important;

            background: #000 !important;

            z-index: 99999 !important;
            overflow: hidden !important;
        }


        /* ---------------------------------------------------------
           REMOVE ORIGINAL BACKDROP
           --------------------------------------------------------- */

        .media-loading.media-loading--standalone
        .media-loading__backdrop,

        .media-loading.media-loading--standalone
        .media-loading__shade {
            display: none !important;
        }


        /* ---------------------------------------------------------
           CONTENT CONTAINER
           IMPORTANT:
           No transform here. This prevents fixed/absolute
           children from inheriting the old Lampa positioning.
           --------------------------------------------------------- */

        .media-loading.media-loading--standalone
        .media-loading__content {
            position: absolute !important;

            left: 0 !important;
            top: 0 !important;

            width: 100vw !important;
            height: 100vh !important;

            margin: 0 !important;
            padding: 0 !important;

            transform: none !important;

            display: block !important;

            overflow: hidden !important;
        }


        /* ---------------------------------------------------------
           REMOVE ORIGINAL LOADING MARK
           --------------------------------------------------------- */

        .media-loading.media-loading--standalone
        .media-loading__mark {
            display: none !important;
        }


        /* ---------------------------------------------------------
           GALFLIX LOGO
           --------------------------------------------------------- */

        .galflix-logo {
            position: absolute !important;

            left: 50% !important;
            top: 31% !important;

            transform: translateX(-50%) !important;

            margin: 0 !important;
            padding: 0 !important;

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

            white-space: nowrap !important;

            text-align: center !important;

            user-select: none !important;

            text-shadow:
                0 0 30px rgba(229, 9, 20, .20);
        }


        /* ---------------------------------------------------------
           GALFLIX PROGRESS BAR
           --------------------------------------------------------- */

        .galflix-progress {
            position: absolute !important;

            left: 9vw !important;
            top: 51% !important;

            width: 82vw !important;
            height: 9px !important;

            margin: 0 !important;
            padding: 0 !important;

            background:
                rgba(255, 255, 255, .25) !important;

            border-radius: 20px !important;

            overflow: hidden !important;

            box-shadow:
                0 0 15px rgba(0, 0, 0, .5) !important;
        }


        .galflix-progress-fill {
            width: 0%;

            height: 100%;

            margin: 0;
            padding: 0;

            background: #e50914 !important;

            border-radius: 20px !important;

            transition:
                width .15s linear !important;
        }


        /* ---------------------------------------------------------
           PERCENTAGE
           --------------------------------------------------------- */

        .galflix-percent {
            position: absolute !important;

            left: 50% !important;
            top: 53.2% !important;

            transform: translateX(-50%) !important;

            margin: 0 !important;
            padding: 0 !important;

            min-height: 0 !important;

            font-family:
                Arial,
                Helvetica,
                sans-serif !important;

            font-size: 19px !important;

            font-weight: 600 !important;

            line-height: 24px !important;

            color:
                rgba(255, 255, 255, .80) !important;

            text-align: center !important;

            white-space: nowrap !important;
        }


        /* ---------------------------------------------------------
           ORIGINAL STATUS AREA
           SPEED + PEERS
           
           Locked to the bottom of the screen.
           --------------------------------------------------------- */

        .media-loading.media-loading--standalone
        .media-loading__status {
            position: absolute !important;

            left: 0 !important;
            right: 0 !important;

            bottom: 4vh !important;

            top: auto !important;

            width: 100vw !important;
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
                rgba(255, 255, 255, .72) !important;

            white-space: nowrap !important;

            z-index: 10 !important;
        }


        /* ---------------------------------------------------------
           PEERS
           --------------------------------------------------------- */

        .media-loading.media-loading--standalone
        .media-loading__peers {
            position: static !important;

            display: inline-flex !important;

            align-items: center !important;

            margin: 0 !important;
            padding: 0 !important;

            transform: none !important;
        }


        .media-loading.media-loading--standalone
        .media-loading__peers-icon {
            position: static !important;

            margin: 0 5px 0 0 !important;

            transform: none !important;
        }


        /* ---------------------------------------------------------
           SPEED
           --------------------------------------------------------- */

        .media-loading.media-loading--standalone
        .media-loading__speed {
            position: static !important;

            display: inline-block !important;

            margin: 0 !important;
            padding: 0 !important;

            transform: none !important;
        }


        /* ---------------------------------------------------------
           SEPARATORS
           --------------------------------------------------------- */

        .media-loading.media-loading--standalone
        .media-loading__peers-separator,

        .media-loading.media-loading--standalone
        .media-loading__speed-separator {
            position: static !important;

            display: inline-block !important;

            margin: 0 !important;
            padding: 0 !important;

            transform: none !important;
        }


        /* ---------------------------------------------------------
           HIDE ORIGINAL LAMPA PERCENTAGE
           
           We use our own percentage below the progress bar.
           --------------------------------------------------------- */

        .media-loading.media-loading--standalone
        .media-loading__percent {
            display: none !important;
        }
        `;

        document.head.appendChild(style);


        /* =========================================================
           TUDUM SOUND
           ========================================================= */

        var tudum = null;

        try {
            tudum = new Audio();

            tudum.preload = 'auto';

            tudum.src = SOUND_URL;

            tudum.volume = 1.0;

            tudum.load();

            console.log('[GALFLIX] Tudum audio prepared');

        } catch (e) {
            console.log(
                '[GALFLIX] Audio initialization error:',
                e
            );
        }


        /* =========================================================
           PLAY TUDUM
           ========================================================= */

        function playTudum(loader) {

            if (!tudum) return;

            /*
             * Prevent the sound from playing repeatedly
             * while MutationObserver fires.
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

                var promise = tudum.play();

                if (
                    promise &&
                    typeof promise.catch === 'function'
                ) {
                    promise.catch(function (error) {

                        console.log(
                            '[GALFLIX] Tudum playback rejected:',
                            error
                        );

                    });
                }

                console.log('[GALFLIX] TUDUM PLAY');

            } catch (e) {

                console.log(
                    '[GALFLIX] Tudum playback error:',
                    e
                );

            }
        }


        /* =========================================================
           RESET SOUND WHEN LOADER DISAPPEARS
           ========================================================= */

        function resetSoundIfHidden(loader) {

            if (loader.classList.contains('hide')) {

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


        /* =========================================================
           PROGRESS TRACKING
           ========================================================= */

        var progressTimers = new WeakMap();


        /* =========================================================
           BUILD GALFLIX UI
           ========================================================= */

        function buildLoader(loader) {

            if (!loader) return;

            var content =
                loader.querySelector(
                    '.media-loading__content'
                );

            if (!content) return;

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


            /* -----------------------------------------------------
               LOGO
               ----------------------------------------------------- */

            var logo =
                document.createElement('div');

            logo.className =
                'galflix-logo';

            logo.textContent =
                'GALFLIX';


            /* -----------------------------------------------------
               PROGRESS BAR
               ----------------------------------------------------- */

            var bar =
                document.createElement('div');

            bar.className =
                'galflix-progress';


            var fill =
                document.createElement('div');

            fill.className =
                'galflix-progress-fill';


            bar.appendChild(fill);


            /* -----------------------------------------------------
               PERCENT
               ----------------------------------------------------- */

            var percent =
                document.createElement('div');

            percent.className =
                'galflix-percent';

            percent.textContent =
                '0%';


            /* -----------------------------------------------------
               ORIGINAL STATUS
               ----------------------------------------------------- */

            var status =
                content.querySelector(
                    '.media-loading__status'
                );


            /* -----------------------------------------------------
               INSERT ELEMENTS
               ----------------------------------------------------- */

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

            } else {

                content.appendChild(bar);

                content.appendChild(percent);
            }


            /* -----------------------------------------------------
               ORIGINAL LAMPA PROGRESS ELEMENT
               ----------------------------------------------------- */

            var originalFill =
                loader.querySelector(
                    '.media-loading__mark-fill'
                );


            var originalPercent =
                loader.querySelector(
                    '.media-loading__percent'
                );


            /* -----------------------------------------------------
               SYNC PROGRESS
               ----------------------------------------------------- */

            function syncProgress() {

                if (
                    !document.body.contains(loader)
                ) {

                    var oldTimer =
                        progressTimers.get(loader);

                    if (oldTimer) {

                        clearInterval(oldTimer);

                        progressTimers.delete(
                            loader
                        );
                    }

                    return;
                }


                /* ---------------------------------------------
                   Read width directly from Lampa
                   --------------------------------------------- */

                if (originalFill) {

                    var width =
                        originalFill.style.width;

                    if (width) {

                        fill.style.width =
                            width;

                        percent.textContent =
                            width;
                    }
                }


                /* ---------------------------------------------
                   Also read original percentage text
                   --------------------------------------------- */

                if (
                    originalPercent &&
                    originalPercent.textContent
                ) {

                    var text =
                        originalPercent.textContent.trim();

                    if (
                        text &&
                        text.indexOf('%') !== -1
                    ) {

                        percent.textContent =
                            text;
                    }
                }
            }


            /* -----------------------------------------------------
               Poll Lampa progress
               ----------------------------------------------------- */

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


        /* =========================================================
           FIND ACTIVE PRELOAD LOADERS
           ========================================================= */

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


                /* Build UI */

                buildLoader(loader);


                /* Reset sound if hidden */

                if (
                    resetSoundIfHidden(loader)
                ) {
                    continue;
                }


                /* Play sound once when visible */

                if (
                    !loader.classList.contains(
                        'hide'
                    )
                ) {

                    playTudum(loader);
                }
            }
        }


        /* =========================================================
           MUTATION OBSERVER
           ========================================================= */

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
                    attributeFilter: ['class']
                }
            );
        }


        /* =========================================================
           INITIAL CHECK
           ========================================================= */

        checkLoaders();


        /* =========================================================
           BACKUP CHECK
           ========================================================= */

        setInterval(
            checkLoaders,
            500
        );


        console.log(
            '[GALFLIX] v6 fixed loaded'
        );
    }


    /* =============================================================
       WAIT FOR LAMPA
       ============================================================= */

    init();

})();
