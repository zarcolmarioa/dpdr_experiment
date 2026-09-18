/* =========================================================================
 * loader.js — fetches the data files and exposes the active text set.
 *
 * Reads, for the active stimulus set:
 *   data/sets/<set>/trial_list.json   143 trials, built by build_trials.py
 *   data/sets/<set>/preload.json      the unique image paths those use
 *
 * The active set comes from CONFIG.data.set, or from ?set=<name> in the
 * URL, which overrides it. Both are resolved here, so nothing else in the
 * code needs to know where the files live.
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
  // Active stimulus set.
  //
  // A name that is not in CONFIG.data.available_sets is rejected HERE,
  // before any fetch, so a typo in a participant's link produces a clear
  // message naming the valid sets rather than a 404 in front of them.
  // -----------------------------------------------------------------------
  function _activeSet() {
    var override = new URLSearchParams(window.location.search).get('set');
    var name = override || CONFIG.data.set;
    var known = CONFIG.data.available_sets || [];

    if (known.indexOf(name) === -1) {
      throw new Error(
        'Unknown stimulus set "' + name + '"' +
        (override ? ' (from ?set= in the URL)' : ' (from CONFIG.data.set)') +
        '. Available sets: ' + known.join(', ') + '.'
      );
    }
    return name;
  }

  function stimulusSet() { return _activeSet(); }

  // Folder holding the active set's files, e.g. 'data/sets/lum_p05/'.
  function _setDir() {
    return CONFIG.data.sets_dir + _activeSet() + '/';
  }

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
  // browser can request ('data/sets/<set>/stimuli/xxx.png').
  //
  // Paths are case-sensitive on GitHub Pages as well as on Linux, so a
  // filename that works locally works there too — and a mismatch fails in
  // both places rather than only in production.
  // -----------------------------------------------------------------------
  function imageURL(relativePath) {
    return _setDir() + relativePath;
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
    var dir;
    try {
      dir = _setDir();                 // throws on an unknown set name
    } catch (e) {
      return Promise.reject(e);
    }

    return Promise.all([
      _fetchJSON(dir + 'trial_list.json'),
      _fetchJSON(dir + 'preload.json'),
    ]).then(function (results) {
      _data.trials  = results[0];
      _data.preload = results[1];

      if (CONFIG.debug) {
        console.log('[Loader] set "' + _activeSet() + '": ' +
                    _data.trials.length + ' trials, ' +
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
    stimulusSet:  stimulusSet,
    text:         text,
    language:     language,
  };
})();
