(function () {
    'use strict';

    var PLUGIN_ID = 'galflix_preload_v4';
    var SOUND_URL = 'https://raw.githubusercontent.com/Mudas1003/Netflix-Clone/main/Netflix-Intro-Sound-Effect.mp3';

    function startPlugin() {
        if (window[PLUGIN_ID]) return;
        window[PLUGIN_ID] = true;

        var $ = window.jQuery;
        var soundName = 'galflix_tudum';
        var soundReady = false;
        var progressTimer = null;
        var observer = null;

        function addCSS() {
            if (document.getElementById('galflix-css')) return;

            var css = document.createElement('style');
            css.id = 'galflix-css';

            css.textContent = `
                .media-loading.media-loading--standalone {
                    background: #050505 !important;
                    z-index: 99999 !important;
                }

                .media-loading.media-loading--standalone .media-loading__backdrop,
                .media-loading.media-loading--standalone .media-loading__shade {
                    display: none !important;
                }

                .media-loading.media-loading--standalone .media-loading__content {
                    position: absolute !important;
                    left: 50% !important;
                    top: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    width: min(70vw, 900px) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                }

                .media-loading.media-loading--standalone .media-loading__mark {
                    display: none !important;
                }

                .galflix-logo {
                    color: #e50914;
                    font-family: Arial, Helvetica, sans-serif;
                    font-weight: 900;
                    font-size: clamp(42px, 8vw, 100px);
                    letter-spacing: -4px;
                    line-height: 1;
                    text-shadow: 0 0 30px rgba(229, 9, 20, .22);
                    margin-bottom: 42px;
                    user-select: none;
                }

                .galflix-progress {
                    width: 100%;
                    max-width: 760px;
                    height: 8px;
                    background: rgba(255,255,255,.20);
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 0 20px rgba(0,0,0,.45);
                }

                .galflix-progress-fill {
                    width: 0%;
                    height: 100%;
                    background: #e50914;
                    border-radius: inherit;
                    transition: width .15s linear;
                }

                .media-loading.media-loading--standalone
                .media-loading__status {
                    margin-top: 18px !important;
                    justify-content: center !important;
                }

                .media-loading.media-loading--standalone
                .media-loading__peers,

                .media-loading.media-loading--standalone
                .media-loading__speed,

                .media-loading.media-loading--standalone
                .media-loading__separator {
                    display: none !important;
                }

                .media-loading.media-loading--standalone
                .media-loading__percent {
                    font-size: 18px !important;
                    color: rgba(255,255,255,.75) !important;
                }
            `;

            document.head.appendChild(css);
        }

        function setupSound() {
            if (!window.Lampa ||
                !Lampa.Sound ||
                !Lampa.Sound.add) {

                console.log(
                    '[GALFLIX] Lampa.Sound API not available'
                );

                return;
            }

            try {
                var sound = Lampa.Sound.add(
                    soundName,
                    {
                        url: SOUND_URL,
                        volume: 1
                    }
                );

                soundReady = !!sound;

                console.log(
                    '[GALFLIX] Sound registered:',
                    soundReady
                );

            } catch (e) {
                console.log(
                    '[GALFLIX] Sound registration error:',
                    e
                );
            }
        }

        function playTudum() {
            if (!soundReady ||
                !Lampa.Sound ||
                !Lampa.Sound.play) {
                return;
            }

            try {
                Lampa.Sound.play(soundName);

                console.log(
                    '[GALFLIX] Tudum'
                );

            } catch (e) {
                console.log(
                    '[GALFLIX] Sound play error:',
                    e
                );
            }
        }

        function buildLoader(loader) {
            if (!loader ||
                loader.getAttribute('data-galflix') === '1') {
                return;
            }

            loader.setAttribute(
                'data-galflix',
                '1'
            );

            var content =
                loader.querySelector(
                    '.media-loading__content'
                );

            if (!content) return;

            /*
             * GALFLIX logo
             */

            var logo =
                document.createElement('div');

            logo.className =
                'galflix-logo';

            logo.textContent =
                'GALFLIX';

            /*
             * GALFLIX progress bar
             */

            var bar =
                document.createElement('div');

            bar.className =
                'galflix-progress';

            var fill =
                document.createElement('div');

            fill.className =
                'galflix-progress-fill';

            bar.appendChild(fill);

            content.insertBefore(
                logo,
                content.firstChild
            );

            content.insertBefore(
                bar,
                content.querySelector(
                    '.media-loading__status'
                )
            );

            /*
             * Lampa's REAL progress element.
             *
             * Lampa changes its inline width:
             *
             *     width: 35%
             *     width: 48%
             *     width: 72%
             *
             * We copy that value to GALFLIX.
             */

            var sourceFill =
                loader.querySelector(
                    '.media-loading__mark-fill'
                );

            var percent =
                loader.querySelector(
                    '.media-loading__percent'
                );

            function syncProgress() {

                if (!document.body.contains(loader)) {

                    clearInterval(
                        progressTimer
                    );

                    progressTimer = null;

                    return;
                }

                if (sourceFill) {

                    var width =
                        sourceFill.style.width;

                    if (width) {
                        fill.style.width =
                            width;
                    }
                }

                if (percent) {

                    var p =
                        percent.textContent ||
                        '0%';

                    if (p.indexOf('%') === -1) {
                        p += '%';
                    }

                    percent.textContent = p;
                }
            }

            clearInterval(
                progressTimer
            );

            progressTimer =
                setInterval(
                    syncProgress,
                    50
                );

            syncProgress();
        }

        function watchLoader() {

            observer =
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
             * Also handle an already existing loader.
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

        function hookTorrentEnter() {

            if (!$) {

                console.log(
                    '[GALFLIX] jQuery not available'
                );

                return;
            }

            /*
             * Try to catch torrent item entry.
             */

            $(document).off(
                'hover.galflix',
                '.torrent-files .torrent-file, .torrent-files .torrent-serial'
            );

            $(document).on(
                'hover.galflix',
                '.torrent-files .torrent-file, .torrent-files .torrent-serial',
                function () {

                    playTudum();

                }
            );

            console.log(
                '[GALFLIX] Torrent enter hook installed'
            );
        }

        addCSS();

        setupSound();

        watchLoader();

        hookTorrentEnter();

        console.log(
            '[GALFLIX] v4 loaded'
        );
    }

    /*
     * Wait until Lampa is available.
     */

    if (
        window.Lampa &&
        window.Lampa.Listener
    ) {

        startPlugin();

    } else {

        var wait =
            setInterval(
                function () {

                    if (
                        window.Lampa &&
                        window.Lampa.Listener
                    ) {

                        clearInterval(wait);

                        startPlugin();
                    }

                },
                100
            );
    }

})();
