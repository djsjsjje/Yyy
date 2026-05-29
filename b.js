(function () {
    'use strict';

    function startPlugin() {
        // Inject a custom CSS class to safely hide elements and override any native styling
        $('<style>.hide-by-plugin { display: none !important; }</style>').appendTo('head');

        var originalFilter = Lampa.Filter;
        if (!originalFilter) return;

        var availableSeasons = [];
        var availableEpisodes = [];
        var savedSeasonIndex = 0;
        var savedEpisodeIndex = 0;

        // Hook and override Lampa's Filter Sidebar constructor
        Lampa.Filter = function (object) {
            var filterInstance = new originalFilter(object);

            // Determine if the filter is being drawn on the torrent screen
            var isTorrents = object && (object.component === 'torrents' || object.url === 'torrents');
            
            if (isTorrents) {
                // Reset selected values whenever a new torrent list is loaded
                savedSeasonIndex = 0;
                savedEpisodeIndex = 0;
                availableSeasons = [];
                availableEpisodes = [];
            }

            // Hook the set method which configures the sidebar items
            var originalSet = filterInstance.set;
            filterInstance.set = function (filter_items, choice) {
                if (isTorrents) {
                    var seasons = {};
                    var episodes = {};

                    // Read visible items in the DOM to collect all seasons and episodes
                    var torrentElements = $('.torrent-item, .torrents__item, .torrent-list .selector, .explorer__file');
                    
                    torrentElements.each(function (index, el) {
                        var titleText = $(el).find('.torrent-item__title, .torrents__item-title, .explorer__file-title').text() || $(el).text();
                        if (titleText) {
                            var parsed = parseSeasonEpisode(titleText);
                            if (parsed.season !== null) seasons[parsed.season] = true;
                            if (parsed.episode !== null) episodes[parsed.episode] = true;
                        }
                    });

                    // Sort parsed numerical values
                    availableSeasons = Object.keys(seasons).map(Number).sort(function (a, b) { return a - b; });
                    availableEpisodes = Object.keys(episodes).map(Number).sort(function (a, b) { return a - b; });

                    // Inject "Season" option into the sidebar array
                    if (availableSeasons.length > 0) {
                        filter_items.plugin_season = ['Any'].concat(availableSeasons.map(function (s) { 
                            return 'Season ' + (s < 10 ? '0' + s : s); 
                        }));
                        choice.plugin_season = savedSeasonIndex;
                    }

                    // Inject "Episode" option into the sidebar array
                    if (availableEpisodes.length > 0) {
                        filter_items.plugin_episode = ['Any'].concat(availableEpisodes.map(function (e) { 
                            return 'Episode ' + (e < 10 ? '0' + e : e); 
                        }));
                        choice.plugin_episode = savedEpisodeIndex;
                    }
                }

                originalSet.call(this, filter_items, choice);
            };

            // Intercept user selection clicks in the Sidebar
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
                            // Reset criteria when "Reset Filter" is clicked
                            savedSeasonIndex = 0;
                            savedEpisodeIndex = 0;
                            applyDOMFilter();
                            filterInstance.chosen('plugin_season', ['Any']);
                            filterInstance.chosen('plugin_episode', ['Any']);
                        }

                        // Forward selection to original filter handlers (for Quality, HDR, Subtitles, etc.)
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

        // Local title parsing regex supporting English/Russian release standards
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

        // Apply physical DOM adjustments
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

                    // Filter by season selection
                    if (savedSeasonIndex > 0) {
                        var targetSeason = availableSeasons[savedSeasonIndex - 1];
                        if (parsed.season !== targetSeason) {
                            show = false;
                        }
                    }

                    // Filter by episode selection
                    if (savedEpisodeIndex > 0) {
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

                // Crucial step: instruct Lampa's TV navigation controller to update focus map 
                if (window.Lampa && Lampa.Controller) {
                    Lampa.Controller.enable('content');
                }

                isFiltering = false;
            }, 50);
        }

        // MutationObserver triggers filter updates if items lazy-load or re-render
        var observer = new MutationObserver(function () {
            var torrentElements = $('.torrent-item, .torrents__item, .torrent-list .selector, .explorer__file');
            if (torrentElements.length > 0 && (savedSeasonIndex > 0 || savedEpisodeIndex > 0)) {
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
