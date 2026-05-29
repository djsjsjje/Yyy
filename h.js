(function () {
  'use strict';

  var FLAG = '__lampa_torrent_season_episode_filter_loaded__';
  if (window[FLAG]) return;
  window[FLAG] = true;

  function onReady(fn) {
    var started = false;

    function run() {
      if (started) return;
      if (!window.Lampa || !window.Lampa.Parser || !window.Lampa.Select || !window.Lampa.Storage) return;
      started = true;
      fn(window.Lampa);
    }

    if (window.appready && window.Lampa) run();
    else {
      var interval = setInterval(function () {
        if (started) clearInterval(interval);
        else run();
      }, 250);

      if (window.Lampa && window.Lampa.Listener) {
        window.Lampa.Listener.follow('app', function (event) {
          if (event && event.type === 'ready') run();
        });
      }
    }
  }

  onReady(function (Lampa) {
    var STORAGE_KEY = 'torrent_season_episode_filter';
    var fullResultsByKey = {};
    var latestKey = '';

    var originalParserGet = Lampa.Parser.get;
    var originalSelectShow = Lampa.Select.show;

    function log(message, error) {
      if (window.console && console.log) console.log('[SeasonEpisodeFilter] ' + message, error || '');
    }

    function isObject(value) {
      return value && typeof value === 'object' && !Array.isArray(value);
    }

    function toInt(value) {
      var number = parseInt(value, 10);
      return isNaN(number) ? 0 : number;
    }

    function pad2(value) {
      value = toInt(value);
      return value < 10 ? '0' + value : '' + value;
    }

    function languageIsRu() {
      var code = '';
      try {
        code = (Lampa.Storage.field('language') || Lampa.Storage.get('language', '') || '') + '';
      } catch (e) {}
      return code.toLowerCase().indexOf('ru') === 0;
    }

    function text(key) {
      var ru = languageIsRu();
      var dict = {
        season_episode: ru ? 'Сезон / серия' : 'Season / Episode',
        any: ru ? 'Любой' : 'Any',
        season: ru ? 'Сезон' : 'Season',
        episode: ru ? 'Серия' : 'Episode',
        seasons: ru ? 'Сезоны' : 'Seasons',
        episodes: ru ? 'Серии' : 'Episodes',
        results: ru ? 'рез.' : 'results',
        not_found: ru ? 'Сезоны и серии не найдены в названиях' : 'No seasons or episodes found in titles'
      };
      return dict[key] || key;
    }

    function titleOf(item) {
      return ((item && (item.Title || item.title)) || '') + '';
    }

    function getStore() {
      var store = Lampa.Storage.get(STORAGE_KEY, '{}');
      return isObject(store) ? store : {};
    }

    function saveStore(store) {
      Lampa.Storage.set(STORAGE_KEY, store);
    }

    function cleanState(state) {
      var result = {};
      if (state && state.season) result.season = toInt(state.season);
      if (state && state.episode) result.episode = toInt(state.episode);
      if (!result.season) delete result.season;
      if (!result.episode) delete result.episode;
      return result;
    }

    function hasState(state) {
      return !!(state && (state.season || state.episode));
    }

    function getFilter(key) {
      var store = getStore();
      return cleanState(store[key]);
    }

    function setFilter(key, state) {
      var store = getStore();
      state = cleanState(state);

      if (hasState(state)) store[key] = state;
      else delete store[key];

      saveStore(store);
    }

    function filterLabel(state) {
      state = cleanState(state);

      if (!hasState(state)) return text('any');
      if (state.season && state.episode) return 'S' + pad2(state.season) + 'E' + pad2(state.episode);
      if (state.season) return text('season') + ' ' + state.season;
      if (state.episode) return text('episode') + ' ' + state.episode;

      return text('any');
    }

    function keyFromObject(object) {
      var movie = object && (object.movie || object.card);
      var query;

      if (!movie && object && object.id) movie = object;

      if (movie && movie.id) {
        return movie.id + ':' + (movie.number_of_seasons || movie.original_name || movie.name ? 'tv' : 'movie');
      }

      query = object && (object.search || object.query || object.title);

      if (!query && Lampa.Activity && Lampa.Activity.active) {
        var active = Lampa.Activity.active();
        query = active && (active.search || active.query || active.title);
      }

      return query ? 'search:' + query : latestKey;
    }

    function keyFromActive() {
      var active = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
      return keyFromObject(active || {}) || latestKey || 'global';
    }

    function makeParsed(seasonStart, seasonEnd, episodeStart, episodeEnd) {
      var parsed = {
        season: toInt(seasonStart),
        seasonEnd: toInt(seasonEnd) || toInt(seasonStart)
      };

      if (episodeStart) {
        parsed.episode = toInt(episodeStart);
        parsed.episodeEnd = toInt(episodeEnd) || parsed.episode;
      }

      if (!parsed.season) return null;
      if (parsed.seasonEnd < parsed.season) parsed.seasonEnd = parsed.season;
      if (parsed.episode && parsed.episodeEnd < parsed.episode) parsed.episodeEnd = parsed.episode;

      return parsed;
    }

    function parseSeasonEpisode(title) {
      var value = (' ' + (title || '') + ' ').toLowerCase();
      var match;

      value = value
        .replace(/ё/g, 'е')
        .replace(/х/g, 'x')
        .replace(/[–—]/g, '-')
        .replace(/[\[\](){}]/g, ' ');

      match = value.match(/\bs\s*0?(\d{1,2})\s*[\.\-_\s]*e\s*0?(\d{1,3})(?:\s*-\s*(?:e\s*)?0?(\d{1,3}))?/i);
      if (match) return makeParsed(match[1], match[1], match[2], match[3]);

      match = value.match(/\b0?(\d{1,2})\s*x\s*0?(\d{1,3})(?:\s*-\s*0?(\d{1,3}))?/i);
      if (match) return makeParsed(match[1], match[1], match[2], match[3]);

      match = value.match(/\b(?:season|сезон)\s*[:#№\-]?\s*0?(\d{1,2})\D{0,30}\b(?:episode|ep|серия|серии)\s*[:#№\-]?\s*0?(\d{1,3})(?:\s*-\s*0?(\d{1,3}))?/i);
      if (match) return makeParsed(match[1], match[1], match[2], match[3]);

      match = value.match(/\b0?(\d{1,2})\s*(?:season|сезон)\D{0,30}\b0?(\d{1,3})\s*(?:episode|ep|серия|серии)/i);
      if (match) return makeParsed(match[1], match[1], match[2], match[2]);

      match = value.match(/\b(?:season|сезон)\s*[:#№\-]?\s*0?(\d{1,2})(?:\s*-\s*0?(\d{1,2}))?/i);
      if (match) return makeParsed(match[1], match[2] || match[1]);

      match = value.match(/\b0?(\d{1,2})\s*(?:season|сезон)\b/i);
      if (match) return makeParsed(match[1], match[1]);

      match = value.match(/\bs\s*0?(\d{1,2})(?:\s*-\s*0?(\d{1,2}))?\b/i);
      if (match) return makeParsed(match[1], match[2] || match[1]);

      return null;
    }

    function inRange(value, start, end) {
      value = toInt(value);
      start = toInt(start);
      end = toInt(end) || start;
      return value >= start && value <= end;
    }

    function matchesFilter(item, state) {
      var parsed;

      state = cleanState(state);
      if (!hasState(state)) return true;

      parsed = parseSeasonEpisode(titleOf(item));
      if (!parsed) return false;

      if (state.season && !inRange(state.season, parsed.season, parsed.seasonEnd)) return false;

      if (state.episode) {
        if (!parsed.episode) {
          return !!state.season;
        }

        return inRange(state.episode, parsed.episode, parsed.episodeEnd);
      }

      return true;
    }

    function numericKeys(object) {
      var result = [];
      var key;
      for (key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) result.push(toInt(key));
      }
      result.sort(function (a, b) { return a - b; });
      return result;
    }

    function makeSubtitle(count) {
      return count + ' ' + text('results');
    }

    function buildChoiceItems(key) {
      var source = fullResultsByKey[key] || [];
      var state = getFilter(key);
      var seasons = {};
      var episodes = {};
      var items = [];
      var i, s, e, parsed, sEnd, eEnd, epKey, seasonKeys, episodeKeys, parts;

      for (i = 0; i < source.length; i++) {
        parsed = parseSeasonEpisode(titleOf(source[i]));
        if (!parsed || !parsed.season) continue;

        sEnd = parsed.seasonEnd || parsed.season;
        if (sEnd - parsed.season > 30) sEnd = parsed.season;

        for (s = parsed.season; s <= sEnd; s++) {
          seasons[s] = (seasons[s] || 0) + 1;
        }

        if (parsed.episode) {
          eEnd = parsed.episodeEnd || parsed.episode;
          if (eEnd - parsed.episode > 80) eEnd = parsed.episode;

          for (s = parsed.season; s <= sEnd; s++) {
            for (e = parsed.episode; e <= eEnd; e++) {
              epKey = s + 'x' + e;
              episodes[epKey] = (episodes[epKey] || 0) + 1;
            }
          }
        }
      }

      items.push({
        title: text('any'),
        subtitle: text('season_episode'),
        selected: !hasState(state),
        state: {}
      });

      seasonKeys = numericKeys(seasons);
      if (seasonKeys.length) {
        items.push({ title: text('seasons'), separator: true });
        for (i = 0; i < seasonKeys.length; i++) {
          s = seasonKeys[i];
          items.push({
            title: text('season') + ' ' + s,
            subtitle: makeSubtitle(seasons[s]),
            selected: state.season === s && !state.episode,
            state: { season: s }
          });
        }
      }

      episodeKeys = [];
      for (epKey in episodes) {
        if (Object.prototype.hasOwnProperty.call(episodes, epKey)) episodeKeys.push(epKey);
      }

      episodeKeys.sort(function (a, b) {
        var aa = a.split('x');
        var bb = b.split('x');
        var as = toInt(aa[0]);
        var bs = toInt(bb[0]);
        var ae = toInt(aa[1]);
        var be = toInt(bb[1]);
        return as === bs ? ae - be : as - bs;
      });

      if (episodeKeys.length) {
        items.push({ title: text('episodes'), separator: true });
        for (i = 0; i < episodeKeys.length; i++) {
          parts = episodeKeys[i].split('x');
          s = toInt(parts[0]);
          e = toInt(parts[1]);
          items.push({
            title: 'S' + pad2(s) + 'E' + pad2(e),
            subtitle: makeSubtitle(episodes[episodeKeys[i]]),
            selected: state.season === s && state.episode === e,
            state: { season: s, episode: e }
          });
        }
      }

      if (!seasonKeys.length && !episodeKeys.length) {
        items.push({
          title: text('not_found'),
          ghost: true,
          noenter: true
        });
      }

      return items;
    }

    function reloadCurrentActivity() {
      setTimeout(function () {
        try {
          var active = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
          if (active && active.component === 'torrents' && Lampa.Activity.replace) {
            Lampa.Activity.replace({ page: 1 });
          } else if (Lampa.Activity && Lampa.Activity.refresh) {
            Lampa.Activity.refresh();
          }
        } catch (e) {
          log('reload error', e);
        }
      }, 80);
    }

    function showSeasonEpisodeSelect(key) {
      originalSelectShow.call(Lampa.Select, {
        title: text('season_episode'),
        items: buildChoiceItems(key),
        onSelect: function (item) {
          if (!item || item.noenter) return;
          setFilter(key, item.state || {});
          reloadCurrentActivity();
        }
      });
    }

    function isTorrentFilterMenu(params) {
      var items = params && params.items;
      var hasQuality = false;
      var hasTracker = false;
      var i;

      if (!items || !items.length) return false;

      for (i = 0; i < items.length; i++) {
        if (items[i] && items[i].stype === 'quality') hasQuality = true;
        if (items[i] && items[i].stype === 'tracker') hasTracker = true;
      }

      return hasQuality && hasTracker;
    }

    function injectMenuItem(params) {
      var items = params.items;
      var key = keyFromActive();
      var state = getFilter(key);
      var oldOnSelect = params.onSelect;
      var existingIndex = -1;
      var insertAfter = -1;
      var i;

      for (i = 0; i < items.length; i++) {
        if (items[i] && items[i].lampaSeasonEpisodeFilter) existingIndex = i;
        if (items[i] && items[i].stype === 'season') insertAfter = i;
        else if (items[i] && items[i].stype === 'lang' && insertAfter < 0) insertAfter = i;
      }

      if (existingIndex >= 0) {
        items[existingIndex].subtitle = filterLabel(state);
      } else {
        items.splice(insertAfter >= 0 ? insertAfter + 1 : items.length, 0, {
          title: text('season_episode'),
          subtitle: filterLabel(state),
          noselect: true,
          lampaSeasonEpisodeFilter: true
        });
      }

      params.onSelect = function (item, element) {
        if (item && item.lampaSeasonEpisodeFilter) {
          showSeasonEpisodeSelect(key);
          return;
        }

        if (item && item.reset) {
          setFilter(key, {});
          if (oldOnSelect) oldOnSelect(item, element);
          reloadCurrentActivity();
          return;
        }

        if (oldOnSelect) return oldOnSelect(item, element);
      };
    }

    Lampa.Parser.get = function (params, oncomplite, onerror) {
      return originalParserGet.call(Lampa.Parser, params, function (data) {
        try {
          var key = keyFromObject(params || {});
          var state;

          if (key) latestKey = key;

          if (data && data.Results && Array.isArray(data.Results)) {
            fullResultsByKey[key] = data.Results.slice(0);
            state = getFilter(key);

            if (hasState(state)) {
              data.Results = data.Results.filter(function (item) {
                return matchesFilter(item, state);
              });
            }
          }
        } catch (e) {
          log('parser patch error', e);
        }

        if (oncomplite) oncomplite(data);
      }, onerror);
    };

    Lampa.Select.show = function (params) {
      try {
        if (isTorrentFilterMenu(params)) injectMenuItem(params);
      } catch (e) {
        log('select patch error', e);
      }

      return originalSelectShow.call(Lampa.Select, params);
    };

    log('loaded');
  });
})();
