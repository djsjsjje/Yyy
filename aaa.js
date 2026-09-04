(function () {
    'use strict';

    const NETFLIX_SOUND = 'https://raw.githubusercontent.com/Mudas1003/Netflix-Clone/main/Netflix-Intro-Sound-Effect.mp3';
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
        if (now - lastAudioTime < 3000) return;
        lastAudioTime = now;

        initAudio();
        audio.currentTime = 0;
        const promise = audio.play();
        if (promise !== undefined) {
            promise.catch(function (e) {
                console.log('Galflix sound play error:', e);
            });
        }
    }

    function applyGalflixOverride() {
        const $ = Lampa.$;

        // 1. Force CSS injection with high specificity
        if (!$('#galflix-full-style').length) {
            const style = `
                /* Cover entire screen pitch black */
                .torrent-preload,
                .modal--preload,
                div[class*="torrent-preload"],
                div[class*="modal--preload"] {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    background: #141414 !important;
                    background-color: #141414 !important;
                    z-index: 9999999 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border: none !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                }

                /* Hide standard background images, fanart, movie title, speed & peer counters */
                .torrent-preload__background,
                .torrent-preload__title,
                .torrent-preload__stat,
                .torrent-preload__details,
                .torrent-preload__speed,
                .torrent-preload__text,
                .torrent-preload__poster,
                .torrent-preload img,
                .modal--preload .modal__background,
                div[class*="preload__background"],
                div[class*="preload__title"],
                div[class*="preload__stat"],
                div[class*="preload__speed"],
                div[class*="preload__details"] {
                    display: none !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                }

                /* Center container */
                .torrent-preload__body,
                div[class*="preload__body"] {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 100% !important;
                }

                /* GALFLIX Netflix-style Logo */
                .torrent-preload__body::before,
                div[class*="preload__body"]::before {
                    content: "GALFLIX" !important;
                    display: block !important;
                    font-family: 'Impact', 'Arial Black', sans-serif !important;
                    font-size: 5.5rem !important;
                    font-weight: 900 !important;
                    letter-spacing: 6px !important;
                    color: #E50914 !important;
                    text-transform: uppercase !important;
                    margin-bottom: 25px !important;
                    text-shadow: 0 0 25px rgba(229, 9, 20, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8) !important;
                    animation: galflixPulse 2s ease-in-out infinite alternate !important;
                }

                /* Sleek Red Progress Bar */
                .torrent-preload__progress,
                div[class*="preload__progress"] {
                    width: 280px !important;
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

        // 2. Override Lampa's native preload template
        if (Lampa.Template) {
            Lampa.Template.add('torrent_preload', `
                <div class="torrent-preload">
                    <div class="torrent-preload__body">
                        <div class="torrent-preload__progress">
                            <div class="torrent-preload__progress-bar"></div>
                        </div>
                    </div>
                </div>
            `);
        }

        // 3. Audio Unlock handler for Smart TV interaction
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

        // 4. Hook directly into Lampa event channels
        Lampa.Listener.follow('preload', function (e) {
            if (e.type === 'start' || e.type === 'show') {
                playTudum();
            }
        });

        Lampa.Listener.follow('torrent', function (e) {
            if (e.type === 'preload' || e.type === 'start' || e.type === 'connect') {
                playTudum();
            }
        });

        Lampa.Listener.follow('modal', function (e) {
            if (e.type === 'open' && (e.name === 'preload' || e.name === 'torrent_preload')) {
                playTudum();
            }
        });
    }

    function startPlugin() {
        if (window.appready) {
            applyGalflixOverride();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') applyGalflixOverride();
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
