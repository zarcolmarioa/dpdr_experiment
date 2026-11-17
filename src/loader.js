/* =========================================================================
 * loader.js — fetches the data files, reads the link parameters, and
 * exposes the active text set.
 *
 * Reads, for the active stimulus set (v4):
 *   data/sets/<set>/trial_list.json        211 pair trials, in order
 *   data/sets/<set>/preload.json           334 image paths — every image a
 *                                          pair trial shows. Catch rows show
 *                                          no images, so the 15 images used
 *                                          only by catch rows are not listed.
 *   data/sets/<set>/grid/grid_trials.json  the two-block grid package
 *   data/sets/<set>/grid/preload.json      {"images": [...]}, 144 paths
 *
 * The packages are FROZEN copies of the preregistered stimuli. Nothing here
 * (or anywhere) reorders, resamples or rewrites them.
 *
 * The active set comes from CONFIG.data.set, or from ?set=<name> in the
 * URL, which overrides it. Both are resolved here, so nothing else in the
 * code needs to know where the files live.
 *
 * LINK PARAMETERS read here, so every module sees the same values:
 *   ?lang=en|ja           language (overrides CONFIG.language)
 *   ?group=participant|control
 *                         REQUIRED. Missing or invalid -> group() is null and
 *                         main.js shows the "incomplete link" screen.
 *   ?idate=YYYY-MM-DD     optional interview date; invalid -> ''.
 *   ?pid=...              read by participant-id.js.
 *
 * Nothing about the design is hard-coded in the experiment. Trial order,
 * pairing, left/right assignment, the predictor values and the grid layout
 * all come from the package files.
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
    trials:      null,
    preload:     null,
    grid:        null,   // the grid_trials.json object, or null if no grid
                         // block is switched on
    gridPreload: null,   // the list inside grid/preload.json
  };

  function _param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // -----------------------------------------------------------------------
  // Active stimulus set.
  //
  // A name that is not in CONFIG.data.available_sets is rejected HERE,
  // before any fetch, so a typo in a participant's link produces a clear
  // message naming the valid sets rather than a 404 in front of them.
  // -----------------------------------------------------------------------
  function _activeSet() {
    var override = _param('set');
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

  // Folder holding the active set's files, e.g. 'data/sets/v4/'.
  function _setDir() {
    return CONFIG.data.sets_dir + _activeSet() + '/';
  }

  // -----------------------------------------------------------------------
  // Active text set, chosen by CONFIG.language.
  // ?lang=en or ?lang=ja in the URL overrides it.
  // -----------------------------------------------------------------------
  function _activeLanguage() {
    var lang = _param('lang') || CONFIG.language || 'en';
    return (lang === 'ja') ? 'ja' : 'en';
  }

  function text() {
    return (_activeLanguage() === 'ja') ? TEXT_JA : TEXT_EN;
  }

  function words() {
    return (_activeLanguage() === 'ja') ? WORDS_JA : WORDS_EN;
  }

  function language() {
    return _activeLanguage();
  }

  // -----------------------------------------------------------------------
  // Group, from ?group=. Exact match against CONFIG.groups; anything else
  // (missing, misspelt, wrong case) is null, and main.js refuses to start.
  // Deliberately no default: a link without a group must not silently run
  // one group's wording.
  // -----------------------------------------------------------------------
  function group() {
    var g = _param('group');
    return (g && (CONFIG.groups || []).indexOf(g) !== -1) ? g : null;
  }

  // -----------------------------------------------------------------------
  // Pick the active group's version of a group-dependent string. Strings
  // that do not depend on the group are plain strings and pass through.
  // -----------------------------------------------------------------------
  function byGroup(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      var g = group();
      return (g && value[g] !== undefined) ? value[g] : '';
    }
    return value;
  }

  // -----------------------------------------------------------------------
  // Interview date, from ?idate=YYYY-MM-DD. Must be a real calendar date
  // (2026-02-30 is rejected). Returns '' when absent or invalid, so the
  // column is always present and empty means "not known".
  // -----------------------------------------------------------------------
  function interviewDate() {
    var raw = _param('idate');
    if (!raw) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
    if (m) {
      var y = +m[1], mo = +m[2], d = +m[3];
      var dt = new Date(Date.UTC(y, mo - 1, d));
      if (dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 &&
          dt.getUTCDate() === d) {
        return m[0];
      }
    }
    console.warn('[Loader] ?idate="' + raw + '" is not a valid YYYY-MM-DD ' +
                 'date — interview_date left empty.');
    return '';
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
  // Grid files live in their own sub-folder of the set:
  //   data/sets/<set>/grid/{grid_trials.json, preload.json, stimuli/}
  // Paths inside grid_trials.json are relative to that folder.
  //
  // Fetched only when at least one grid block is switched on.
  // -----------------------------------------------------------------------
  function _gridWanted() {
    return !!(CONFIG.blocks.grid_episode || CONFIG.blocks.grid_normal);
  }

  function _gridDir() {
    return _setDir() + 'grid/';
  }

  function gridImageURL(relativePath) {
    return _gridDir() + relativePath;
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

    var gridOn = _gridWanted();

    return Promise.all([
      _fetchJSON(dir + 'trial_list.json'),
      _fetchJSON(dir + 'preload.json'),
      gridOn ? _fetchJSON(_gridDir() + 'grid_trials.json') : null,
      gridOn ? _fetchJSON(_gridDir() + 'preload.json')     : null,
    ]).then(function (results) {
      _data.trials      = results[0];
      _data.preload     = results[1];
      _data.grid        = results[2];
      // grid/preload.json is {"images": [...]}. Anything else is left as
      // it is, for validate.js to reject with a clear message.
      _data.gridPreload = (results[3] && Array.isArray(results[3].images))
                          ? results[3].images : results[3];

      if (CONFIG.debug) {
        console.log('[Loader] set "' + _activeSet() + '": ' +
                    _data.trials.length + ' trials, ' +
                    _data.preload.length + ' images, grid = ' +
                    (_data.grid ? (_data.grid.version || '?') + ', ' +
                     (_data.gridPreload || []).length + ' images' : 'not loaded') +
                    ', language = ' + _activeLanguage() +
                    ', group = ' + (group() || 'MISSING'));
      }
      return _data;
    });
  }

  // -----------------------------------------------------------------------
  // Accessors.
  // -----------------------------------------------------------------------
  function trials()  { return _data.trials; }
  function preload() { return _data.preload; }

  // Absolute URLs for every pair image, for the preload plugin.
  function preloadURLs() {
    return _data.preload.map(imageURL);
  }

  function grid()        { return _data.grid; }
  function hasGrid()     { return !!_data.grid; }
  function gridPreloadURLs() {
    return (_data.gridPreload || []).map(gridImageURL);
  }

  // The screens of one scene set ('A' or 'B'), sorted by screen number.
  // Sorting by `screen` is the spec's presentation order; the file is
  // already in that order, so this changes nothing on the shipped package.
  function gridScreens(sceneSet) {
    var list = (_data.grid && _data.grid.sets && _data.grid.sets[sceneSet]) || [];
    return list.slice().sort(function (a, b) { return a.screen - b.screen; });
  }

  // Every screen of every set — for sizing the cell from the widest screen
  // in the file.
  function gridAllScreens() {
    var out = [];
    var sets = (_data.grid && _data.grid.sets) || {};
    for (var k in sets) {
      if (Object.prototype.hasOwnProperty.call(sets, k)) out = out.concat(sets[k]);
    }
    return out;
  }

  // The block definition ('episode' / 'normal') from the package.
  function gridBlock(name) {
    var blocks = (_data.grid && _data.grid.blocks) || [];
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].name === name) return blocks[i];
    }
    return null;
  }

  // Which scene set a block shows for a given set_code, from the package's
  // own set_assignment table:
  //   code 0 -> episode A, normal B;  code 1 -> episode B, normal A.
  function gridSceneSet(blockName, setCode) {
    var opts = (_data.grid && _data.grid.set_assignment &&
                _data.grid.set_assignment.options) || [];
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].code === setCode) return opts[i][blockName];
    }
    return null;
  }

  // Trials of one type, or everything except practice.
  function trialsOfType(type) {
    return _data.trials.filter(function (t) { return t.trial_type === type; });
  }
  function mainTrials() {
    return _data.trials.filter(function (t) { return t.trial_type !== 'practice'; });
  }

  return {
    loadAll:         loadAll,
    trials:          trials,
    preload:         preload,
    preloadURLs:     preloadURLs,
    trialsOfType:    trialsOfType,
    mainTrials:      mainTrials,
    imageURL:        imageURL,
    hasGrid:         hasGrid,
    grid:            grid,
    gridPreloadURLs: gridPreloadURLs,
    gridImageURL:    gridImageURL,
    gridScreens:     gridScreens,
    gridAllScreens:  gridAllScreens,
    gridBlock:       gridBlock,
    gridSceneSet:    gridSceneSet,
    stimulusSet:     stimulusSet,
    text:            text,
    words:           words,
    language:        language,
    group:           group,
    byGroup:         byGroup,
    interviewDate:   interviewDate,
  };
})();
