(function () {
    'use strict';

    // Direct link to the authentic Netflix "Ta-dum" MP3
    const NETFLIX_SOUND = 'https://raw.githubusercontent.com/Mudas1003/Netflix-Clone/main/Netflix-Intro-Sound-Effect.mp3';

    let lastPlayed = 0;

    function playTudum() {
        const now = Date.now();
        // Prevent playing twice within 5 seconds
        if (now - lastPlayed < 5000) return;
        lastPlayed = now;

        const audio = new Audio(NETFLIX_SOUND);
        audio.volume = 0.8;
        audio.play().catch(function (err) {
            console.warn('Audio waiting for user gesture:', err);
        });
    }

    function initGalflix() {
        if (document.getElementById('galflix-style')) return;

        const style = document.createElement('style');
        style.id = 'galflix-style';
        style.type = 'text/css';
        style.innerHTML = `
            /* Full-screen pitch-black */
            .torrent-preload,
            .modal--preload {
                background: #141414 !important;
                background-color: #141414 !important;
                border: none !important;
                box-shadow: none !important;
            }

            .torrent-preload__background,
            .modal--preload .modal__background {
                display: none !important;
            }

            /* Hide all technical download stats */
            .torrent-preload__title,
            .torrent-preload__stat,
            .torrent-preload__details,
            .torrent-preload__speed,
            .torrent-preload__text {
                display: none !important;
            }

            /* Center layout */
            .torrent-preload__body {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 40px 20px !important;
            }

            /* GALFLIX Logo */
            .torrent-preload__body::before {
                content: "GALFLIX";
                display: block;
                font-family: 'Impact', 'Arial Black', sans-serif;
                font-size: 5rem;
                font-weight: 900;
                letter-spacing: 6px;
                color: #E50914;
                text-transform: uppercase;
                margin-bottom: 28px;
                text-shadow: 0 0 25px rgba(229, 9, 20, 0.4), 0 2px 4px rgba(0, 0, 0, 0.8);
                animation: galflixPulse 2s ease-in-out infinite alternate;
            }

            /* Sleek Netflix-red progress buffer bar */
            .torrent-preload__progress {
                width: 240px !important;
                max-width: 80% !important;
                height: 4px !important;
                background: rgba(255, 255, 255, 0.15) !important;
                border-radius: 2px !important;
                overflow: hidden !important;
                margin: 0 auto !important;
            }

            .torrent-preload__progress-bar {
                background: #E50914 !important;
                box-shadow: 0 0 10px #E50914 !important;
                border-radius: 2px !important;
            }

            @keyframes galflixPulse {
                0% { transform: scale(0.98); opacity: 0.9; }
                100% { transform: scale(1.02); opacity: 1; filter: drop-shadow(0 0 25px rgba(229, 9, 20, 0.7)); }
            }
        `;
        document.head.appendChild(style);

        // Detect when the TorrServer preload dialog opens on TV
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) {
                        if (node.classList.contains('torrent-preload') || node.querySelector('.torrent-preload')) {
                            playTudum();
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (window.appready) {
        initGalflix();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initGalflix();
        });
    }
})();
