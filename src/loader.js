/* =========================================================================
 * loader.js — fetches the data files and exposes the active text set.
 *
 * Reads:
 *   data/trial_list.json    143 trials, built by build_trials.py
 *   data/preload.json       the 227 unique image paths those trials use
 *
 * Nothing about the design is hard-coded in the experiment. Trial order,
 * pairing, counterbalancing and the predictor values all come from
 * trial_list.json, so regenerating that file changes the experiment with
 * no code change.
 *
 * FILE:// DOES NOT WORK
 * ---------------------
 * fetch() cannot read local files when the page is opened directly from
 * disk — browsers treat file:// as a cross-origin request and block it.
 * To test locally, serve the folder over HTTP:
 *
 *     cd /path/to/repo && python3 -m http.server 8000
 *     then open http://localhost:8000/
 *
 * This affects local testing only. GitHub Pages and Pavlovia both serve
 * over HTTP, where fetch works normally.
 * ========================================================================= */

var Loader = (function () {

  var _data = {
    trials:  null,
    preload: null,
  };

  // -----------------------------------------------------------------------
  // Active text set, chosen by CONFIG.language.
  // ?lang=en or ?lang=ja in the URL overrides it, for testing.
  // -----------------------------------------------------------------------
  function _activeLanguage() {
    var override = new URLSearchParams(window.location.search).get('lang');
    var lang = override || CONFIG.language || 'en';
    return (lang === 'ja') ? 'ja' : 'en';
  }

  function text() {
    return (_activeLanguage() === 'ja') ? TEXT_JA : TEXT_EN;
  }

  function language() {
    return _activeLanguage();
  }

  // -----------------------------------------------------------------------
  // Turn a path from trial_list.json ('stimuli/xxx.png') into a URL the
  // browser can request ('data/stimuli/xxx.png').
  //
  // Paths are case-sensitive on GitHub Pages as well as on Linux, so a
  // filename that works locally works there too — and a mismatch fails in
  // both places rather than only in production.
  // -----------------------------------------------------------------------
  function imageURL(relativePath) {
    return CONFIG.data.stimulus_base + relativePath;
  }

  // -----------------------------------------------------------------------
  // Fetch one JSON file, with a useful error if it is missing.
  // -----------------------------------------------------------------------
  function _fetchJSON(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) {
        throw new Error(
          'Could not load ' + path + ' (HTTP ' + response.status + '). ' +
          'Check the file exists and the path in CONFIG.data is correct.'
        );
      }
      return response.json();
    }).catch(function (err) {
      if (window.location.protocol === 'file:') {
        throw new Error(
          'Could not load ' + path + ' because the page was opened from ' +
          'disk (file://). Serve the folder over HTTP instead:\n\n' +
          '    python3 -m http.server 8000\n\n' +
          'then open http://localhost:8000/'
        );
      }
      throw err;
    });
  }

  // -----------------------------------------------------------------------
  // Load everything. Returns a promise resolving to the parsed data.
  // -----------------------------------------------------------------------
  function loadAll() {
    return Promise.all([
      _fetchJSON(CONFIG.data.trial_list),
      _fetchJSON(CONFIG.data.preload),
    ]).then(function (results) {
      _data.trials  = results[0];
      _data.preload = results[1];

      if (CONFIG.debug) {
        console.log('[Loader] ' + _data.trials.length + ' trials, ' +
                    _data.preload.length + ' images, language = ' +
                    _activeLanguage());
      }
      return _data;
    });
  }

  // -----------------------------------------------------------------------
  // Accessors.
  // -----------------------------------------------------------------------
  function trials()  { return _data.trials; }
  function preload() { return _data.preload; }

  // Absolute URLs for every image, for the preload plugin.
  function preloadURLs() {
    return _data.preload.map(imageURL);
  }

  // Trials of one type, or everything except practice.
  function trialsOfType(type) {
    return _data.trials.filter(function (t) { return t.trial_type === type; });
  }
  function mainTrials() {
    return _data.trials.filter(function (t) { return t.trial_type !== 'practice'; });
  }

  return {
    loadAll:      loadAll,
    trials:       trials,
    preload:      preload,
    preloadURLs:  preloadURLs,
    trialsOfType: trialsOfType,
    mainTrials:   mainTrials,
    imageURL:     imageURL,
    text:         text,
    language:     language,
  };
})();
