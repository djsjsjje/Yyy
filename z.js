(function () {
    'use strict';

    // ISO Language tags for Hebrew in MKV/MP4 Matroska headers
    var HEBREW_ISO_CODES = ['heb', 'he', 'iw', 'hebrew', 'עברית'];

    // 1. Inject global CSS rules (Pattern from torrent_styles_v2.js)
    function injectStyles() {
        if (document.getElementById('heb-sub-styles')) return;

        var style = document.createElement('style');
        style.id = 'heb-sub-styles';
        style.innerHTML = `
            .torrent-item.has-heb-sub {
                border-left: 6px solid #0038b8 !important;
                background: linear-gradient(90deg, rgba(0, 56, 184, 0.22) 0%, rgba(0, 0, 0, 0) 100%) !important;
            }
            .heb-sub-badge {
                background: #0038b8;
                color: #ffffff;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 0.75em;
                margin-left: 8px;
                display: inline-block;
                vertical-align: middle;
                letter-spacing: 0.5px;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Attach Badge & Class to Element
    function markHebrewSubtitle(element) {
        if (!element) return;
        var container = element.nodeType ? element : (element.render ? element.render() : null);
        if (!container || container.classList.contains('has-heb-sub')) return;

        container.classList.add('has-heb-sub');

        var titleElem = container.querySelector('.torrent-item__title') || container.querySelector('.title') || container;
        if (titleElem && !titleElem.querySelector('.heb-sub-badge')) {
            var badge = document.createElement('span');
            badge.className = 'heb-sub-badge';
            badge.innerText = '🇮🇱 Embedded HEB Sub';
            titleElem.appendChild(badge);
        }
    }

    // 3. Inspect Container Stream Array (Strictly Subtitles Only)
    function isHebrewSubtitleStream(stream) {
        var isSubtitle = stream.codec_type === 'subtitle' || stream.type === 'subtitle';
        if (!isSubtitle) return false;

        var lang = ((stream.tags && stream.tags.language) || stream.language || '').toLowerCase();
        var title = ((stream.tags && stream.tags.title) || stream.title || '').toLowerCase();

        return HEBREW_ISO_CODES.some(function (code) {
            return lang === code || title.includes(code);
        });
    }

    // 4. Check JacRed / TorrServer Streams
    function processTorrent(torrentData, element) {
        // Source A: JacRed / Lampac pre-parsed streams
        var streams = (torrentData.ffprobe && torrentData.ffprobe.streams) || torrentData.tracks || [];
        if (streams.length > 0 && streams.some(isHebrewSubtitleStream)) {
            markHebrewSubtitle(element);
            return;
        }

        // Source B: Fallback TorrServer FFprobe for uncached magnets
        var magnet = torrentData.Magnet || torrentData.magnet || torrentData.Link;
        if (magnet && window.Lampa && Lampa.Reguest && Lampa.Storage) {
            var torrUrl = (Lampa.Storage.get('torrserver_url') || 'http://127.0.0.1:8090').replace(/\/$/, '') + '/ffprobe';

            Lampa.Reguest.post(torrUrl, JSON.stringify({ link: magnet }), function (data) {
                if (data && data.streams && data.streams.some(isHebrewSubtitleStream)) {
                    markHebrewSubtitle(element);
                }
            });
        }
    }

    // 5. Initialize Plugin Hook
    function init() {
        if (!window.Lampa) return;

        injectStyles();

        // Listener for Lampa's internal torrent renderer
        Lampa.Listener.follow('torrent', function (e) {
            if (e.type === 'render' || e.type === 'item') {
                var torrentData = e.object || e.item || e.data;
                var element = e.element || (e.object && e.object.render ? e.object.render() : null);

                if (torrentData && element) {
                    processTorrent(torrentData, element);
                }
            }
        });
    }

    if (window.Lampa) {
        init();
    }
})();
