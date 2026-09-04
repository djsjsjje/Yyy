(function () {
    'use strict';

    var NETFLIX_SOUND =
        'https://raw.githubusercontent.com/Mudas1003/Netflix-Clone/main/Netflix-Intro-Sound-Effect.mp3';

    var audio = null;
    var lastAudioTime = 0;
    var observer = null;
    var styleId = 'galflix-media-loading-style';

    /* =========================================================
       AUDIO
       ========================================================= */

    function initAudio() {
        if (!audio) {
            audio = new Audio(NETFLIX_SOUND);
            audio.volume = 0.9;
            audio.preload = 'auto';
        }

        return audio;
    }

    function playTudum() {
        var now = Date.now();

        if (now - lastAudioTime < 3000) return;

        lastAudioTime = now;

        var player = initAudio();

        try {
            player.pause();
            player.currentTime = 0;

            var promise = player.play();

            if (promise && promise.catch) {
                promise.catch(function (e) {
                    console.log('[Galflix] Audio blocked:', e);
                });
            }
        } catch (e) {
            console.log('[Galflix] Audio error:', e);
        }
    }


    /* =========================================================
       AUDIO UNLOCK
       ========================================================= */

    function unlockAudio() {
        var player = initAudio();

        player.play()
            .then(function () {
                player.pause();
                player.currentTime = 0;
            })
            .catch(function () {});

        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    }


    /* =========================================================
       GALFLIX CSS
       ========================================================= */

    function injectStyle() {

        if (document.getElementById(styleId)) return;

        var style = document.createElement('style');
        style.id = styleId;

        style.textContent = `

        /* =====================================================
           GALFLIX PRELOAD SCREEN
           Current Lampa uses .media-loading
           ===================================================== */

        .media-loading.media-loading--standalone {

            position: fixed !important;

            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;

            width: 100vw !important;
            height: 100vh !important;

            margin: 0 !important;
            padding: 0 !important;

            background: #141414 !important;

            z-index: 99999999 !important;

            display: flex !important;
            align-items: center !important;
            justify-content: center !important;

            overflow: hidden !important;
        }


        /* Remove movie backdrop */

        .media-loading.media-loading--standalone
        .media-loading__backdrop,

        .media-loading.media-loading--standalone
        .media-loading__shade {

            display: none !important;
        }


        /* Center content */

        .media-loading.media-loading--standalone
        .media-loading__content {

            position: relative !important;

            width: 100% !important;
            height: 100% !important;

            display: flex !important;
            flex-direction: column !important;

            align-items: center !important;
            justify-content: center !important;

            margin: 0 !important;
            padding: 0 !important;
        }


        /* =====================================================
           GALFLIX LOGO
           ===================================================== */

        .media-loading.media-loading--standalone
        .media-loading__mark {

            position: relative !important;

            width: auto !important;
            height: auto !important;

            margin: 0 0 35px 0 !important;

            background: none !important;

            overflow: visible !important;

            transform-origin: center !important;

            animation: galflixPulse 2s ease-in-out infinite alternate !important;
        }


        /* Completely replace Lampa's movie logo */

        .media-loading.media-loading--standalone
        .media-loading__mark-background,

        .media-loading.media-loading--standalone
        .media-loading__mark-fill {

            display: none !important;
        }


        .media-loading.media-loading--standalone
        .media-loading__mark::after {

            content: "GALFLIX" !important;

            display: block !important;

            font-family:
                Impact,
                "Arial Black",
                Arial,
                sans-serif !important;

            font-size: clamp(48px, 8vw, 110px) !important;

            font-weight: 900 !important;

            letter-spacing: 7px !important;

            line-height: 1 !important;

            color: #E50914 !important;

            text-transform: uppercase !important;

            white-space: nowrap !important;

            text-align: center !important;

            text-shadow:
                0 0 15px rgba(229, 9, 20, .45),
                0 0 40px rgba(229, 9, 20, .25),
                0 4px 8px rgba(0, 0, 0, .8) !important;
        }


        /* =====================================================
           PROGRESS AREA
           ===================================================== */

        .media-loading.media-loading--standalone
        .media-loading__status {

            display: flex !important;

            align-items: center !important;
            justify-content: center !important;

            min-width: 280px !important;

            margin: 0 !important;

            font-family: Arial, sans-serif !important;

            font-size: 14px !important;

            color: rgba(255,255,255,.75) !important;
        }


        /* Hide peer/speed information */

        .media-loading.media-loading--standalone
        .media-loading__peers,

        .media-loading.media-loading--standalone
        .media-loading__speed,

        .media-loading.media-loading--standalone
        .media-loading__separator {

            display: none !important;
        }


        /* Percentage */

        .media-loading.media-loading--standalone
        .media-loading__percent {

            display: block !important;

            margin: 0 !important;

            font-size: 14px !important;

            font-weight: 600 !important;

            color: rgba(255,255,255,.8) !important;
        }


        /* =====================================================
           PROGRESS BAR
           ===================================================== */

        .media-loading.media-loading--standalone
        .media-loading__status::before {

            content: "" !important;

            position: absolute !important;

            width: 280px !important;

            height: 4px !important;

            margin-top: 55px !important;

            background: rgba(255,255,255,.14) !important;

            border-radius: 10px !important;
        }


        /* Use the REAL Lampa progress */

        .media-loading.media-loading--standalone
        .media-loading__mark::before {

            content: "" !important;

            position: absolute !important;

            left: 50% !important;

            top: calc(100% + 38px) !important;

            transform: translateX(-50%) !important;

            width: 0 !important;

            height: 4px !important;

            background: #E50914 !important;

            border-radius: 10px !important;

            box-shadow:
                0 0 8px #E50914,
                0 0 18px rgba(229,9,20,.5) !important;
        }


        /* =====================================================
           ANIMATION
           ===================================================== */

        @keyframes galflixPulse {

            0% {
                transform: scale(.98);
                opacity: .88;
            }

            100% {
                transform: scale(1.02);
                opacity: 1;
            }
        }


        /* =====================================================
           MOBILE / TV SAFE
           ===================================================== */

        @media (max-width: 700px) {

            .media-loading.media-loading--standalone
            .media-loading__mark::after {

                font-size: 52px !important;
                letter-spacing: 4px !important;
            }

        }

        `;

        document.head.appendChild(style);

        console.log('[Galflix] CSS installed');
    }


    /* =========================================================
       WATCH FOR LAMPA'S REAL LOADING COMPONENT
       ========================================================= */

    function watchLoadingScreen() {

        if (observer) return;

        observer = new MutationObserver(function (mutations) {

            mutations.forEach(function (mutation) {

                for (var i = 0; i < mutation.addedNodes.length; i++) {

                    var node = mutation.addedNodes[i];

                    if (!node || node.nodeType !== 1) continue;

                    var element = $(node);

                    if (
                        element.hasClass('media-loading') ||
                        element.find('.media-loading').length
                    ) {

                        console.log('[Galflix] Media loading detected');

                        playTudum();

                        break;
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('[Galflix] Loading observer installed');
    }


    /* =========================================================
       FIX REAL PROGRESS BAR
       ========================================================= */

    function watchProgress() {

        var timer = setInterval(function () {

            var loading = $('.media-loading.media-loading--standalone');

            if (!loading.length) return;

            var fill = loading.find('.media-loading__mark-fill');

            if (!fill.length) return;

            /*
             * Lampa itself changes the fill width.
             *
             * Copy that percentage to a CSS variable.
             */

            var width = fill.css('width');

            if (width) {

                var parentWidth = fill.parent().width();

                if (parentWidth) {

                    var percent =
                        Math.min(
                            100,
                            Math.max(
                                0,
                                parseFloat(width) / parentWidth * 100
                            )
                        );

                    loading[0].style.setProperty(
                        '--galflix-progress',
                        percent + '%'
                    );

                    loading[0].style.setProperty(
                        '--galflix-progress-width',
                        (280 * percent / 100) + 'px'
                    );

                    loading.find('.media-loading__mark')
                        .get(0)
                        .style.setProperty(
                            '--galflix-progress-width',
                            (280 * percent / 100) + 'px'
                        );
                }
            }

        }, 250);

        /*
         * CSS can't directly calculate the original fill because
         * we hide the original Lampa element.
         *
         * Instead update our pseudo-element width.
         */

        var extraStyle = document.createElement('style');

        extraStyle.textContent = `

            .media-loading.media-loading--standalone
            .media-loading__mark::before {

                width: var(
                    --galflix-progress-width,
                    0px
                ) !important;
            }

        `;

        document.head.appendChild(extraStyle);
    }


    /* =========================================================
       START
       ========================================================= */

    function startPlugin() {

        if (window.galflix_plugin_started) return;

        window.galflix_plugin_started = true;

        console.log('[Galflix] Starting plugin...');

        injectStyle();

        /*
         * Lampa must already have a body.
         */

        if (document.body) {
            watchLoadingScreen();
            watchProgress();
        }

        /*
         * Unlock audio on first TV interaction.
         */

        window.addEventListener('keydown', unlockAudio, {
            once: true
        });

        window.addEventListener('click', unlockAudio, {
            once: true
        });

        window.addEventListener('touchstart', unlockAudio, {
            once: true
        });

        console.log('[Galflix] Plugin ready');
    }


    /* =========================================================
       BOOTSTRAP
       ========================================================= */

    function bootstrap() {

        if (typeof Lampa === 'undefined') {

            setTimeout(bootstrap, 200);

            return;
        }

        if (window.appready) {

            startPlugin();

        } else if (
            Lampa.Listener &&
            Lampa.Listener.follow
        ) {

            Lampa.Listener.follow(
                'app',
                function (e) {

                    if (e.type === 'ready') {
                        startPlugin();
                    }

                }
            );

            /*
             * Safety net in case the ready event happened
             * immediately before our listener was installed.
             */

            setTimeout(function () {

                if (window.appready) {
                    startPlugin();
                }

            }, 1500);

        } else {

            startPlugin();

        }
    }


    bootstrap();

})();
