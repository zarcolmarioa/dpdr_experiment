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
 * Each trial is three nodes: fixation, the pair, a blank. Only the pair is
 * recorded as block 'pairs'.
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
  function _prompt(row) {
    var T = Loader.text();
    if (row.trial_type === 'catch') {
      var isRight = (row.correct_response === 'right');
      return T.prompt.catch
        .replace('{SIDE}',  isRight ? T.prompt.side_right : T.prompt.side_left)
        .replace('{ARROW}', isRight ? '\u2192' : '\u2190');
    }
    return T.prompt.main;
  }

  // -----------------------------------------------------------------------
  // One image panel. Size is fixed at CONFIG.display.image_px for every
  // participant — see the note in experiment.css.
  // -----------------------------------------------------------------------
  function _panel(relativePath) {
    return (
      '<div class="stim-panel" style="' +
      'width:'  + CONFIG.display.image_px + 'px;' +
      'height:' + CONFIG.display.image_px + 'px;">' +
      '<img src="' + Loader.imageURL(relativePath) + '" alt="">' +
      '</div>'
    );
  }

  // -----------------------------------------------------------------------
  // The three nodes making up one trial.
  // -----------------------------------------------------------------------
  function _trialNodes(row) {
    var nodes = [];

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
        '<div class="stim-prompt">' + _prompt(row) + '</div>' +
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
  function _preloadGate() {
    var T = Loader.text();
    return {
      type: jsPsychPreload,
      images: Loader.preloadURLs(),
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

    nodes.push(_preloadGate());

    // --- Practice --------------------------------------------------------
    if (CONFIG.blocks.practice && practice.length) {
      nodes.push(_screen(T.practice.title, T.practice.body,
                         T.practice.continue_hint, 'practice_intro'));
      practice.forEach(function (row) {
        nodes = nodes.concat(_trialNodes(row));
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
