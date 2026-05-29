(function () {
    'use strict';

    function startPlugin() {
        var originalPush = Lampa.Activity.push;

        // Hook into the page pushing system of Lampa
        Lampa.Activity.push = function (params) {
            // Check if we are heading to the torrent search page
            if (params && params.component === 'torrents') {
                
                // Attempt to extract season and episode from different potential Lampa structures
                var rawS = params.season !== undefined ? params.season : (params.movie ? (params.movie.season_number || params.movie.season) : null);
                var rawE = params.episode !== undefined ? params.episode : (params.movie ? (params.movie.episode_number || params.movie.episode) : null);

                var sNum = extractNumber(rawS);
                var eNum = extractNumber(rawE);

                // If both are found and valid, generate the SxxEyy string
                if (sNum !== null && eNum !== null && !isNaN(sNum) && !isNaN(eNum)) {
                    var sStr = sNum < 10 ? '0' + sNum : sNum.toString();
                    var eStr = eNum < 10 ? '0' + eNum : eNum.toString();
                    var sxxeyy = 'S' + sStr + 'E' + eStr;

                    // Append SxxEyy to Lampa's search query parameters
                    if (params.search && typeof params.search === 'string') {
                        if (!params.search.includes(sxxeyy)) {
                            params.search = params.search + ' ' + sxxeyy;
                        }
                    }
                    if (params.query && typeof params.query === 'string') {
                        if (!params.query.includes(sxxeyy)) {
                            params.query = params.query + ' ' + sxxeyy;
                        }
                    }
                    if (params.search_one && typeof params.search_one === 'string') {
                        if (!params.search_one.includes(sxxeyy)) {
                            params.search_one = params.search_one + ' ' + sxxeyy;
                        }
                    }
                    if (params.search_two && typeof params.search_two === 'string') {
                        if (!params.search_two.includes(sxxeyy)) {
                            params.search_two = params.search_two + ' ' + sxxeyy;
                        }
                    }
                }
            }

            // Forward the adjusted parameters to Lampa's original routing function
            originalPush.apply(this, arguments);
        };
    }

    // Helper to extract numbers out of numbers or deep objects (like TMDB metadata objects)
    function extractNumber(obj) {
        if (obj === null || obj === undefined) return null;
        if (typeof obj === 'object') {
            var val = obj.episode_number !== undefined ? obj.episode_number : 
                      (obj.season_number !== undefined ? obj.season_number : 
                      (obj.number !== undefined ? obj.number : 
                      (obj.episode !== undefined ? obj.episode : 
                      (obj.season !== undefined ? obj.season : null))));
            return val !== null ? parseInt(val) : null;
        }
        return parseInt(obj);
    }

    // Safely wait for Lampa's core modules to finish initialization
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
