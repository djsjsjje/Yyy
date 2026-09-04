(function () {
    'use strict';

    var PLUGIN_ID = 'galflix_preload_v7';

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
        /* ---------------------------------------------------------
           FULLSCREEN BLACKOUT LOADER
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
           REMOVE ORIGINAL MOVIE BACKDROP
           --------------------------------------------------------- */
        .media-loading.media-loading--standalone .media-loading__backdrop,
        .media-loading.media-loading--standalone .media-loading__shade {
            display: none !important;
        }

        /* ---------------------------------------------------------
           CONTENT CONTAINER
           --------------------------------------------------------- */
        .media-loading.media-loading--standalone .media-loading__content {
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
        .media-loading.media-loading--standalone .media-loading__mark {
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
            font-family: Arial, Helvetica, sans-serif !important;
            font-weight: 900 !important;
            font-size: clamp(50px, 8vw, 105px) !important;
            letter-spacing: -5px !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            text-align: center !important;
            user-select: none !important;
            text-shadow: 0 0 30px rgba(229, 9, 20, .20);
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
            background: rgba(255, 255, 255, .25) !important;
            border-radius: 20px !important;
            overflow: hidden !important;
            box-shadow: 0 0 15px rgba(0, 0, 0, .5) !important;
        }

        .galflix-progress-fill {
            width: 0%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: #e50914 !important;
            border-radius: 20px !important;
            transition: width .15s linear !important;
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
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 19px !important;
            font-weight: 600 !important;
            line-height: 24px !important;
            color: rgba(255, 255, 255, .80) !important;
            text-align: center !important;
            white-space: nowrap !important;
        }

        /* ---------------------------------------------------------
           ORIGINAL STATUS AREA: COMPACT & CENTERED
           --------------------------------------------------------- */
        .media-loading.media-loading--standalone .media-loading__status {
            position: absolute !important;
            left: 50% !important;
            right: auto !important;
            bottom: 4vh !important;
            top: auto !important;
            width: auto !important;
            min-width: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 6px 18px !important;
            transform: translateX(-50%) !important;
            display: inline-flex !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 10px !important;
            background: rgba(255, 255, 255, 0.08) !important;
            border-radius: 20px !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 16px !important;
            line-height: 20px !important;
            color: rgba(255, 2
