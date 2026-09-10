(function () {
    'use strict';

    var PLUGIN_ID = 'galflix_preload_v20';

    if (window[PLUGIN_ID]) return;
    window[PLUGIN_ID] = true;

    var SOUND_URL =
        'https://raw.githubusercontent.com/Mudas1003/Netflix-Clone/main/Netflix-Intro-Sound-Effect.mp3';


    /* =========================================================
       INIT
       ========================================================= */

    function init() {

        if (!window.Lampa) {
            setTimeout(init, 250);
            return;
        }


        /* =====================================================
           GOOGLE FONT
           ===================================================== */

        if (!document.getElementById('galflix-font')) {

            var fontLink =
                document.createElement('link');

            fontLink.id =
                'galflix-font';

            fontLink.rel =
                'stylesheet';

            fontLink.href =
                'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap';

            document.head.appendChild(
                fontLink
            );
        }


        /* =====================================================
           CSS
           
           Based directly on the CSS/layout from jjjj.js
           ===================================================== */

        var style =
            document.createElement('style');

        style.id =
            'galflix-v20-style';

        style.textContent = `

        /* =====================================================
           LAMPA ORIGINAL LOADER
           ===================================================== */

        .media-loading.media-loading--standalone {
            background: #000 !important;
        }


        .media-loading.media-loading--standalone
        .media-loading__backdrop,

        .media-loading.media-loading--standalone
        .media-loading__shade,

        .media-loading.media-loading--standalone
        .media-loading__mark,

        .media-loading.media-loading--standalone
        .media-loading__status {
            display: none !important;
        }


        /* =====================================================
           GALFLIX SCREEN CONTAINER
           ===================================================== */

        .galflix-screen-container {

            position: fixed !important;

            top: 0 !important;
            left: 0 !important;

            width: 100vw !important;
            height: 100vh !important;

            z-index: 9999999 !important;

            pointer-events: none !important;

            background: #000 !important;

            overflow: hidden !important;

            margin: 0 !important;
            padding: 0 !important;

            box-sizing: border-box !important;
        }


        /* =====================================================
           3D RIBBON G
           ===================================================== */

        .ribbon-g-stage {

            position: absolute !important;

            width: 140px !important;
            height: 190px !important;

            top: 50% !important;
            left: 50% !important;

            margin-top: -95px !important;
            margin-left: -70px !important;

            z-index: 15 !important;

            transform-origin:
                50% 50% !important;

            animation:
                cameraFlyThroughG
                2.4s
                cubic-bezier(.2,.8,.25,1)
                forwards !important;
        }


        .ribbon-g-top {

            position: absolute !important;

            top: 0 !important;
            left: 0 !important;

            width: 100% !important;
            height: 32px !important;

            background:
                linear-gradient(
                    90deg,
                    #8c050c,
                    #b1060f 70%,
                    #9b050c
                ) !important;

            border-radius:
                12px 6px 0 0 !important;

            z-index: 1 !important;
        }


        .ribbon-g-left {

            position: absolute !important;

            top: 0 !important;
            left: 0 !important;

            width: 34px !important;
            height: 100% !important;

            background:
                #b1060f !important;

            border-radius:
                12px 0 0 12px !important;

            z-index: 1 !important;
        }


        .ribbon-g-bottom {

            position: absolute !important;

            bottom: 0 !important;
            left: 0 !important;

            width: 100% !important;
            height: 32px !important;

            background:
                linear-gradient(
                    90deg,
                    #b1060f,
                    #8c050c
                ) !important;

            border-radius:
                0 0 12px 12px !important;

            z-index: 1 !important;
        }


        .ribbon-g-right {

            position: absolute !important;

            right: 0 !important;
            bottom: 0 !important;

            width: 34px !important;
            height: 95px !important;

            background:
                #9b050c !important;

            border-radius:
                0 0 6px 0 !important;

            z-index: 1 !important;
        }


        .ribbon-g-cross {

            position: absolute !important;

            right: 0 !important;
            bottom: 65px !important;

            width: 72px !important;
            height: 32px !important;

            background:
                #e50914 !important;

            border-radius:
                4px 0 0 4px !important;

            box-shadow:
                -7px 6px 18px rgba(0,0,0,.9),
                0 0 20px rgba(229,9,20,.4) !important;

            z-index: 3 !important;
        }


        .ribbon-g-arc {

            position: absolute !important;

            bottom: -20px !important;
            left: -15% !important;

            width: 130% !important;
            height: 36px !important;

            background:
                #000 !important;

            border-radius:
                50% !important;

            z-index: 5 !important;
        }


        /* =====================================================
           LIGHT FILAMENTS
           ===================================================== */

        .effect-lumieres {

            position: absolute !important;

            inset: 0 !important;

            pointer-events: none !important;

            z-index: 10 !important;
        }


        .lumiere-lamp {

            position: absolute !important;

            top: 0 !important;
            bottom: 0 !important;

            width: 2px;

            opacity: 0;

            transform-origin:
                50% 50% !important;

            animation:
                lumiereFly
                2s
                cubic-bezier(
                    .15,
                    .85,
                    .35,
                    1.2
                )
                forwards !important;
        }


        /* =====================================================
           GALFLIX UI
           
           THIS IS THE IMPORTANT CENTERING SYSTEM
           ===================================================== */

        .galflix-ui {

            position: absolute !important;

            inset: 0 !important;

            display: flex !important;

            flex-direction: column !important;

            align-items: center !important;

            justify-content: center !important;

            opacity: 0;

            z-index: 20 !important;

            pointer-events: none !important;

            animation:
                revealUI
                1.2s
                ease-out
                2.1s
                forwards !important;

            box-sizing: border-box !important;
        }


        /* =====================================================
           LOGO
           ===================================================== */

        .galflix-logo {

            margin:
                0 0 24px 0 !important;

            font-family:
                'Bebas Neue',
                'Impact',
                sans-serif !important;

            font-size:
                clamp(
                    54px,
                    7.5vw,
                    105px
                ) !important;

            letter-spacing:
                4px !important;

            line-height:
                1 !important;

            white-space:
                nowrap !important;

            text-align:
                center !important;

            color:
                #e50914 !important;

            filter:
                drop-shadow(
                    0 0 25px
                    rgba(229,9,20,.6)
                )
                drop-shadow(
                    0 6px 15px
                    rgba(0,0,0,.9)
                ) !important;

            box-sizing:
                border-box !important;
        }


        /* =====================================================
           PROGRESS BAR
           ===================================================== */

        .galflix-progress {

            width:
                380px !important;

            max-width:
                65vw !important;

            height:
                6px !important;

            margin:
                0 0 12px 0 !important;

            padding:
                0 !important;

            background:
                rgba(
                    255,
                    255,
                    255,
                    .15
                ) !important;

            border-radius:
                10px !important;

            overflow:
                hidden !important;

            box-shadow:
                0 0 25px
                rgba(0,0,0,.9) !important;

            box-sizing:
                border-box !important;
        }


        /* =====================================================
           PROGRESS FILL
           ===================================================== */

        .galflix-progress-fill {

            width: 0%;

            height: 100%;

            margin: 0;
            padding: 0;

            background:
                linear-gradient(
                    90deg,
                    #b1060f 0%,
                    #e50914 60%,
                    #ff4b4b 90%,
                    #ffffff 100%
                ) !important;

            background-size:
                200% 100% !important;

            border-radius:
                10px !important;

            box-shadow:
                0 0 15px #e50914,
                0 0 30px
                rgba(229,9,20,.9) !important;

            animation:
                galflixLaser
                1.8s
                linear
                infinite !important;

            transition:
                width .15s linear !important;
        }


        /* =====================================================
           PERCENT
           ===================================================== */

        .galflix-percent {

            font-family:
                Arial,
                Helvetica,
                sans-serif !important;

            font-size:
                16px !important;

            font-weight:
                600 !important;

            color:
                rgba(
                    255,
                    255,
                    255,
                    .8
                ) !important;

            text-align:
                center !important;

            white-space:
                nowrap !important;

            line-height:
                20px !important;

            margin:
                0 !important;

            padding:
                0 !important;
        }


        /* =====================================================
           STATUS PILL
           
           This is completely independent from Lampa's
           original status positioning.
           ===================================================== */

        .galflix-status-pill {

            position:
                absolute !important;

            bottom:
                5vh !important;

            left:
                50% !important;

            transform:
                translateX(-50%) !important;

            padding:
                6px 18px !important;

            display:
                none;

            justify-content:
                center !important;

            align-items:
                center !important;

            gap:
                8px !important;

            background:
                rgba(
                    255,
                    255,
                    255,
                    .08
                ) !important;

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    .06
                ) !important;

            border-radius:
                20px !important;

            box-shadow:
                0 4px 20px
                rgba(0,0,0,.6) !important;

            font-family:
                Arial,
                Helvetica,
                sans-serif !important;

            font-size:
                14px !important;

            line-height:
                20px !important;

            color:
                rgba(
                    255,
                    255,
                    255,
                    .75
                ) !important;

            white-space:
                nowrap !important;

            box-sizing:
                border-box !important;
        }


        /* =====================================================
           ANIMATIONS
           ===================================================== */

        @keyframes cameraFlyThroughG {

            0% {
                transform:
                    scale(.6);

                opacity: 0;
            }

            15% {
                transform:
                    scale(1);

                opacity: 1;
            }

            45% {
                transform:
                    scale(1.05);

                opacity: 1;
            }

            75% {
                transform:
                    scale(3.6);

                opacity: .9;
            }

            100% {
                transform:
                    scale(15);

                opacity: 0;
            }
        }


        @keyframes lumiereFly {

            0% {

                opacity: 0;

                transform:
                    scaleY(.2)
                    scaleX(1)
                    translateX(0);
            }

            15% {
                opacity: .95;
            }

            60% {
                opacity: .8;
            }

            100% {

                opacity: 0;

                transform:
                    scaleY(4.5)
                    scaleX(4)
                    translateX(
                        var(--side-drift)
                    );
            }
        }


        @keyframes revealUI {

            0% {

                opacity: 0;

                transform:
                    scale(.92);
            }

            100% {

                opacity: 1;

                transform:
                    scale(1);
            }
        }


        @keyframes galflixLaser {

            0% {
                background-position:
                    100% 0;
            }

            100% {
                background-position:
                    -100% 0;
            }
        }

        `;

        document.head.appendChild(style);


        /* =====================================================
           TUDUM
           ===================================================== */

        var tudum = null;

        try {

            tudum = new Audio();

            tudum.preload = 'auto';

            tudum.src = SOUND_URL;

            tudum.volume = 1.0;

            tudum.load();

            console.log(
                '[GALFLIX v20] Tudum prepared'
            );

        } catch (e) {

            console.log(
                '[GALFLIX v20] Audio init failed',
                e
            );
        }


        /* =====================================================
           PLAY TUDUM
           ===================================================== */

        function playTudum(loader) {

            if (!tudum) return;

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

                if (
                    promise &&
                    typeof promise.catch ===
                    'function'
                ) {

                    promise.catch(
                        function (e) {

                            console.log(
                                '[GALFLIX v20] Tudum rejected',
                                e
                            );
                        }
                    );
                }

                console.log(
                    '[GALFLIX v20] TUDUM PLAY'
                );

            } catch (e) {

                console.log(
                    '[GALFLIX v20] Tudum play error',
                    e
                );
            }
        }


        /* =====================================================
           RESET SOUND
           ===================================================== */

        function resetSoundIfHidden(loader) {

            if (
                loader.classList.contains(
                    'hide'
                ) ||
                loader.classList.contains(
                    'media-loading--leaving'
                )
            ) {

                loader.removeAttribute(
                    'data-galflix-sound'
                );

                return true;
            }

            return false;
        }


        /* =====================================================
           LUMIERES
           ===================================================== */

        var colors = [

            '#e50914',
            '#b81d24',
            '#e50914',
            '#ff3838',

            '#6610f2',
            '#7209b7',
            '#e83e8c',
            '#f72585',

            '#20c997',
            '#4cc9f0',
            '#fd7e14',
            '#ffd166'
        ];


        function spawnLumieres(container) {

            container.innerHTML = '';

            for (
                var i = 0;
                i < 42;
                i++
            ) {

                var lamp =
                    document.createElement('div');

                lamp.className =
                    'lumiere-lamp';


                var color =
                    colors[
                        i % colors.length
                    ];


                var left =
                    36 +
                    (
                        i *
                        (28 / 42)
                    );


                var delay =
                    .25 +
                    (
                        Math.random() *
                        .35
                    );


                var direction =
                    i < 21
                        ? -1
                        : 1;


                var drift =
                    direction *
                    (
                        200 +
                        Math.random() *
                        750
                    );


                var width =
                    2 +
                    Math.floor(
                        Math.random() * 3
                    );


                lamp.style.left =
                    left + '%';


                lamp.style.width =
                    width + 'px';


                lamp.style.background =
                    'linear-gradient(' +
                    '180deg,' +
                    'transparent 0%,' +
                    color + ' 30%,' +
                    '#ffffff 50%,' +
                    color + ' 70%,' +
                    'transparent 100%)';


                lamp.style.boxShadow =
                    '0 0 10px ' +
                    color +
                    ', 0 0 20px ' +
                    color;


                lamp.style.animationDelay =
                    delay + 's';


                lamp.style.setProperty(
                    '--side-drift',
                    drift + 'px'
                );


                container.appendChild(
                    lamp
                );
            }
        }


        /* =====================================================
           BUILD GALFLIX UI
           ===================================================== */

        var activeRoot = null;

        var activeLoader = null;

        var progressTimers =
            new WeakMap();


        function removeRoot() {

            if (activeRoot) {

                activeRoot.remove();

                activeRoot = null;
            }
        }


        function buildLoader(loader) {

            if (!loader) return;


            /*
             * Only operate on the current Lampa
             * standalone media loader.
             */

            if (
                !loader.matches(
                    '.media-loading.media-loading--standalone'
                )
            ) {
                return;
            }


            /*
             * Hidden loader:
             * remove our UI.
             */

            if (
                loader.classList.contains(
                    'hide'
                )
            ) {

                removeRoot();

                return;
            }


            /*
             * If this is already our active loader,
             * don't rebuild it.
             */

            if (
                activeLoader === loader &&
                activeRoot &&
                document.body.contains(
                    activeRoot
                )
            ) {
                return;
            }


            /*
             * New loader.
             */

            removeRoot();

            activeLoader =
                loader;


            /* -------------------------------------------------
               ROOT
               ------------------------------------------------- */

            var screenRoot =
                document.createElement(
                    'div'
                );

            screenRoot.id =
                'galflix-root';

            screenRoot.className =
                'galflix-screen-container';


            /* -------------------------------------------------
               RIBBON G
               ------------------------------------------------- */

            var ribbonStage =
                document.createElement(
                    'div'
                );

            ribbonStage.className =
                'ribbon-g-stage';


            ribbonStage.innerHTML =
                '<div class="ribbon-g-top"></div>' +
                '<div class="ribbon-g-left"></div>' +
                '<div class="ribbon-g-bottom"></div>' +
                '<div class="ribbon-g-right"></div>' +
                '<div class="ribbon-g-cross"></div>' +
                '<div class="ribbon-g-arc"></div>';


            /* -------------------------------------------------
               LUMIERES
               ------------------------------------------------- */

            var lumieres =
                document.createElement(
                    'div'
                );

            lumieres.className =
                'effect-lumieres';


            spawnLumieres(
                lumieres
            );


            /* -------------------------------------------------
               UI
               ------------------------------------------------- */

            var uiContainer =
                document.createElement(
                    'div'
                );

            uiContainer.className =
                'galflix-ui';


            /* -------------------------------------------------
               LOGO
               ------------------------------------------------- */

            var logo =
                document.createElement(
                    'div'
                );

            logo.className =
                'galflix-logo';

            logo.textContent =
                'GALFLIX';


            /* -------------------------------------------------
               PROGRESS
               ------------------------------------------------- */

            var bar =
                document.createElement(
                    'div'
                );

            bar.className =
                'galflix-progress';


            var fill =
                document.createElement(
                    'div'
                );

            fill.className =
                'galflix-progress-fill';


            bar.appendChild(
                fill
            );


            /* -------------------------------------------------
               PERCENT
               ------------------------------------------------- */

            var percent =
                document.createElement(
                    'div'
                );

            percent.className =
                'galflix-percent';

            percent.textContent =
                '0%';


            /* -------------------------------------------------
               STATUS PILL
               ------------------------------------------------- */

            var statusPill =
                document.createElement(
                    'div'
                );

            statusPill.className =
                'galflix-status-pill';


            var peersSpan =
                document.createElement(
                    'span'
                );


            var dotSpan =
                document.createElement(
                    'span'
                );

            dotSpan.textContent =
                '•';


            var speedSpan =
                document.createElement(
                    'span'
                );


            statusPill.appendChild(
                peersSpan
            );

            statusPill.appendChild(
                dotSpan
            );

            statusPill.appendChild(
                speedSpan
            );


            /* -------------------------------------------------
               BUILD DOM
               ------------------------------------------------- */

            uiContainer.appendChild(
                logo
            );

            uiContainer.appendChild(
                bar
            );

            uiContainer.appendChild(
                percent
            );

            uiContainer.appendChild(
                statusPill
            );


            screenRoot.appendChild(
                ribbonStage
            );

            screenRoot.appendChild(
                lumieres
            );

            screenRoot.appendChild(
                uiContainer
            );


            document.body.appendChild(
                screenRoot
            );


            activeRoot =
                screenRoot;


            /* =================================================
               LAMPA DATA SOURCES
               ================================================= */

            var originalFill =
                loader.querySelector(
                    '.media-loading__mark-fill'
                );


            var originalPercent =
                loader.querySelector(
                    '.media-loading__percent'
                );


            var origPeers =
                loader.querySelector(
                    '.media-loading__peers'
                );


            var origSpeed =
                loader.querySelector(
                    '.media-loading__speed'
                );


            /* =================================================
               LIVE DATA SYNC
               ================================================= */

            function syncProgress() {

                /*
                 * Loader was destroyed by Lampa.
                 */

                if (
                    !document.body.contains(
                        loader
                    )
                ) {

                    removeRoot();

                    var oldTimer =
                        progressTimers.get(
                            loader
                        );

                    if (oldTimer) {

                        clearInterval(
                            oldTimer
                        );

                        progressTimers.delete(
                            loader
                        );
                    }

                    if (
                        activeLoader ===
                        loader
                    ) {

                        activeLoader =
                            null;
                    }

                    return;
                }


                /*
                 * Loader is leaving/hidden.
                 */

                if (
                    loader.classList.contains(
                        'hide'
                    ) ||
                    loader.classList.contains(
                        'media-loading--leaving'
                    )
                ) {

                    removeRoot();

                    return;
                }


                /* ------------------------------------------------
                   PROGRESS
                   ------------------------------------------------ */

                var rawValue = '';


                if (
                    originalFill &&
                    originalFill.style.width
                ) {

                    rawValue =
                        originalFill.style.width;


                    fill.style.width =
                        rawValue;
                }


                else if (
                    originalPercent &&
                    originalPercent.textContent
                ) {

                    rawValue =
                        originalPercent
                            .textContent;
                }


                if (rawValue) {

                    var num =
                        parseFloat(
                            rawValue
                        );


                    if (
                        !isNaN(num)
                    ) {

                        num =
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    num
                                )
                            );


                        percent.textContent =
                            Math.round(num) +
                            '%';
                    }
                }


                /* ------------------------------------------------
                   PEERS + SPEED
                   
                   These are read from the CURRENT Lampa
                   loader. Lampa itself updates them.
                   ------------------------------------------------ */

                var pText =
                    origPeers
                        ? origPeers.textContent.trim()
                        : '';


                var sText =
                    origSpeed
                        ? origSpeed.textContent.trim()
                        : '';


                if (
                    pText ||
                    sText
                ) {

                    statusPill.style.display =
                        'flex';


                    peersSpan.textContent =
                        pText;


                    speedSpan.textContent =
                        sText;


                    dotSpan.style.display =
                        (
                            pText &&
                            sText
                        )
                            ? 'inline'
                            : 'none';
                }

                else {

                    statusPill.style.display =
                        'none';
                }
            }


            /* -------------------------------------------------
               PROGRESS TIMER
               
               This only mirrors Lampa's values.
               It does NOT control Lampa.
               ------------------------------------------------- */

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


        /* =====================================================
           SCAN LOADERS
           ===================================================== */

        function checkLoaders() {

            var loaders =
                document.querySelectorAll(
                    '.media-loading.media-loading--standalone'
                );


            if (
                loaders.length === 0
            ) {

                removeRoot();

                activeLoader =
                    null;

                return;
            }


            var foundActive =
                false;


            for (
                var i = 0;
                i < loaders.length;
                i++
            ) {

                var loader =
                    loaders[i];


                /*
                 * Current Lampa loader.
                 */

                if (
                    !loader.classList.contains(
                        'hide'
                    ) &&
                    !loader.classList.contains(
                        'media-loading--leaving'
                    )
                ) {

                    foundActive =
                        true;


                    buildLoader(
                        loader
                    );


                    /*
                     * Play exactly once
                     * for this loader.
                     */

                    playTudum(
                        loader
                    );

                    break;
                }
            }


            /*
             * No active loader.
             */

            if (!foundActive) {

                removeRoot();

                activeLoader =
                    null;
            }


            /*
             * Reset sound flags for hidden
             * loaders so the next preload
             * can trigger Tudum.
             */

            for (
                var j = 0;
                j < loaders.length;
                j++
            ) {

                resetSoundIfHidden(
                    loaders[j]
                );
            }
        }


        /* =====================================================
           MUTATION OBSERVER
           ===================================================== */

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

                    attributeFilter:
                        ['class']
                }
            );
        }


        /* =====================================================
           INITIAL
           ===================================================== */

        checkLoaders();


        /* =====================================================
           BACKUP SCAN
           ===================================================== */

        setInterval(
            checkLoaders,
            500
        );


        console.log(
            '[GALFLIX v20] loaded'
        );
    }


    /* =========================================================
       START
       ========================================================= */

    init();

})();
