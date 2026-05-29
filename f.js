(function () {
    'use strict';

    function startPlugin() {
        // Inject a custom CSS class to safely hide filtered elements
        $('<style>.hide-by-plugin { display: none !important; }</style>').appendTo('head');

        var availableSeasons = [];
        var availableEpisodes = [];
        var savedSeasonIndex = 0;
        var savedEpisodeIndex = 0;

        // 1. Key Interception for TV Remotes
        // This handles "OK / Enter" on focused custom items
        window.addEventListener('keydown', function (e) {
            if (e.keyCode === 13 || e.key === 'Enter') {
                var focused = document.querySelector('.selector.focus');
                if (focused) {
                    var filterType = focused.getAttribute('data-plugin-filter-type');
                    if (filterType === 'season' || filterType === 'episode') {
                        // Prevent Lampa from swallowing or ignoring the click
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        
                        // Forcefully trigger the click event
                        $(focused).trigger('click');
                    }
                }
            }
        }, true); // Capture phase setting to guarantee priority

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

        // Live DOM monitoring loop
        var observer = new MutationObserver(function () {
            var torrentElements = $('.torrent-item, .torrents__item, .torrent-list .selector, .explorer__file');
            
            // If we leave the torrent page entirely, reset active filters automatically
            if (torrentElements.length === 0) {
                savedSeasonIndex = 0;
                savedEpisodeIndex = 0;
                availableSeasons = [];
                availableEpisodes = [];
                return;
            }

            // Apply filters to any freshly-loaded torrent items
            if (savedSeasonIndex > 0 || savedEpisodeIndex > 0) {
                applyDOMFilter();
            }

            // Check if Lampa's native Filter slide-out is currently open on the TV
            var filterContainer = null;
            var resetRow = null;

            $('.selector, .filter--item, .filter__item').each(function () {
                var text = $(this).text().toLowerCase();
                if (text.includes('reset filter') || text.includes('очистить фильтр') || text.includes('quality') || text.includes('качество')) {
                    resetRow = $(this);
                    filterContainer = $(this).parent();
                    return false; // Break loop
                }
            });

            // If the filter side-menu is detected on the TV screen
            if (filterContainer && torrentElements.length > 0) {
                // Check if our custom elements are already rendered to avoid duplicates
                if (filterContainer.find('[data-plugin-filter-type="season"]').length === 0) {
                    
                    // Parse available seasons and episodes directly from the active search results
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

                    var itemClass = resetRow.attr('class') || 'filter--item selector';

                    // 2. Construct & Inject Custom Season Selector Row
                    if (availableSeasons.length > 0) {
                        var selectedSeasonText = 'Any';
                        if (savedSeasonIndex > 0 && availableSeasons[savedSeasonIndex - 1]) {
                            var s = availableSeasons[savedSeasonIndex - 1];
                            selectedSeasonText = 'Season ' + (s < 10 ? '0' + s : s);
                        }

                        var seasonItem = $('<div class="' + itemClass + '" data-plugin-filter-type="season">' +
                            '<div class="filter--title filter__title filter--item-title filter__item-title">Season</div>' +
                            '<div class="filter--value filter__value filter--item-value filter__item-value" style="float: right; opacity: 0.6;">' + selectedSeasonText + '</div>' +
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

                        filterContainer.append(seasonItem);
                    }

                    // 3. Construct & Inject Custom Episode Selector Row
                    if (availableEpisodes.length > 0) {
                        var selectedEpisodeText = 'Any';
                        if (savedEpisodeIndex > 0 && availableEpisodes[savedEpisodeIndex - 1]) {
                            var e = availableEpisodes[savedEpisodeIndex - 1];
                            selectedEpisodeText = 'Episode ' + (e < 10 ? '0' + e : e);
                        }

                        var episodeItem = $('<div class="' + itemClass + '" data-plugin-filter-type="episode">' +
                            '<div class="filter--title filter__title filter--item-title filter__item-title">Episode</div>' +
                            '<div class="filter--value filter__value filter--item-value filter__item-value" style="float: right; opacity: 0.6;">' + selectedEpisodeText + '</div>' +
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

                        filterContainer.append(episodeItem);
                    }

                    // 4. Connect to Lampa's native "Reset Filter" row click
                    if (resetRow) {
                        resetRow.off('click.plugin_reset').on('click.plugin_reset', function () {
                            savedSeasonIndex = 0;
                            savedEpisodeIndex = 0;
                            filterContainer.find('[data-plugin-filter-type="season"] .filter--value, [data-plugin-filter-type="season"] .filter__value, [data-plugin-filter-type="season"] .filter--item-value, [data-plugin-filter-type="season"] .filter__item-value').text('Any');
                            filterContainer.find('[data-plugin-filter-type="episode"] .filter--value, [data-plugin-filter-type="episode"] .filter__value, [data-plugin-filter-type="episode"] .filter--item-value, [data-plugin-filter-type="episode"] .filter__item-value').text('Any');
                            applyDOMFilter();
                        });
                    }

                    // 5. Force the active TV remote controller to rebuild its map so it recognizes the newly injected rows
                    setTimeout(function () {
                        var active = Lampa.Controller.enabled();
                        if (active && typeof active.toggle === 'function') {
                            active.toggle();
                        }
                    }, 50);
                }
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
