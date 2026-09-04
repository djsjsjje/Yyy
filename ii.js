(function () {
    'use strict';

    var PLUGIN_ID = 'galflix_preload_v8';

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
           GALFLIX PRELOAD SCREEN CSS
           ========================================================= */

        var style = document.createElement('style');

        style.textContent = `
        /* FULLSCREEN BLACKOUT CONTAINER */
        .media-loading.media-loading--standalone {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #000 !important;
            z-index: 99999 !important;
            overflow: hidden !important;
        }

        /* HIDE MOVIE POSTER & SHADE */
        .media-loading.media-loading--standalone .media-loading__backdrop,
        .media-loading.media-loading--standalone .media-loading__shade {
            display: none !important;
        }

        /* CONTENT WRAPPER */
        .media-loading.media-loading--standalone .media-loading__content {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
            display: block !important;
            overflow: hidden !important;
        }

        /* HIDE ORIGINAL LOADER MARK */
        .media-loading.media-loading--standalone .media-loading__mark {
            display: none !important;
        }

        /* GALFLIX LOGO (CENTERED) */
        .galflix-logo {
            position: absolute !important;
            left: 50% !important;
            top: 34% !important;
            transform: translateX(-50%) !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #e50914 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-weight: 900 !important;
            font-size: clamp(48px, 7vw, 95px) !important;
            letter-spacing: -4px !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            text-align: center !important;
            user-select: none !important;
            text-shadow: 0 0 30px rgba(229, 9, 20, .25);
        }

        /* SLEEK, COMPACT PROGRESS BAR (DEAD CENTER) */
        .galflix-progress {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translateX(-50%) !important;
            width: 380px !important;
            max-width: 65vw !important;
            height: 6px !important;
            margin: 0 !important;
            padding: 0 !important;
            background: rgba(255, 255, 255, .20) !important;
            border-radius: 10px !important;
            overflow: hidden !important;
            box-shadow: 0 0 15px rgba(0, 0, 0, .6) !important;
        }

        .galflix-progress-fill {
            width: 0%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: #e50914 !important;
            border-radius: 10px !important;
            transition: width .15s linear !important;
        }

        /* PERCENTAGE (DEAD CENTER UNDER BAR) */
        .galflix-percent {
            position: absolute !important;
            left: 50% !important;
            top: 52.5% !important;
            transform: translateX(-50%) !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 17px !important;
            font-weight: 600 !important;
            color: rgba(255, 255, 255, .75) !important;
            text-align: center !important;
            white-space: nowrap !important;
        }

        /* COMPACT STATUS PILL (DEAD CENTER AT BOTTOM) */
        .media-loading.media-loading--standalone .media-loading__status {
            position: absolute !important;
            left: 50% !important;
            right: auto !important;
            bottom: 5vh !important;
            top: auto !important;
            transform: translateX(-50%) !important;
            width: auto !important;
            min-width: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 6px 18px !important;
            display: inline-flex !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 10px !important;
            background: rgba(255, 255, 255, 0.08) !important;
            border-radius: 20px !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 15px !important;
            line-height: 20px !important;
            color: rgba(255, 255, 255, .75) !important;
            white-space: nowrap !important;
            z-index: 10 !important;
        }

        .media-loading.media-loading--standalone .media-loading__peers {
            position: static !important;
            display: inline-flex !important;
            align-items: center !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
        }

        .media-loading.media-loading--standalone .media-loading__peers-icon {
            position: static !important;
            margin: 0 6px 0 0 !important;
            transform: none !important;
        }

        .media-loading.media-loading--standalone .media-loading__speed {
            position: static !important;
            display: inline-block !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
        }

        .media-loading.media-loading--standalone .media-loading__peers-separator {
            position: static !important;
            display: inline-block !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
        }

        /* HIDE TRAILING DOT BEFORE OLD PERCENT */
        .media-loading.media-loading--standalone .media-loading__speed-separator {
            display: none !important;
        }

        /* HIDE ORIGINAL LAMPA PERCENT */
        .media-loading.media-loading--standalone .media-loading__percent {
            display: none !important;
        }
        `;

        document.head.appendChild(style);

        /* =========================================================
           TUDUM SOUND ENGINE
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
            console.log('[GALFLIX] Audio initialization error:', e);
        }

        function playTudum(loader) {
            if (!tudum) return;

            if (loader.getAttribute('data-galflix-sound') === 'played') {
                return;
            }

            loader.setAttribute('data-galflix-sound', 'played');

            try {
                tudum.currentTime = 0;
                var promise = tudum.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function (error) {
                        console.log('[GALFLIX] Tudum playback rejected:', error);
                    });
                }
                console.log('[GALFLIX] TUDUM PLAY');
            } catch (e) {
                console.log('[GALFLIX] Tudum playback error:', e);
            }
        }

        function resetSoundIfHidden(loader) {
            if (loader.classList.contains('hide')) {
                if (loader.getAttribute('data-galflix-sound') === 'played') {
                    loader.removeAttribute('data-galflix-sound');
                }
                return true;
            }
            return false;
        }

        /* =========================================================
           PROGRESS TRACKING & UI INJECTION
           ========================================================= */

        var progressTimers = new WeakMap();

        function buildLoader(loader) {
            if (!loader) return;

            var content = loader.querySelector('.media-loading__content');
            if (!content) return;

            if (loader.getAttribute('data-galflix-ui') === '1') return;
            loader.setAttribute('data-galflix-ui', '1');

            var logo = document.createElement('div');
            logo.className = 'galflix-logo';
            logo.textContent = 'GALFLIX';

            var bar = document.createElement('div');
            bar.className = 'galflix-progress';

            var fill = document.createElement('div');
            fill.className = 'galflix-progress-fill';
            bar.appendChild(fill);

            var percent = document.createElement('div');
            percent.className = 'galflix-percent';
            percent.textContent = '0%';

            var status = content.querySelector('.media-loading__status');

            content.insertBefore(logo, content.firstChild);

            if (status) {
                content.insertBefore(bar, status);
                content.insertBefore(percent, status);
            } else {
                content.appendChild(bar);
                content.appendChild(percent);
            }

            var originalFill = loader.querySelector('.media-loading__mark-fill');
            var originalPercent = loader.querySelector('.media-loading__percent');

            function syncProgress() {
                if (!document.body.contains(loader)) {
                    var oldTimer = progressTimers.get(loader);
                    if (oldTimer) {
                        clearInterval(oldTimer);
                        progressTimers.delete(loader);
                    }
                    return;
                }

                if (originalFill) {
                    var width = originalFill.style.width;
                    if (width) {
                        fill.style.width = width;
                        percent.textContent = width;
                    }
                }

                if (originalPercent && originalPercent.textContent) {
                    var text = originalPercent.textContent.trim();
                    if (text && text.indexOf('%') !== -1) {
                        percent.textContent = text;
                    }
                }
            }

            var timer = setInterval(syncProgress, 100);
            progressTimers.set(loader, timer);
            syncProgress();
        }

        function checkLoaders() {
            var loaders = document.querySelectorAll('.media-loading.media-loading--standalone');

            for (var i = 0; i < loaders.length; i++) {
                var loader = loaders[i];

                buildLoader(loader);

                if (resetSoundIfHidden(loader)) {
                    continue;
                }

                if (!loader.classList.contains('hide')) {
                    playTudum(loader);
                }
            }
        }

        if (typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(function () {
                checkLoaders();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        }

        checkLoaders();
        setInterval(checkLoaders, 500);

        console.log('[GALFLIX] v8 loaded');
    }

    init();
})();
