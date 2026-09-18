/* =========================================================================
 * pairs.js — the image-pair trials, driven entirely by trial_list.json.
 *
 * Structure:
 *   preload gate  -> waits for the 227 images (usually instant, since
 *                    downloading started in the background earlier)
 *   practice intro
 *   6 practice trials          (trial_type 'practice', analysed false)
 *   practice end
 *   137 main trials            (everything else, in file order)
 *     with a break every CONFIG.timing.break_every trials
 *
 * Trial order, pairing, left/right assignment and the predictor values all
 * come from the file. Nothing is randomised here: randomisation happened in
 * build_trials.py, where it was checked by simulation.
 *
 * Each image trial is three nodes: fixation, the pair, a blank. Only the
 * pair is recorded as block 'pairs'.
 *
 * Two trial types are built differently:
 *
 *   CATCH trials show no images at all — see _catchNodes(). This is what
 *   makes the check work; with pictures on screen the trained "pick a side"
 *   response fires before anything is read.
 *
 *   The first few PRACTICE trials are followed by a feedback screen that
 *   outlines the chosen image. It confirms the key mapping visually and
 *   says nothing about why the choice was made.
 * ========================================================================= */

var PairsPhase = (function () {

  // Rendered size of the panels on the most recent trial, captured in
  // on_load. Confirms per trial that the images displayed at image_px.
  var _lastPanel = null;

  // -----------------------------------------------------------------------
  // The prompt for a trial. Catch trials name a key; everything else gets
  // the main question. Both come from the text file, never from the
  // `instruction` column of trial_list.json — see loader.js.
  // -----------------------------------------------------------------------
  function _prompt() {
    return Loader.text().prompt.main;
  }

  // -----------------------------------------------------------------------
  // Catch trials.
  //
  // No images. Large text directly on the background — no card — so the
  // screen resembles neither a trial nor a break. The target is UP or DOWN,
  // taken from CONFIG.catch_trials.sequence in order, so a reflexive
  // left/right press fails immediately.
  //
  // Built as TWO nodes so the lockout needs no custom key handling:
  //   1. the same screen with choices 'NO_KEYS' and a fixed duration, so
  //      any press carried over from the previous trial is discarded;
  //   2. the live screen with choices 'ALL_KEYS', so a WRONG key actually
  //      registers and fails. With a restricted choices list jsPsych would
  //      ignore the wrong key and wait, and the trial could only ever end
  //      in success.
  //
  // No trial_duration on the live node: unlimited time, one press.
  // -----------------------------------------------------------------------
  var _catchIndex = 0;

  function _catchKeyFor(index) {
    var seq = CONFIG.catch_trials.sequence;
    return seq[index % seq.length];
  }

  function _catchHTML(targetKey) {
    var T = Loader.text();
    var isUp = (String(targetKey).toLowerCase() === 'arrowup');
    var name  = isUp ? T.catch.key_up : T.catch.key_down;
    var arrow = isUp ? '\u2191' : '\u2193';
    return (
      '<div class="catch-screen">' +
      '<div class="catch-lead">' + T.catch.lead + '</div>' +
      '<div class="catch-instruction">' +
      T.catch.instruction.replace('{KEYNAME}', name) +
      '</div>' +
      '<div class="catch-arrow">' + arrow + '</div>' +
      '</div>'
    );
  }

  function _catchNodes(row) {
    var targetKey = _catchKeyFor(_catchIndex++);
    var html      = _catchHTML(targetKey);
    var base      = Record.pairTrialData(row);
    base.catch_key = targetKey;

    return [
      // 1. Lockout — identical screen, keys inert.
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: html,
        choices: 'NO_KEYS',
        trial_duration: CONFIG.catch_trials.lockout_ms,
        data: { block: 'catch_lockout' },
      },
      // 2. Live — any key ends the trial and is scored.
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: html,
        choices: 'ALL_KEYS',
        data: base,
        on_finish: function (data) { Record.finishCatchTrial(data); },
      },
    ];
  }

  // -----------------------------------------------------------------------
  // One image panel. Size is fixed at CONFIG.display.image_px for every
  // participant — see the note in experiment.css.
  // -----------------------------------------------------------------------
  function _panel(relativePath, chosen) {
    return (
      '<div class="stim-panel' + (chosen ? ' chosen' : '') + '" style="' +
      'width:'  + CONFIG.display.image_px + 'px;' +
      'height:' + CONFIG.display.image_px + 'px;">' +
      '<img src="' + Loader.imageURL(relativePath) + '" alt="">' +
      '</div>'
    );
  }

  // -----------------------------------------------------------------------
  // The three nodes making up one trial.
  // -----------------------------------------------------------------------
  function _trialNodes(row, feedbackIndex) {
    var nodes = [];

    // Catch trials have no fixation and no images.
    if (row.trial_type === 'catch') {
      return _catchNodes(row);
    }

    nodes.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<div class="fixation">+</div>',
      choices: 'NO_KEYS',
      trial_duration: CONFIG.timing.fixation_ms,
      data: { block: 'fixation' },
    });

    nodes.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus:
        '<div class="stim-prompt">' + _prompt() + '</div>' +
        '<div class="stim-row" style="gap:' + CONFIG.display.gap_px + 'px;">' +
        _panel(row.left_path) + _panel(row.right_path) +
        '</div>',
      choices: [CONFIG.keys.left, CONFIG.keys.right],
      // No trial_duration: responses are self-paced, with no timeout.
      data: Record.pairTrialData(row),
      on_load: function () {
        var el = document.querySelector('.stim-panel');
        if (el) {
          var r = el.getBoundingClientRect();
          _lastPanel = Math.round(r.width) + 'x' + Math.round(r.height);
        }
      },
      on_finish: function (data) {
        data.panel_rendered_px = _lastPanel;
        Record.finishPairTrial(data);
      },
    });

    // Practice feedback: outline the chosen image. Shown on the first N
    // practice trials only, so the later practice trials match the main
    // block exactly.
    if (feedbackIndex !== undefined &&
        feedbackIndex < CONFIG.timing.practice_feedback_trials) {
      nodes.push(_feedbackNode(row, feedbackIndex === 0));
    }

    nodes.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '',
      choices: 'NO_KEYS',
      trial_duration: CONFIG.timing.blank_ms,
      data: { block: 'blank' },
    });

    return nodes;
  }

  // -----------------------------------------------------------------------
  // Practice feedback. Re-renders the same pair with the chosen image
  // outlined, for a fixed duration.
  //
  // It says nothing about WHY the participant chose what they chose.
  // Confirming a reason ("because you remember it looking that way") would
  // endorse the choice as meaningful and invite consistency-seeking on
  // later trials, and would supply an interpretation the participant may
  // not have had. The outline teaches the key mapping and nothing else.
  //
  // Being visual, it also needs no translation.
  // -----------------------------------------------------------------------
  function _feedbackNode(row, isFirst) {
    var T = Loader.text();
    return {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: function () {
        var last = jsPsych.data.get().filter({ block: 'pairs' }).last(1).values()[0];
        var side = last ? last.response_side : null;
        return (
          '<div class="stim-prompt">' +
          (isFirst ? T.practice.feedback_first : '&nbsp;') +
          '</div>' +
          '<div class="stim-row" style="gap:' + CONFIG.display.gap_px + 'px;">' +
          _panel(row.left_path,  side === 'left')  +
          _panel(row.right_path, side === 'right') +
          '</div>'
        );
      },
      choices: 'NO_KEYS',
      trial_duration: CONFIG.timing.practice_feedback_ms,
      data: { block: 'practice_feedback' },
    };
  }

  // -----------------------------------------------------------------------
  // A text screen advanced with SPACE.
  // -----------------------------------------------------------------------
  function _screen(title, body, hint, blockName) {
    return {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<div class="card"><h2>' + title + '</h2>' + body +
                '<p class="hint">' + hint + '</p></div>',
      choices: [' '],
      data: { block: blockName },
    };
  }

  // -----------------------------------------------------------------------
  // The preload gate.
  //
  // Downloading started in the background earlier (see main.js), so by the
  // time this runs the files are usually cached and it flashes past. If the
  // connection is slow the participant waits here — but by then they have
  // already invested several minutes and are far more likely to stay than
  // they would have been at a progress bar on the very first screen.
  // -----------------------------------------------------------------------
  function _preloadGate(images) {
    var T = Loader.text();
    return {
      type: jsPsychPreload,
      images: images || Loader.preloadURLs(),
      message: T.preload.message,
      show_progress_bar: true,
      continue_after_error: false,
      error_message: T.preload.error,
      max_load_time: 300000,          // 5 minutes
      data: { block: 'preload' },
      on_error: function (file) {
        console.error('[Preload] Failed to load: ' + file);
      },
      on_finish: function (data) {
        if (CONFIG.debug) {
          console.log('[Preload] success: ' + data.success +
                      ' | failed files: ' + (data.failed_images || []).length);
        }
      },
    };
  }

  // -----------------------------------------------------------------------
  // Build the whole phase.
  // -----------------------------------------------------------------------
  function buildNodes(jsPsych) {
    var T        = Loader.text();
    var all      = Loader.trials();
    var practice = all.filter(function (t) { return t.trial_type === 'practice'; });
    var main     = all.filter(function (t) { return t.trial_type !== 'practice'; });
    var nodes    = [];

    // Testing limits. Truncation drops catch and consistency trials, so a
    // limited session is never valid data — main.js stamps is_dev on it.
    var lim = CONFIG.limits || {};
    if (lim.max_practice > 0) practice = practice.slice(0, lim.max_practice);
    if (lim.max_trials   > 0) main     = main.slice(0, lim.max_trials);

    // Preload only the images this session will actually show — which
    // depends on BOTH the block flags and the trial limits. On a full
    // session that is all of them; on a truncated test it is a handful, so
    // the upload can be checked without waiting for 63 MB.
    var willShow = [];
    if (CONFIG.blocks.practice) willShow = willShow.concat(practice);
    if (CONFIG.blocks.main)     willShow = willShow.concat(main);

    var needed = {};
    willShow.forEach(function (t) {
      if (t.trial_type === 'catch') return;      // catch trials show no images
      needed[Loader.imageURL(t.left_path)]  = true;
      needed[Loader.imageURL(t.right_path)] = true;
    });

    // No images to wait for means no gate: skip it entirely rather than
    // showing a progress bar that completes instantly.
    var images = Object.keys(needed);
    if (images.length) nodes.push(_preloadGate(images));

    // --- Practice --------------------------------------------------------
    if (CONFIG.blocks.practice && practice.length) {
      nodes.push(_screen(T.practice.title, T.practice.body,
                         T.practice.continue_hint, 'practice_intro'));
      practice.forEach(function (row, i) {
        nodes = nodes.concat(_trialNodes(row, i));
      });
      nodes.push(_screen(T.practice.end_title, T.practice.end_body,
                         T.practice.end_hint, 'practice_end'));
    }

    // --- Main block ------------------------------------------------------
    if (CONFIG.blocks.main) {
      var every = CONFIG.timing.break_every;
      main.forEach(function (row, i) {
        // Break before this trial, but never immediately after the practice
        // end screen and never as the final screen of the block.
        if (every > 0 && i > 0 && i % every === 0) {
          nodes.push(_screen(
            T.brk.title,
            T.brk.body.replace('{DONE}', String(i))
                      .replace('{TOTAL}', String(main.length)),
            T.brk.hint,
            'break'
          ));
        }
        nodes = nodes.concat(_trialNodes(row));
      });
    }

    return nodes;
  }

  return { buildNodes: buildNodes };
})();
