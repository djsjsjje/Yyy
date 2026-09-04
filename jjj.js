(function () {
    'use strict';

    var PLUGIN_ID = 'galflix_preload_v11';

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
           GALFLIX CSS
           ========================================================= */

        var style = document.createElement('style');

        style.textContent = `
        /* 1. BLACKOUT BACKGROUND */
        .media-loading.media-loading--standalone {
            background: #000 !important;
        }

        .media-loading.media-loading--standalone .media-loading__backdrop,
        .media-loading.media-loading--standalone .media-loading__shade,
        .media-loading.media-loading--standalone .media-loading__mark,
        .media-loading.media-loading--standalone .media-loading__status {
            display: none !important;
        }

        /* 2. THE SCREEN ROOT (DEAD CENTER OVER THE ENTIRE TV) */
        .galflix-screen-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9999999 !important;
            pointer-events: none !important;

            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        /* 3. GALFLIX LOGO */
        .galflix-logo {
            margin: 0 0 25px 0 !important;
            padding: 0 !important;
            color: #e50914 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-weight: 900 !important;
            font-size: clamp(52px, 7vw, 100px) !important;
            letter-spacing: -4px !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            text-align: center !important;
            user-select: none !important;
            text-shadow: 0 0 30px rgba(229, 9, 20, .25);
        }

        /* 4. COMPACT PROGRESS BAR */
        .galflix-progress {
            width: 380px !important;
            max-width: 65vw !important;
            height: 6px !important;
            margin: 0 0 12px 0 !important;
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

        /* 5. ROUNDED INTEGER PERCENTAGE */
        .galflix-percent {
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 17px !important;
            font-weight: 600 !important;
            color: rgba(255, 255, 255, .75) !important;
            text-align: center !important;
            white-space: nowrap !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        /* 6. STATUS PILL (CENTERED AT SCREEN BOTTOM) */
        .galflix-status-pill {
            position: absolute !important;
            bottom: 5vh !important;
            left: 50% !important;
            transform: translateX(-50%) !important;

            width: auto !important;
            min-width: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 6px 18px !important;

            display: none;
            justify-content: center !important;
            align-items: center !important;
            gap: 8px !important;

            background: rgba(255, 255, 255, 0.08) !important;
            border-radius: 20px !important;

            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 15px !important;
            line-height: 20px !important;
            color: rgba(255, 255, 255, .75) !important;
            white-space: nowrap !important;
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
        } catch (e) {}

        function playTudum(loader) {
            if (!tudum) return;

            if (loader.getAttribute('data-galflix-sound') === 'played') return;
            loader.setAttribute('data-galflix-sound', 'played');

            try {
                tudum.currentTime = 0;
                var promise = tudum.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            } catch (e) {}
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
           BUILD UI DIRECTLY ON BODY
           ========================================================= */

        var progressTimers = new WeakMap();

        function buildLoader(loader) {
            if (!loader) return;

            if (loader.classList.contains('hide')) {
                var oldContainer = document.getElementById('galflix-root');
                if (oldContainer) oldContainer.remove();
                return;
            }

            if (loader.getAttribute('data-galflix-ui') === '1') return;
            loader.setAttribute('data-galflix-ui', '1');

            var existingRoot = document.getElementById('galflix-root');
            if (existingRoot) existingRoot.remove();

            // 1. Fullscreen Container
            var screenRoot = document.createElement('div');
            screenRoot.id = 'galflix-root';
            screenRoot.className = 'galflix-screen-container';

            // Logo
            var logo = document.createElement('div');
            logo.className = 'galflix-logo';
            logo.textContent = 'GALFLIX';

            // Progress Bar
            var bar = document.createElement('div');
            bar.className = 'galflix-progress';

            var fill = document.createElement('div');
            fill.className = 'galflix-progress-fill';
            bar.appendChild(fill);

            // Percent Text
            var percent = document.createElement('div');
            percent.className = 'galflix-percent';
            percent.textContent = '0%';

            // Status Pill (Peers + Speed)
            var statusPill = document.createElement('div');
            statusPill.className = 'galflix-status-pill';

            var peersSpan = document.createElement('span');
            var dotSpan = document.createElement('span');
            dotSpan.textContent = '•';
            var speedSpan = document.createElement('span');

            statusPill.appendChild(peersSpan);
            statusPill.appendChild(dotSpan);
            statusPill.appendChild(speedSpan);

            screenRoot.appendChild(logo);
            screenRoot.appendChild(bar);
            screenRoot.appendChild(percent);
            screenRoot.appendChild(statusPill);

            document.body.appendChild(screenRoot);

            // 2. Synchronize Live Data from Lampa
            var originalFill = loader.querySelector('.media-loading__mark-fill');
            var originalPercent = loader.querySelector('.media-loading__percent');
            var origPeers = loader.querySelector('.media-loading__peers');
            var origSpeed = loader.querySelector('.media-loading__speed');

            function syncProgress() {
                if (!document.body.contains(loader) || loader.classList.contains('hide')) {
                    if (screenRoot) screenRoot.remove();
                    var oldTimer = progressTimers.get(loader);
                    if (oldTimer) {
                        clearInterval(oldTimer);
                        progressTimers.delete(loader);
                    }
                    return;
                }

                // Format Percentage as Clean Integer (e.g., 37%)
                var rawVal = '';
                if (originalFill && originalFill.style.width) {
                    fill.style.width = originalFill.style.width;
                    rawVal = originalFill.style.width;
                } else if (originalPercent && originalPercent.textContent) {
                    rawVal = originalPercent.textContent;
                }

                if (rawVal) {
                    var num = parseFloat(rawVal);
                    percent.textContent = (!isNaN(num) ? Math.round(num) : 0) + '%';
                }

                // Copy Live Peers & Download Speed into our Pill
                if (origPeers && origSpeed) {
                    var pText = origPeers.textContent.trim();
                    var sText = origSpeed.textContent.trim();

                    if (pText || sText) {
                        statusPill.style.display = 'inline-flex';
                        peersSpan.textContent = pText;
                        speedSpan.textContent = sText;
                        dotSpan.style.display = (pText && sText) ? 'inline' : 'none';
                    }
                }
            }

            var timer = setInterval(syncProgress, 100);
            progressTimers.set(loader, timer);
            syncProgress();
        }

        /* =========================================================
           OBSERVER & CLEANUP
           ========================================================= */

        function checkLoaders() {
            var loaders = document.querySelectorAll('.media-loading.media-loading--standalone');

            if (loaders.length === 0) {
                var strayRoot = document.getElementById('galflix-root');
                if (strayRoot) strayRoot.remove();
                return;
            }

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

        console.log('[GALFLIX] v11 live-mirror loaded');
    }

    init();
})();
