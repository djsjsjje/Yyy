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

            // Hook the render method which returns the sidebar HTML elements
            var originalRender = filterInstance.render;
            filterInstance.render = function () {
                var html = originalRender.apply(this, arguments);

                if (isTorrents) {
                    var seasons = {};
                    var episodes = {};

                    // 1. Scan the active list of torrents in the background to gather unique seasons & episodes
                    var torrentElements = $('.torrent-item, .torrents__item, .torrent-list .selector, .explorer__file');
                    
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

                    // 2. Find Lampa's native container where filter rows are appended
                    var container = html.find('.scroll__body, .filter__body, .filter__items, .scroll-body').first();
                    if (container.length === 0) container = html;

                    // 3. Construct and insert custom Season item
                    if (availableSeasons.length > 0) {
                        var selectedSeasonText = 'Any';
                        if (savedSeasonIndex > 0 && availableSeasons[savedSeasonIndex - 1]) {
                            var s = availableSeasons[savedSeasonIndex - 1];
                            selectedSeasonText = 'Season ' + (s < 10 ? '0' + s : s);
                        }

                        var seasonItem = $('<div class="filter--item filter__item selector" data-plugin-filter-type="season">' +
                            '<div class="filter--title filter__title filter--item-title filter__item-title">Season</div>' +
                            '<div class="filter--value filter__value filter--item-value filter__item-value">' + selectedSeasonText + '</div>' +
                            '</div>');

                        seasonItem.on('hover:enter click', function () {
                            var items = [{ title: 'Any', index: 0 }];
                            availableSeasons.forEach(function (s, idx) {
                                items.push({
                                    title: 'Season ' + (s < 10 ? '0' + s : s),
                                    index: idx + 1
                                });
                            });

                            Lampa.Select.show({
                                title: 'Select Season',
                                items: items,
                                onSelect: function (item) {
                                    Lampa.Select.close();
                                    savedSeasonIndex = item.index;
                                    seasonItem.find('.filter--value, .filter__value, .filter--item-value, .filter__item-value').text(item.title);
                                    applyDOMFilter();
                                },
                                onBack: function () {
                                    Lampa.Select.close();
                                }
                            });
                        });

                        container.append(seasonItem);
                    }

                    // 4. Construct and insert custom Episode item
                    if (availableEpisodes.length > 0) {
                        var selectedEpisodeText = 'Any';
                        if (savedEpisodeIndex > 0 && availableEpisodes[savedEpisodeIndex - 1]) {
                            var e = availableEpisodes[savedEpisodeIndex - 1];
                            selectedEpisodeText = 'Episode ' + (e < 10 ? '0' + e : e);
                        }

                        var episodeItem = $('<div class="filter--item filter__item selector" data-plugin-filter-type="episode">' +
                            '<div class="filter--title filter__title filter--item-title filter__item-title">Episode</div>' +
                            '<div class="filter--value filter__value filter--item-value filter__item-value">' + selectedEpisodeText + '</div>' +
                            '</div>');

                        episodeItem.on('hover:enter click', function () {
                            var items = [{ title: 'Any', index: 0 }];
                            availableEpisodes.forEach(function (e, idx) {
                                items.push({
                                    title: 'Episode ' + (e < 10 ? '0' + e : e),
                                    index: idx + 1
                                });
                            });

                            Lampa.Select.show({
                                title: 'Select Episode',
                                items: items,
                                onSelect: function (item) {
                                    Lampa.Select.close();
                                    savedEpisodeIndex = item.index;
                                    episodeItem.find('.filter--value, .filter__value, .filter--item-value, .filter__item-value').text(item.title);
                                    applyDOMFilter();
                                },
                                onBack: function () {
                                    Lampa.Select.close();
                                }
                            });
                        });

                        container.append(episodeItem);
                    }

                    // 5. Intercept Lampa's native "Reset filter" click to also reset Season & Episode selections
                    var resetBtn = html.find('.selector').filter(function () {
                        var text = $(this).text().toLowerCase();
                        return text.includes('reset') || text.includes('очистить');
                    });

                    if (resetBtn.length > 0) {
                        resetBtn.on('hover:enter click', function () {
                            savedSeasonIndex = 0;
                            savedEpisodeIndex = 0;
                            html.find('.filter--item[data-plugin-filter-type="season"] .filter--value, .filter__item[data-plugin-filter-type="season"] .filter__value').text('Any');
                            html.find('.filter--item[data-plugin-filter-type="episode"] .filter--value, .filter__item[data-plugin-filter-type="episode"] .filter__value').text('Any');
                            applyDOMFilter();
                        });
                    }

                    // Force Lampa's navigation controller to discover our added elements on TV/Remote focus maps
                    setTimeout(function () {
                        if (window.Lampa && Lampa.Controller) {
                            Lampa.Controller.enable('content');
                        }
                    }, 100);
                }

                return html;
            };

            return filterInstance;
        };

        Lampa.Filter.prototype = originalFilter.prototype;

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

        // Dom element manipulation to filter matching/non-matching elements
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
                    if (savedSeasonIndex > 0) {
                        var targetSeason = availableSeasons[savedSeasonIndex - 1];
                        if (parsed.season !== targetSeason) {
                            show = false;
                        }
                    }

                    // Filter by selected episode
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

                // Updates TV remote focus map to account for hidden/shown elements
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
