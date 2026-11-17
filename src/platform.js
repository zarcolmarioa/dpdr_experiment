/* =========================================================================
 * platform.js — where the experiment is running, and the libraries.
 *
 * Loaded in <head> straight after config.js, and BEFORE everything else:
 * it writes the <script> and <link> tags for jsPsych, its plugins, and the
 * DataPipe or Pavlovia plugin, so only what this platform needs is loaded.
 * The tags are written with document.write, which keeps them in order and
 * loads them before the rest of the page, exactly as if they were typed
 * into index.html.
 *
 *   Platform.name()            'pavlovia' | 'github' | 'local'
 *       CONFIG.platform, or with 'auto' the address the page came from.
 *       Read every time it is called, so the dev menu can switch a test
 *       session to 'local'.
 *
 *   Platform.contactStorage()  'datapipe' | 'results_file'
 *       CONFIG.participant.contact_storage, or with 'auto' 'results_file'
 *       on Pavlovia and 'datapipe' elsewhere. Decided ONCE, when the page
 *       loads, because it decides whether the DataPipe plugin is loaded —
 *       a dev session switched to 'local' on Pavlovia keeps it.
 *
 *   Platform.libraries()       'bundled' | 'pavlovia'
 *       The copy actually loaded. 'pavlovia' (Pavlovia's own lib/vendors/)
 *       exists only on Pavlovia; anywhere else our copy in vendor/ is used
 *       instead, so the same files can still be tested on your computer.
 *
 * Unknown values are reported by validate.js, which stops the session.
 * ========================================================================= */

var Platform = (function () {

  var PLATFORMS = ['auto', 'local', 'github', 'pavlovia'];
  var LIBRARIES = { bundled: 'vendor/', pavlovia: 'lib/vendors/' };

  // jsPsych 7.1.2 core and the plugins this experiment uses.
  var JSPSYCH_DIR = 'jspsych-7.1.2/';
  var JSPSYCH_PLUGINS = [
    'plugin-html-keyboard-response.js',
    'plugin-survey-text.js',
    'plugin-survey-html-form.js',
    'plugin-call-function.js',
    'plugin-fullscreen.js',
    'plugin-preload.js',
    'plugin-html-button-response.js',
    'plugin-survey-likert.js',
  ];
  var JQUERY        = 'jquery-2.2.0.min.js';
  var PAVLOVIA_PLUG = 'jspsych-7-pavlovia-2021.12.js';
  var DATAPIPE_PLUG = 'https://unpkg.com/@jspsych-contrib/plugin-pipe@0.4/dist/index.browser.min.js';

  // -----------------------------------------------------------------------
  // The address the page came from.
  // -----------------------------------------------------------------------
  function detect() {
    var h = (window.location.hostname || '').toLowerCase();
    if (h === 'pavlovia.org' || /\.pavlovia\.org$/.test(h)) return 'pavlovia';
    if (/\.github\.io$/.test(h)) return 'github';
    return 'local';
  }

  function name() {
    var p = CONFIG.platform;
    return (p === 'auto' || !p) ? detect() : p;
  }

  // Fixed at load time — see the note at the top.
  var _loadPlatform = name();

  function contactStorage() {
    var c = (CONFIG.participant && CONFIG.participant.contact_storage) || 'auto';
    if (c !== 'auto') return c;
    return (_loadPlatform === 'pavlovia') ? 'results_file' : 'datapipe';
  }

  function libraries() {
    var l = CONFIG.libraries || 'bundled';
    if (l === 'pavlovia' && detect() !== 'pavlovia') return 'bundled';
    return l;
  }

  // Whether the DataPipe plugin is needed: the response upload on GitHub,
  // or the separate contact upload.
  function _needsDataPipe() {
    var P = CONFIG.participant || {};
    var contact = (P.collect_name || P.collect_email) &&
                  contactStorage() === 'datapipe';
    return _loadPlatform === 'github' || !!contact;
  }

  // Pilot runs on Pavlovia carry ?__pilotToken=... in the address.
  function isPavloviaPilotLink() {
    return new URLSearchParams(window.location.search).has('__pilotToken');
  }

  // -----------------------------------------------------------------------
  // Write the tags.
  // -----------------------------------------------------------------------
  var _loaded = [];

  function _script(src) {
    _loaded.push(src);
    document.write('<script src="' + src + '"><\/script>');
  }
  function _css(href) {
    _loaded.push(href);
    document.write('<link href="' + href + '" rel="stylesheet">');
  }

  function _writeTags() {
    var base = LIBRARIES[libraries()];
    if (!base) {
      // Fall back to our copy so the page can at least show the error.
      console.error('[Platform] CONFIG.libraries must be "bundled" or ' +
                    '"pavlovia", not "' + CONFIG.libraries + '".');
      base = LIBRARIES.bundled;
    }
    _script(base + JSPSYCH_DIR + 'jspsych.js');
    _css(base + JSPSYCH_DIR + 'jspsych.css');
    JSPSYCH_PLUGINS.forEach(function (p) { _script(base + JSPSYCH_DIR + p); });

    if (_needsDataPipe()) _script(DATAPIPE_PLUG);

    if (_loadPlatform === 'pavlovia') {
      _script(base + JQUERY);
      _script(PAVLOVIA_PLUG);
    }
    if (CONFIG.debug) {
      console.log('[Platform] ' + _loadPlatform + ' (setting: ' + CONFIG.platform +
                  '), libraries: ' + libraries() + ', contact storage: ' +
                  contactStorage() + '. Loading:', _loaded);
    }
  }

  _writeTags();

  return {
    PLATFORMS:           PLATFORMS,
    LIBRARIES:           Object.keys(LIBRARIES),
    detect:              detect,
    name:                name,
    loadPlatform:        function () { return _loadPlatform; },
    contactStorage:      contactStorage,
    libraries:           libraries,
    isPavloviaPilotLink: isPavloviaPilotLink,
    loaded:              function () { return _loaded.slice(); },
  };
})();
