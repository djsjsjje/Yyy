(function () {
    'use strict';

    function startPlugin() {
        // Inject a custom CSS class to safely hide filtered elements
        $('<style>.hide-by-plugin { display: none !important; }</style>').appendTo('head');

        var availableSeasons = [];
        var availableEpisodes = [];
        var savedSeasonIndex = 0;
        var savedEpisodeIndex = 0;

        // Title parser supporting English & Russian formatting
        function parseSeasonEpisode(title) {
            var s = null;
            var e = null;

            var seMatch = title.match(/S(\d+)\s*E(\d+)/i);
            if (seMatch) {
                s = parseInt(seMatch[1]);
                e = parseInt(seMatch[2]);
            } else {
                var ruMatch1 = title.match(/(\d+)\s*сезон/i);
                var ruMatch2 = title.match(/(\d+)\s*сери[яи]/i);
                if (ruMatch1) s = parseInt(ruMatch1[1]);
                if (ruMatch2) e = parseInt(ruMatch2[1]);

                if (s === null && e === null) {
                    var ruMatch3 = title.match(/сезон\s*(\d+)/i);
                    var ruMatch4 = title.match(/сери[яи]\s*(\d+)/i);
                    if (ruMatch3) s = parseInt(ruMatch3[1]);
                    if (ruMatch4) e = parseInt(ruMatch4[1]);
                }

                if (s === null && e === null) {
                    var xMatch = title.match(/(\d+)x(\d+)/i);
                    if (xMatch) {
                        s = parseInt(xMatch[1]);
                        e = parseInt(xMatch[2]);
                    } else {
                        var sSingle = title.match(/S(\d+)/i);
                        var eSingle = title.match(/E(\d+)/i);
                        if (sSingle) s = parseInt(sSingle[1]);
                        if (eSingle) e = parseInt(eSingle[1]);
                    }
                }
            }
            return { season: s, episode: e };
        }

        var isFiltering = false;

        // Dom element manipulation to show/hide items matching filters
        function applyDOMFilter() {
            if (isFiltering) return;
            isFiltering = true;

            setTimeout(function () {
                var torrentElements = $('.torrent-item, .torrents__item, .torrent-list .selector, .explorer__file');
                
                torrentElements.each(function (index, el) {
                    var $el = $(el);
                    var titleText = $el.find('.torrent-item__title, .torrents__item-title, .explorer__file-title').text() || $el.text();
                    
                    if (!titleText) return;

                    var parsed = parseSeasonEpisode(titleText);
                    var show = true;

                    // Filter by selected season
                    if (savedSeasonIndex > 0 && availableSeasons.length > 0) {
                        var targetSeason = availableSeasons[savedSeasonIndex - 1];
                        if (parsed.season !== targetSeason) {
                            show = false;
                        }
                    }

                    // Filter by selected episode
                    if (savedEpisodeIndex > 0 && availableEpisodes.length > 0) {
                        var targetEpisode = availableEpisodes[savedEpisodeIndex - 1];
                        if (parsed.episode !== targetEpisode) {
                            show = false;
                        }
                    }

                    if (show) {
                        $el.removeClass('hide-by-plugin').show();
                    } else {
                        $el.addClass('hide-by-plugin').hide();
                    }
                });

                // Updates TV remote focus map to account for hidden/shown elements
                if (window.Lampa && Lampa.Controller) {
                    Lampa.Controller.enable('content');
                }

                isFiltering = false;
            }, 50);
        }

        // Hook Lampa's native Filter Class constructor
        var originalFilter = Lampa.Filter;
        if (originalFilter) {
            Lampa.Filter = function (object) {
                var filterInstance = new originalFilter(object);

                // Intercept Lampa's native selection changes dynamically
                var originalOnSelect = null;
                Object.defineProperty(filterInstance, 'onSelect', {
                    get: function () {
                        return function (type, item) {
                            if (type === 'plugin_season') {
                                savedSeasonIndex = item.index;
                                applyDOMFilter();
                                filterInstance.chosen('plugin_season', [item.title]);
                            } else if (type === 'plugin_episode') {
                                savedEpisodeIndex = item.index;
                                applyDOMFilter();
                                filterInstance.chosen('plugin_episode', [item.title]);
                            } else if (item && item.reset) {
                                savedSeasonIndex = 0;
                                savedEpisodeIndex = 0;
                                applyDOMFilter();
                                filterInstance.chosen('plugin_season', ['Any']);
                                filterInstance.chosen('plugin_episode', ['Any']);
                            }

                            // Call the original Lampa handler to preserve standard filters logic
                            if (originalOnSelect) {
                                originalOnSelect.call(this, type, item);
                            }
                        };
                    },
                    set: function (val) {
                        originalOnSelect = val;
                    },
                    configurable: true,
                    enumerable: true
                });

                return filterInstance;
            };
            Lampa.Filter.prototype = originalFilter.prototype;

            // Hook Lampa's native set method to insert our options directly into the selection array
            var originalSet = Lampa.Filter.prototype.set;
            Lampa.Filter.prototype.set = function (type, select) {
                if (type === 'filter' && select && Array.isArray(select)) {
                    var torrentElements = $('.torrent-item, .torrents__item, .torrent-list .selector, .explorer__file');
                    
                    if (torrentElements.length > 0) {
                        var seasons = {};
                        var episodes = {};

                        torrentElements.each(function (index, el) {
                            var titleText = $(el).find('.torrent-item__title, .torrents__item-title, .explorer__file-title').text() || $(el).text();
                            if (titleText) {
                                var parsed = parseSeasonEpisode(titleText);
                                if (parsed.season !== null) seasons[parsed.season] = true;
                                if (parsed.episode !== null) episodes[parsed.episode] = true;
                            }
                        });

                        availableSeasons = Object.keys(seasons).map(Number).sort(function (a, b) { return a - b; });
                        availableEpisodes = Object.keys(episodes).map(Number).sort(function (a, b) { return a - b; });

                        // Inject native-behaving Season list item
                        if (availableSeasons.length > 0) {
                            var hasPluginSeason = select.some(function (item) { return item.stype === 'plugin_season'; });
                            if (!hasPluginSeason) {
                                var seasonSubitems = [{ title: 'Any', selected: savedSeasonIndex === 0, index: 0 }];
                                availableSeasons.forEach(function (s, idx) {
                                    seasonSubitems.push({
                                        title: 'Season ' + (s < 10 ? '0' + s : s),
                                        selected: savedSeasonIndex === idx + 1,
                                        index: idx + 1
                                    });
                                });

                                select.push({
                                    title: 'Season',
                                    subtitle: seasonSubitems[savedSeasonIndex].title,
                                    items: seasonSubitems,
                                    stype: 'plugin_season'
                                });
                            }
                        }

                        // Inject native-behaving Episode list item
                        if (availableEpisodes.length > 0) {
                            var hasPluginEpisode = select.some(function (item) { return item.stype === 'plugin_episode'; });
                            if (!hasPluginEpisode) {
                                var episodeSubitems = [{ title: 'Any', selected: savedEpisodeIndex === 0, index: 0 }];
                                availableEpisodes.forEach(function (e, idx) {
                                    episodeSubitems.push({
                                        title: 'Episode ' + (e < 10 ? '0' + e : e),
                                        selected: savedEpisodeIndex === idx + 1,
                                        index: idx + 1
                                    });
                                });

                                select.push({
                                    title: 'Episode',
                                    subtitle: episodeSubitems[savedEpisodeIndex].title,
                                    items: episodeSubitems,
                                    stype: 'plugin_episode'
                                });
                            }
                        }
                    }
                }

                // Call original set method, which now contains our newly injected native objects
                return originalSet.apply(this, arguments);
            };
        }

        // Live DOM monitoring loop to apply hiding criteria on lazy-loads
        var observer = new MutationObserver(function () {
            var torrentElements = $('.torrent-item, .torrents__item, .torrent-list .selector, .explorer__file');
            
            if (torrentElements.length === 0) {
                savedSeasonIndex = 0;
                savedEpisodeIndex = 0;
                availableSeasons = [];
                availableEpisodes = [];
                return;
            }

            if (savedSeasonIndex > 0 || savedEpisodeIndex > 0) {
                applyDOMFilter();
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }
})();
