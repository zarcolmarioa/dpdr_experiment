/* =========================================================================
 * config.js — every setting for the experiment lives here.
 *
 * This is the ONLY file you edit to switch hosting platform, language,
 * or to turn blocks on and off. No settings are hard-coded elsewhere.
 * ========================================================================= */

var CONFIG = {

  // -----------------------------------------------------------------------
  // Experiment identity — stamped onto every row of the output.
  // -----------------------------------------------------------------------
  experiment: {
    name:    'derealization_grid',
    version: '0.1.0-smoketest',
  },

  // -----------------------------------------------------------------------
  // Hosting platform. Controls how data is saved.
  //
  //   'local'    — CSV downloads to your own Downloads folder. No upload.
  //                Use when opening index.html from disk.
  //   'github'   — uploads via DataPipe to the OSF component. Use when
  //                hosted on GitHub Pages.
  //   'pavlovia' — Pavlovia handles saving. Use when hosted on Pavlovia.
  // -----------------------------------------------------------------------
  platform: 'github',

  // -----------------------------------------------------------------------
  // DataPipe / OSF target.
  //
  // IMPORTANT: on the DataPipe dashboard, "Enable data collection?" must be
  // switched ON or every upload is rejected. The experiment will report the
  // rejection on screen, but it is easy to forget.
  // -----------------------------------------------------------------------
  datapipe: {
    experiment_id: 'yZIXKcYy54Uw',
    osf_project:   'tx5h2',   // recorded for reference only
    osf_component: 'qsv56',   // recorded for reference only
  },

  // -----------------------------------------------------------------------
  // Participant identification.
  //
  // The ID normally arrives as a URL parameter:
  //     https://<site>/?pid=R_9rJJWk01c767jE8
  // If absent, the participant is asked to type it (the same ID is printed
  // in their invitation email).
  //
  // IDs are CASE-SENSITIVE: R_4EWNe48BIB50mVI and R_4ewne48bib50mvi are
  // different identifiers. Whitespace is stripped; case is not touched.
  // -----------------------------------------------------------------------
  participant: {
    id_pattern:        '^R_[A-Za-z0-9]{15}$',
    superuser_id:      'Z_21121989',
    allow_manual_id:   true,   // false = URL parameter only
    collect_id:        true,
    collect_name:      false,  // see SETUP.md before enabling: name and
    collect_email:     false,  // email make the OSF dataset identifying
  },

  // -----------------------------------------------------------------------
  // Response keys.
  // -----------------------------------------------------------------------
  keys: {
    left:  'ArrowLeft',
    right: 'ArrowRight',
  },

  // -----------------------------------------------------------------------
  // Display.
  //
  // image_px is the on-screen size of each stimulus. The real images are
  // 512 x 512, so 512 means 1:1 with no resampling. min_viewport is derived
  // from it, so the two cannot drift apart.
  // -----------------------------------------------------------------------
  display: {
    image_px:      512,
    gap_px:        32,
    min_width:     512 * 2 + 32 + 64,   // 1120
    min_height:    512 + 168,           // 680
    hard_min_width: 800,                // below this, no override offered

    // false (default): every participant sees panels at exactly image_px.
    //   Removes between-participant variation in the physical size of the
    //   manipulation. On a viewport too small to fit them, the panels are
    //   CUT OFF rather than shrunk — which is why the viewport gate matters.
    // true: panels shrink to fit. Nothing is cut off, but display size
    //   varies between participants and must be treated as a covariate.
    allow_scaling: false,
  },

  // -----------------------------------------------------------------------
  // Language. 'en' | 'ja'. ?lang=en or ?lang=ja in the URL overrides this,
  // which is useful for checking both without editing the file.
  // -----------------------------------------------------------------------
  language: 'en',

  // -----------------------------------------------------------------------
  // Data files and where the stimulus images live.
  //
  // Paths inside trial_list.json look like 'stimuli/xxx.png'. stimulus_base
  // is prefixed to them, so the images are served from data/stimuli/.
  // -----------------------------------------------------------------------
  data: {
    trial_list:     'data/trial_list.json',
    preload:        'data/preload.json',
    stimulus_base:  'data/',
  },

  // -----------------------------------------------------------------------
  // Which blocks run. Each can be switched off independently, so a single
  // phase can be tested without sitting through the whole session.
  // -----------------------------------------------------------------------
  blocks: {
    practice: true,
    main:     true,
    mock:     false,   // the six placeholder trials; superseded by 'main'
  },

  // -----------------------------------------------------------------------
  // Calibration and screen handling.
  //
  // fullscreen is required for the real experiment: it fixes the viewport
  // so the stimuli are the same size throughout, and removes browser
  // chrome that would otherwise eat vertical space.
  // -----------------------------------------------------------------------
  calibration: {
    fullscreen:   true,
    screen_check: true,   // soft gate + override on small viewports
  },

  // -----------------------------------------------------------------------
  // Trial timing (milliseconds).
  // -----------------------------------------------------------------------
  timing: {
    fixation_ms: 500,
    blank_ms:    250,
    break_every: 35,   // break after every N main trials; 0 disables
  },

  // -----------------------------------------------------------------------
  // Smoke test settings. Ignored once the real phases are in place.
  // -----------------------------------------------------------------------
  mock: {
    n_trials: 6,
  },

  // -----------------------------------------------------------------------
  // Debug. When true, the console prints a validation report and the
  // completion screen shows the raw upload response.
  // -----------------------------------------------------------------------
  debug: true,
};
