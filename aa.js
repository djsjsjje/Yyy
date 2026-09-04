(function () {
    'use strict';

    const NETFLIX_SOUND = 'https://raw.githubusercontent.com/Mudas1003/Netflix-Clone/main/Netflix-Intro-Sound-Effect.mp3';
    let lastAudioTime = 0;
    
    // Create audio globally so it can be unlocked early
    const audio = new Audio(NETFLIX_SOUND);
    audio.volume = 0.9;
    let audioUnlocked = false;

    // 1. Bypass Autoplay Blocks: Unlock audio on the first TV remote/mouse interaction
    function unlockAudio() {
        if (audioUnlocked) return;
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audioUnlocked = true;
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        }).catch(() => {});
    }
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    function playTudum() {
        const now = Date.now();
        if (now - lastAudioTime < 5000) return;
        lastAudioTime = now;

        audio.currentTime = 0;
        audio.play().catch(function (e) {
            console.warn('Audio blocked by browser autoplay policy:', e);
        });
    }

    function initGalflix() {
        if (document.getElementById('galflix-full-style')) return;

        const style = document.createElement('style');
        style.id = 'galflix-full-style';
        style.type = 'text/css';
        style.innerHTML = `
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
                background-color: #141414 !important;
                z-index: 999999 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
            }

            /* Hide posters, fanarts, backdrop images */
            .torrent-preload__background,
            .modal--preload .modal__background,
            .torrent-preload img,
            div[class*="preload__background"] {
                display: none !important;
            }

            /* Hide all technical text */
            .torrent-preload__title,
            .torrent-preload__stat,
            .torrent-preload__details,
            .torrent-preload__speed,
            .torrent-preload__text,
            div[class*="preload__stat"] {
                display: none !important;
            }

            /* Center Body */
            .torrent-preload__body,
            div[class*="preload__body"] {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
            }

            /* The GALFLIX Netflix-style Logo */
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

            /* Netflix Red Loading Bar */
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
        document.head.appendChild(style);

        // 2. Fix DOM Observation: Query children of added nodes to catch nested modals
        const observer = new MutationObserver(function (mutations) {
            for (let i = 0; i < mutations.length; i++) {
                const added = mutations[i].addedNodes;
                for (let j = 0; j < added.length; j++) {
                    const node = added[j];
                    if (node.nodeType === 1) {
                        const className = (node.className || '').toString();
                        if (className.includes('preload') || node.querySelector('[class*="preload"]')) {
                            playTudum();
                            return;
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
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

    // 3. Prevent ReferenceErrors: Ensure Lampa exists before attaching listeners
    if (typeof Lampa !== 'undefined') {
        startPlugin();
    } else {
        let lampaWait = setInterval(() => {
            if (typeof Lampa !== 'undefined') {
                clearInterval(lampaWait);
                startPlugin();
            }
        }, 100);
    }
})();
