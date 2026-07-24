(function () {
    'use strict';

    // ISO Language tags for Hebrew in MKV/MP4 Matroska headers
    var HEBREW_ISO_CODES = ['heb', 'he', 'iw', 'hebrew', 'עברית'];

    function injectStyles() {
        if (document.getElementById('torrserver-heb-styles')) return;
        var style = document.createElement('style');
        style.id = 'torrserver-heb-styles';
        style.innerHTML = `
            .torrent-item.torr-heb-match {
                border-left: 6px solid #0038b8 !important;
                background: linear-gradient(90deg, rgba(0, 56, 184, 0.22) 0%, rgba(0, 0, 0, 0) 100%) !important;
            }
            .torr-heb-badge {
                background: #0038b8 !important;
                color: #ffffff !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                font-weight: bold !important;
                font-size: 0.75em !important;
                margin-left: 8px !important;
                display: inline-block !important;
                vertical-align: middle !important;
            }
        `;
        document.head.appendChild(style);
    }

    function markHebrew(element) {
        if (!element) return;
        var container = element.nodeType ? element : (element.render ? element.render() : null);
        if (!container || container.classList.contains('torr-heb-match')) return;

        container.classList.add('torr-heb-match');

        var titleElem = container.querySelector('.torrent-item__title') || container.querySelector('.title') || container;
        if (titleElem && !titleElem.querySelector('.torr-heb-badge')) {
            var badge = document.createElement('span');
            badge.className = 'torr-heb-badge';
            badge.innerText = '🇮🇱 Embedded HEB Sub';
            titleElem.appendChild(badge);
        }
    }

    // Fetches your TorrServer URL from Lampa settings
    function getTorrServerUrl() {
        var url = (window.Lampa && Lampa.Storage) 
            ? (Lampa.Storage.get('torrserver_url') || Lampa.Storage.get('torrserver_url_main') || 'http://127.0.0.1:8090') 
            : 'http://127.0.0.1:8090';
        return url.replace(/\/$/, '');
    }

    // Probes magnet via TorrServer Matrix API
    function probeWithTorrServer(magnet, element) {
        if (!magnet) return;

        var torrUrl = getTorrServerUrl() + '/torrents';
        var payload = {
            action: 'add',
            link: magnet,
            save_to_db: false
        };

        console.log('[TorrServerProbe] Sending magnet to TorrServer:', magnet);

        if (window.Lampa && Lampa.Reguest) {
            Lampa.Reguest.post(torrUrl, JSON.stringify(payload), function (data) {
                console.log('[TorrServerProbe] TorrServer response received:', data);

                if (data && (data.streams || data.file_stats)) {
                    var hasHebrewSub = false;

                    // Check 1: Embedded container tracks (MKV/MP4 FFprobe streams)
                    var streams = data.streams || [];
                    hasHebrewSub = streams.some(function (stream) {
                        var isSubtitle = stream.codec_type === 'subtitle' || stream.type === 'subtitle';
                        if (!isSubtitle) return false;

                        var lang = ((stream.tags && stream.tags.language) || stream.language || '').toLowerCase();
                        var title = ((stream.tags && stream.tags.title) || stream.title || '').toLowerCase();

                        return HEBREW_ISO_CODES.some(function (code) {
                            return lang === code || title.includes(code);
                        });
                    });

                    // Check 2: Internal files list (e.g. Subs/Hebrew.srt)
                    if (!hasHebrewSub && data.file_stats) {
                        hasHebrewSub = data.file_stats.some(function (file) {
                            var path = (file.path || file.name || '').toLowerCase();
                            var isSubFile = path.endsWith('.srt') || path.endsWith('.ass') || path.endsWith('.sub') || path.includes('/subs/');
                            return isSubFile && HEBREW_ISO_CODES.some(function (code) { return path.includes(code); });
                        });
                    }

                    if (hasHebrewSub) {
                        console.log('[TorrServerProbe] Match confirmed! Adding badge.');
                        markHebrew(element);
                    }
                }
            }, function (error) {
                console.log('[TorrServerProbe] Error querying TorrServer:', error);
            });
        }
    }

    function init() {
        if (!window.Lampa) return;

        injectStyles();

        if (Lampa.Noty) {
            Lampa.Noty.show('🇮🇱 TorrServer Probe Active');
        }

        // Hooks into Lampa search result items
        Lampa.Listener.follow('torrent', function (e) {
            if (e.type === 'render' || e.type === 'item') {
                var data = e.object || e.item || e.data;
                var element = e.element || (e.object && e.object.render ? e.object.render() : null);

                if (data && element) {
                    var magnet = data.Magnet || data.magnet || data.Link || data.link;
                    probeWithTorrServer(magnet, element);
                }
            }
        });
    }

    if (window.Lampa) {
        init();
    } else {
        document.addEventListener('appready', init);
    }
})();
