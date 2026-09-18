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
  // Catch trials.
  //
  // A catch trial shows NO IMAGES — just a large instruction naming one
  // arrow key. Removing the images is what makes the check work: with two
  // pictures on screen the trained "pick a side" response fires before the
  // participant reads anything, so an attentive-but-habituated person fails.
  // With nothing to choose between, the only available action is to read.
  //
  // The target is UP or DOWN, never a side, so a reflexive left/right press
  // fails immediately. A single key avoids OS auto-repeat, which would let
  // a held key satisfy a two-key sequence by accident.
  //
  // ONE PRESS ONLY. The first keypress ends the trial and is scored against
  // the target — there is no retry. A trial that waited for the correct key
  // could only ever end in success and would discriminate nothing.
  //
  // `sequence` is applied in order to the catch trials as they appear in
  // trial_list.json, so assignment is deterministic and reproducible.
  // Balanced 3 up / 3 down: an all-same target would be learnable, which is
  // the flaw in the correct_response column of trial_list.json (all six are
  // 'right'). That column is ignored for catch scoring.
  //
  // Chance of passing by mashing arrows is 1/4 per trial, so P(4+ of 6) is
  // about 4%. Mashing left/right — the most likely disengaged behaviour —
  // fails every time.
  // -----------------------------------------------------------------------
  catch_trials: {
    sequence:   ['ArrowUp', 'ArrowDown', 'ArrowDown',
                 'ArrowUp', 'ArrowDown', 'ArrowUp'],
    lockout_ms: 750,   // keys dead for this long, so a carried-over
                       // reflex press from the previous trial cannot land
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
  // Stimulus sets.
  //
  // Each set lives in its own folder under sets_dir and holds all three
  // things it needs:
  //
  //     data/sets/<set>/trial_list.json
  //     data/sets/<set>/preload.json
  //     data/sets/<set>/stimuli/*.png
  //
  // They are kept together because a trial list and its images are a
  // matched pair — a list referencing the other set's filenames would fail
  // at preload. Keeping them in one folder makes that mismatch impossible.
  //
  // Set names describe the feature used to select the stimuli, so the
  // distinction stays legible later.
  //
  // `set` is the default. ?set=<name> in the URL overrides it, which lets
  // sets be assigned per participant when the invitation links are
  // generated, with no redeploy between participants.
  //
  // The active set is stamped onto every output row as `stimulus_set` and
  // into the uploaded filename. If both sets are piloted, that column is
  // what makes the data interpretable.
  // -----------------------------------------------------------------------
  data: {
    set:            'lum_p05',
    available_sets: ['lum_p05', 'contrast_local'],
    sets_dir:       'data/sets/',
  },

  // -----------------------------------------------------------------------
  // Which blocks run. Each can be switched off independently, so a single
  // phase can be tested without sitting through the whole session.
  // -----------------------------------------------------------------------
  blocks: {
    size_check: true,   // the panel-size verification screen
    words:      true,   // descriptor ratings — MUST run before the images
    practice:   true,
    main:       true,
    mock:       false,  // six placeholder trials; superseded by 'main'
  },

  // -----------------------------------------------------------------------
  // Limits. For quick testing only — leave at 0 for real sessions.
  //
  // max_trials truncates the main block to its first N trials. Useful for
  // confirming an upload reaches OSF without sitting through 137 trials.
  //
  // A truncated session is NOT valid data: it will be missing catch and
  // consistency trials, and the predictor spread the analysis depends on.
  // Any session run with a limit is stamped `is_dev = true`.
  // -----------------------------------------------------------------------
  limits: {
    max_trials:   0,   // 0 = all main trials
    max_practice: 0,   // 0 = all practice trials
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

    // Both matter more here than in most experiments, because the
    // manipulations ARE saturation and shadow lifting — see the module
    // headers in src/calibration/. Neither lets you correct anything;
    // both give you a covariate.
    brightness:   true,   // ask for maximum screen brightness
    gamma:        true,   // 3x luminance match, ~2 minutes

    // 'split_field' (left checkerboard | right grey) or 'centre_surround'
    gamma_arrangement: 'split_field',
  },

  // -----------------------------------------------------------------------
  // Trial timing (milliseconds).
  // -----------------------------------------------------------------------
  timing: {
    fixation_ms: 500,
    blank_ms:    250,
    break_every: 35,   // break after every N main trials; 0 disables

    // Practice feedback: the chosen image is outlined for this long, on
    // the first N practice trials only. The remaining practice trials run
    // exactly like the main block, so the transition is not itself a
    // change in conditions.
    practice_feedback_trials: 2,
    practice_feedback_ms:     900,
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
