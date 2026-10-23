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
    version: '0.9.0-v4',
  },

  // -----------------------------------------------------------------------
  // Groups. Read from ?group= in the invitation link — never asked on
  // screen. The group changes ONLY the wording of four things (anchoring
  // screen, trial prompt, episode-grid question, word-rating instruction
  // and question); everything else is identical. Each group-dependent
  // string in text/en and text/ja is an object keyed by these names, and
  // validate.js checks every one has both.
  //
  // A link with no group, or one not listed here, does not start: it shows
  // the same "incomplete link" message as a missing participant ID.
  //
  // Stamped on every row as `group`.
  //
  // The link may also carry ?idate=YYYY-MM-DD, the date of the
  // participant's interview, added by the researcher who schedules the
  // interviews. It is never asked on screen. A valid date is stamped on
  // every row as `interview_date`; a missing or invalid one leaves it empty
  // (and logs a console warning) — the session still runs.
  //
  // A full link:  .../?pid=R_xxxxxxxxxxxxxxx&group=participant&idate=2026-11-03
  // -----------------------------------------------------------------------
  groups: ['participant', 'control'],

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
  //
  // All three are asked on ONE screen at the start. If the invitation link
  // carries ?pid=, the ID field is filled in already.
  //
  // The three fields can each be switched off independently:
  //
  //   collect_id     REQUIRED when on. The ID is what links a session to the
  //                  participant's CDS-29 score. If switched off, sessions
  //                  get an anonymous ID ('ANON_' + random) and CANNOT be
  //                  linked to anything — validate.js warns about this.
  //
  //   collect_name   OPTIONAL for the participant (they may leave it blank).
  //   collect_email  OPTIONAL for the participant.
  //
  // Name and email are NEVER written to the response data. They are
  // uploaded as a separate small file (ID + name + email) to a separate
  // DataPipe experiment and OSF component — see `contact_datapipe` below —
  // so the response data on OSF stays pseudonymised, and the file that
  // identifies people can be restricted or deleted on its own. The
  // response data only records whether each was given (true/false).
  // If all three are off, the screen is skipped entirely.
  //
  // The contact file is uploaded whenever a name or email is given, on
  // every platform including local/dev runs, so it can be tested quickly.
  // Test sessions are flagged is_test / is_dev inside that file too.
  //
  // NO ID IN THE LINK (allow_manual_id: true, name and email both
  // collected). The participant must give EITHER a valid participant ID
  // OR both a name and a valid email address — giving all three is best,
  // and the screen says so. An ID that is typed but does not match
  // id_pattern still blocks Continue (a mistyped ID would point to the
  // wrong person); to continue without an ID the field must be empty.
  // A session without an ID gets a unique ID made of no_id_prefix, '_',
  // and 8 random characters (e.g. NOID_DRCHAIN26_7K3QX9PA). It is the
  // participant_id of the response file AND of the contact file, so the
  // two link exactly as they do with a real ID — which means the link to
  // the person then rests entirely on the contact file reaching DataPipe
  // (recorded as contact_saved). id_source = 'no_id'. These are real
  // sessions, not tests: is_test stays false.
  //
  // With a valid ?pid= in the link nothing changes: the ID is filled in,
  // and name and email are optional.
  // -----------------------------------------------------------------------
  participant: {
    id_pattern:        '^R_[A-Za-z0-9]{15}$',
    no_id_prefix:      'NOID_DRCHAIN26',

    // Test IDs. Accepted in place of a real ID, and every row of a session
    // using one is flagged is_test = true. Add more as needed.
    //   Z_21121989  — your own testing
    //   CHAIN_2026  — for colleagues. Several people may share it; their
    //                 files are still separate (the filename has a
    //                 timestamp), and the optional name field tells them apart.
    superuser_ids:     ['Z_21121989', 'CHAIN_2026'],

    allow_manual_id:   true,   // false = URL parameter only
    collect_id:        true,
    collect_name:      true,
    collect_email:     true,
  },

  // -----------------------------------------------------------------------
  // Separate DataPipe target for name and email. Kept apart from the
  // response data on purpose — see the note above.
  //
  // On the DataPipe dashboard for THIS experiment:
  //   - switch "Enable data collection" ON
  //   - under Validation, set Required Fields to `participant_id`
  //     (NOT `trial_type`: this file is not written by jsPsych and has no
  //     trial_type column, so that requirement would reject every upload)
  // -----------------------------------------------------------------------
  contact_datapipe: {
    experiment_id: 'T2jZJusQxUGv',
    osf_project:   'q3hwn',   // recorded for reference only
    osf_component: 'qt9x8',   // recorded for reference only
  },

  // -----------------------------------------------------------------------
  // Researcher contact, shown on the final screen ("If you have any
  // questions...") and on the error screen if the upload fails.
  //
  // CHANGE THIS before recruiting. validate.js warns while it still holds
  // the placeholder.
  // -----------------------------------------------------------------------
  researcher_contact: 'CHANGE_ME@example.com',

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
  // trial_list.json, so assignment is deterministic and reproducible. The
  // trial list carries no expected response (no correct_response column):
  // the target lives here, with the instruction text.
  //
  // Ten targets for the ten catch rows of the v4 list: 5 up, 5 down, in a
  // fixed mixed order with never more than two identical targets in a row,
  // so the target cannot be learnt. validate.js checks the length equals
  // the number of catch rows, the balance, and the run length.
  //
  // Chance of passing by mashing arrows is 1/4 per trial, so P(7+ of 10)
  // is under 0.4%. Mashing left/right — the most likely disengaged
  // behaviour — fails every time.
  //
  // `mode` is what this code implements: 'no_images'. Every catch row of
  // trial_list.json carries a `catch_mode`; validate.js refuses to start if
  // any row expects a different kind of catch trial.
  // -----------------------------------------------------------------------
  catch_trials: {
    mode:       'no_images',
    sequence:   ['ArrowUp',   'ArrowDown', 'ArrowDown', 'ArrowUp',   'ArrowDown',
                 'ArrowUp',   'ArrowUp',   'ArrowDown', 'ArrowUp',   'ArrowDown'],
    lockout_ms: 750,   // keys dead for this long, so a carried-over
                       // reflex press from the previous trial cannot land
  },

  // -----------------------------------------------------------------------
  // Display.
  //
  // image_px is the on-screen size of each stimulus. The real images are
  // 512 x 512, so 512 means 1:1 with no resampling. min_width/min_height
  // are derived from it, so the two cannot drift apart.
  //
  // THE WINDOW CHECK IS A HARD STOP. Right after full screen, the real trial
  // layout — the question in the participant's language and group, above
  // two image_px panels — is drawn invisibly and measured. If any part of
  // it would be cut off, by width or by height, the session stops with a
  // message asking the participant to enlarge the window or use a larger
  // screen and reopen the link. There is no "continue anyway". Nothing is
  // uploaded for a stopped session (the check runs before the ID screen).
  //
  // min_width/min_height are only the RECOMMENDED size, recorded as
  // viewport_ok; the stop is decided by the measurement, not by them.
  // -----------------------------------------------------------------------
  display: {
    image_px:      512,
    gap_px:        32,
    min_width:     512 * 2 + 32 + 64,   // 1120, recommended
    min_height:    512 + 168,           // 680, recommended

    // false (default, and required for the registered design): every
    //   participant sees panels at exactly image_px. Removes
    //   between-participant variation in the physical size of the
    //   manipulation. A window too small to show them whole is stopped by
    //   the window check above.
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
  // Each set lives in its own folder under sets_dir and holds everything
  // it needs:
  //
  //     data/sets/<set>/trial_list.json
  //     data/sets/<set>/preload.json
  //     data/sets/<set>/stimuli/*.png
  //     data/sets/<set>/grid/{grid_trials.json, preload.json, stimuli/}
  //
  // `v4` is the preregistered set: 211 pair trials (180 analysed) and the
  // two-block grid package. Its folders are FROZEN copies of
  // drl2drv_updated/data_trials — verified against the frozen checksums —
  // and must never be edited, re-encoded, resized or renamed.
  //
  // The older sets (lum_p05, contrast_local) are left on disk for reference
  // but are no longer in available_sets: their formats are not supported by
  // the current loader and validator, and ?set= cannot select them.
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
    set:            'v4',
    available_sets: ['v4'],
    sets_dir:       'data/sets/',
  },

  // -----------------------------------------------------------------------
  // Which blocks run, in SESSION ORDER. Each can be switched off
  // independently, so a single phase can be tested without sitting through
  // the whole session; dev.html lists every switch.
  //
  // The session, the same for both groups:
  //    1. consent                     blocks.consent
  //    2. full screen + window check  calibration.fullscreen / screen_check
  //    3. participant ID              participant.collect_*
  //    4. brightness                  calibration.brightness
  //    5. gamma matching              calibration.gamma
  //    6. anchoring                   blocks.anchoring
  //    7. practice                    blocks.practice
  //    8. pair trials                 blocks.main
  //    9. episode grid block          blocks.grid_episode
  //   10. word ratings                blocks.words
  //   11. normal-appearance grid      blocks.grid_normal
  //   12. state items (optional)      blocks.state
  //   13. save, 14. completion screen
  //
  // CONSENT IS REQUIRED for a real session. index.html refuses to start
  // with blocks.consent off (validate.js); only dev.html can run without it.
  // -----------------------------------------------------------------------
  blocks: {
    consent:      true,   // first screen; declining ends the session with
                          // nothing uploaded
    size_check:   false,  // developer screen showing the measured panel
                          // size. Not for participants; the 'Screen & size
                          // check' dev preset switches it on.
    anchoring:    true,   // bring one episode to mind (participants) /
                          // what derealization is (controls)
    practice:     true,
    main:         true,
    mock:         false,  // six placeholder trials; superseded by 'main'
    grid_episode: true,   // grid block after the pair trials, with "None
                          // of these"
    grid_none_followup: true,  // after a screen answered "None of these":
                          // "Which comes closest?" with five clickable,
                          // position-based options (no visual words), not
                          // required. Only where the screen has a "None"
                          // button (the episode block).
    words:        true,   // word ratings — AFTER the episode grid
    grid_normal:  true,   // grid block after the word ratings, no "None"
    state:        true,   // four state items at the end (optional block)
  },

  // -----------------------------------------------------------------------
  // Anchoring screen: the questions about the episode, shown to the
  // PARTICIPANT group only (controls have no episode to describe). Each can
  // be switched off; with all four off the screen shows only the text.
  // None of them is required — Continue always works, and an unanswered
  // question is recorded empty.
  //
  //   when      When was it?               short text field + example hint
  //   duration  How long did it last?      short text field + example hint
  //   where     Where were you?            short text field + example hint
  //   clarity   How clearly do you remember it?   0-6 + Prefer not to say
  //
  // Columns on the anchoring row: episode_when, episode_duration,
  // episode_where (the typed text), episode_clarity. See
  // DATA_DICTIONARY.md §6.
  // -----------------------------------------------------------------------
  anchoring: {
    questions: {
      when:     true,
      duration: true,
      where:    true,
      clarity:  true,
    },
  },

  // -----------------------------------------------------------------------
  // Grid block layout. The cell size is computed from the window (six
  // columns of 512 px fit no laptop), once per block, for the widest screen
  // in the package:
  //
  //   byWidth  = (innerWidth  - page_side_px - (cols-1)*col_gap_px) / cols
  //              - cell_chrome_px
  //   byHeight = (innerHeight - chrome_px    - (rows-1)*row_gap_px) / rows
  //   cell     = max(min_cell_px, floor(min(byWidth, byHeight, max_cell_px)))
  //
  // These are the constants of interface_spec.md, and the grid package
  // ships them as `layout`. validate.js refuses to start if the two differ.
  // The computed size is recorded on every grid row as cell_px.
  // -----------------------------------------------------------------------
  grid: {
    max_cell_px:    240,
    min_cell_px:    100,
    row_gap_px:     6,    // between scenes within a column
    col_gap_px:     22,   // between columns — wider, so columns read as units
    chrome_px:      190,  // vertical space kept for question and buttons
    page_side_px:   48,   // horizontal margin of the page
    cell_chrome_px: 14,   // per column: 2 x (3 px border + 4 px padding)
  },

  // -----------------------------------------------------------------------
  // Limits. For quick testing only — leave at 0 for real sessions.
  //
  // max_trials truncates the main block to its first N trials. Useful for
  // confirming an upload reaches OSF without sitting through 205 trials.
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
    screen_check: true,   // window check: HARD STOP if the trial layout
                          // would be cut off (see display, above)

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
    break_every: 41,   // break after every N main trials; 0 disables.
                       // 205 main trials / 41 = 5 equal parts, 4 breaks.

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
