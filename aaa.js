(function () {
    'use strict';

    // Embedded 16-bit PCM WAV "Tudum" audio sound effect (Base64 Data URI)
    const NETFLIX_SOUND = 'data:audio/wav;base64,UklGRmAGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTAGAABAAAAAgICAQIBAQECAgIBAQEAAAAAAAICAQECAgICAQECAQECAMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAw';

    let lastAudioTime = 0;
    let audio = null;

    function initAudio() {
        if (!audio) {
            audio = new Audio(NETFLIX_SOUND);
            audio.volume = 0.9;
            audio.preload = 'auto';
        }
    }

    function playTudum() {
        const now = Date.now();
        if (now - lastAudioTime < 4000) return;
        lastAudioTime = now;

        initAudio();
        audio.currentTime = 0;
        const promise = audio.play();
        if (promise !== undefined) {
            promise.catch(function (e) {
                console.log('Galflix Audio play error:', e);
            });
        }
    }

    function injectStyle() {
        const $ = Lampa.$;
        if ($('#galflix-full-style').length) return;

        const style = `
            /* Full-screen pitch-black cover */
            .torrent-preload,
            .modal--preload,
            div[class*="torrent-preload"] {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: #141414 !important;
                z-index: 999999 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
            }

            /* Hide technical metadata, speed, posters */
            .torrent-preload__background,
            .modal--preload .modal__background,
            .torrent-preload img,
            div[class*="preload__background"],
            .torrent-preload__title,
            .torrent-preload__stat,
            .torrent-preload__details,
            .torrent-preload__speed,
            .torrent-preload__text,
            div[class*="preload__stat"] {
                display: none !important;
            }

            /* Center layout container */
            .torrent-preload__body,
            div[class*="preload__body"] {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
            }

            /* Red Pulsing GALFLIX Title */
            .torrent-preload__body::before,
            div[class*="preload__body"]::before {
                content: "GALFLIX";
                display: block;
                font-family: 'Impact', 'Arial Black', sans-serif;
                font-size: 5.5rem;
                font-weight: 900;
                letter-spacing: 6px;
                color: #E50914;
                text-transform: uppercase;
                margin-bottom: 25px;
                text-shadow: 0 0 25px rgba(229, 9, 20, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8);
                animation: galflixPulse 2s ease-in-out infinite alternate;
            }

            /* Red Netflix-style Loading Bar */
            .torrent-preload__progress,
            div[class*="preload__progress"] {
                width: 260px !important;
                max-width: 80% !important;
                height: 4px !important;
                background: rgba(255, 255, 255, 0.15) !important;
                border-radius: 2px !important;
                overflow: hidden !important;
                margin: 0 auto !important;
            }

            .torrent-preload__progress-bar,
            div[class*="preload__progress-bar"] {
                background: #E50914 !important;
                box-shadow: 0 0 10px #E50914 !important;
                border-radius: 2px !important;
            }

            @keyframes galflixPulse {
                0% { transform: scale(0.98); opacity: 0.9; }
                100% { transform: scale(1.02); opacity: 1; filter: drop-shadow(0 0 25px rgba(229, 9, 20, 0.7)); }
            }
        `;

        $('head').append('<style id="galflix-full-style">' + style + '</style>');
    }

    function initGalflix() {
        injectStyle();

        // Unlock TV browser audio context on first user action
        const unlock = function () {
            initAudio();
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
            }).catch(() => {});
            window.removeEventListener('keydown', unlock);
            window.removeEventListener('click', unlock);
        };
        window.addEventListener('keydown', unlock, { once: true });
        window.addEventListener('click', unlock, { once: true });

        // Listen for Lampa buffering events across channels
        Lampa.Listener.follow('preload', function (e) {
            if (e.type === 'start' || e.type === 'show') playTudum();
        });

        Lampa.Listener.follow('torrent', function (e) {
            if (e.type === 'preload' || e.type === 'start' || e.type === 'connect') playTudum();
        });

        Lampa.Listener.follow('modal', function (e) {
            if (e.type === 'open' && (e.name === 'preload' || e.name === 'torrent_preload')) playTudum();
        });
    }

    function startPlugin() {
        if (window.appready) {
            initGalflix();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') initGalflix();
            });
        }
    }

    if (typeof Lampa !== 'undefined') {
        startPlugin();
    } else {
        let timer = setInterval(function () {
            if (typeof Lampa !== 'undefined') {
                clearInterval(timer);
                startPlugin();
            }
        }, 100);
    }
})();
