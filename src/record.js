/* =========================================================================
 * record.js — builds what ends up in the output file.
 *
 * Two jobs:
 *   1. Stamp session-level properties onto every row.
 *   2. Build the per-trial row for a stimulus pair.
 *
 * NAME COLLISION, IMPORTANT
 * -------------------------
 * jsPsych writes its own column called `trial_type`, holding the PLUGIN
 * name ('html-keyboard-response', ...). trial_list.json ALSO has a column
 * called `trial_type`, holding the DESIGN label ('sat_only', 'conflict',
 * 'catch', ...).
 *
 * If both are written, one silently overwrites the other and a column is
 * lost with no error. So the design label is renamed to `pair_type` on
 * output. trial_list.json itself is never modified.
 *
 * KEY CASE, IMPORTANT
 * -------------------
 * jsPsych 7 returns key names LOWERCASED: 'arrowleft', not 'ArrowLeft'.
 * CONFIG.keys uses the standard KeyboardEvent spelling, so every comparison
 * between a recorded key and a configured key must be case-insensitive.
 * Comparing them directly leaves response_side null on EVERY trial, which
 * is silent because the raw `response` column still looks correct.
 * ========================================================================= */

var Record = (function () {

  // -----------------------------------------------------------------------
  // Session-level properties, added to every row by jsPsych.
  // Called once at the start, then again at the end for the closing stamps.
  // -----------------------------------------------------------------------
  function stampSessionStart(jsPsych, participantId, isSuperuser) {
    jsPsych.data.addProperties({
      participant_id:       participantId,
      is_test:              isSuperuser,
      experiment_name:      CONFIG.experiment.name,
      experiment_version:   CONFIG.experiment.version,
      platform:             CONFIG.platform,
      language:             Loader.language(),

      // Which stimulus set this session saw. Essential when more than one
      // set is in use: without it the pooled data cannot be split by arm.
      stimulus_set:         Loader.stimulusSet(),
      session_start_time:   new Date().toISOString(),

      // Display context — needed to interpret sessions run on small screens,
      // where the images are scaled below CONFIG.display.image_px.
      screen_width:         window.screen.width,
      screen_height:        window.screen.height,
      viewport_width:       window.innerWidth,
      viewport_height:      window.innerHeight,
      device_pixel_ratio:   window.devicePixelRatio,
      user_agent:           navigator.userAgent,
    });
  }

  function stampSessionEnd(jsPsych, extra) {
    var props = { session_end_time: new Date().toISOString() };
    if (extra) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) props[k] = extra[k];
      }
    }
    jsPsych.data.addProperties(props);
  }

  // -----------------------------------------------------------------------
  // Map a recorded key onto a side.
  //
  // BOTH sides of the comparison are lowercased, so this keeps working
  // whichever spelling jsPsych returns and whichever spelling is written
  // in CONFIG.keys. See the KEY CASE note in the header.
  // -----------------------------------------------------------------------
  function keyToSide(key) {
    if (key === null || key === undefined) return null;
    var k = String(key).toLowerCase();
    if (k === String(CONFIG.keys.left).toLowerCase())  return 'left';
    if (k === String(CONFIG.keys.right).toLowerCase()) return 'right';
    return null;
  }

  // -----------------------------------------------------------------------
  // Per-trial data for a stimulus pair.
  //
  // `row` is one entry from trial_list.json. The returned object is attached
  // to the jsPsych trial via its `data` parameter, so these become columns.
  //
  // Note what is NOT computed here: whether the participant "chose A".
  // Only the raw side is stored. Mapping side -> A/B via a_is_left happens
  // in the analysis script, where it can be checked.
  // -----------------------------------------------------------------------
  function pairTrialData(row) {
    return {
      block:             'pairs',
      trial_index_list:  row.trial,          // index within trial_list.json
      pair_type:         row.trial_type,     // renamed — see header
      analysed:          row.analysed,
      scene_id:          row.scene_id,
      category:          row.category,
      left_path:         row.left_path,
      right_path:        row.right_path,
      a_is_left:         row.a_is_left,
      d_sat:             row.d_sat,
      d_fog:             row.d_fog,
      z_sat:             row.z_sat,
      z_fog:             row.z_fog,
      mag_bin:           row.mag_bin,
      correct_response:  row.correct_response,   // catch trials only
      repeat_of:         row.repeat_of,          // consistency trials only
      display_px:        CONFIG.display.image_px,
    };
  }

  // -----------------------------------------------------------------------
  // Runs after a pair trial finishes. Converts the pressed key into a side,
  // and scores catch trials.
  //
  // There is no response timeout in this experiment, so `no_response` should
  // never be true. It is recorded anyway: if it ever appears, key handling
  // has gone wrong and those rows need inspecting rather than silently
  // entering the analysis as missing data.
  // -----------------------------------------------------------------------
  function finishPairTrial(data) {
    data.response_key  = data.response;             // raw, as jsPsych gave it
    data.response_side = keyToSide(data.response);
    data.no_response   = (data.response_side === null);
  }

  // -----------------------------------------------------------------------
  // Runs after a catch trial. Scores the single keypress against the target.
  //
  // The `correct_response` column of trial_list.json is NOT used: it holds
  // 'right' on all six catch trials, which would be learnable, and catch
  // trials no longer involve sides at all. The target comes from
  // CONFIG.catch_trials.sequence instead. That is defensible because the
  // catch key is an attention probe, not a design factor — it enters no
  // analysis — whereas trial pairing does and stays in the data file.
  //
  // Both the target and the response are recorded. HOW someone failed is
  // informative: a left or right press means the trained side-choosing
  // response fired without reading, while a scattered key means general
  // disengagement.
  // -----------------------------------------------------------------------
  function finishCatchTrial(data) {
    var pressed = (data.response === null || data.response === undefined)
      ? null : String(data.response).toLowerCase();
    var target  = String(data.catch_key).toLowerCase();

    data.response_key = data.response;
    data.catch_pass   = (pressed === target);
    data.no_response  = (pressed === null);

    // Did the participant press a response key instead of reading?
    data.catch_pressed_side = (keyToSide(data.response) !== null);
  }

  // -----------------------------------------------------------------------
  // Filename for the uploaded file:
  //     <participant_id>_<stimulus_set>_<timestamp>.csv
  //
  // The set appears in the name as well as in the data. That redundancy is
  // deliberate: the OSF component can be sorted by arm without opening
  // anything, and if a file is ever truncated or fails to parse, the one
  // piece of metadata that could not be recovered is still readable.
  //
  // Colons and dots are stripped so the name is safe on every filesystem.
  // -----------------------------------------------------------------------
  function sessionFilename(participantId) {
    var stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    var set   = Loader.stimulusSet();
    return participantId + '_' + set + '_' + stamp + '.csv';
  }

  return {
    stampSessionStart: stampSessionStart,
    stampSessionEnd:   stampSessionEnd,
    keyToSide:         keyToSide,
    pairTrialData:     pairTrialData,
    finishPairTrial:   finishPairTrial,
    finishCatchTrial:  finishCatchTrial,
    sessionFilename:   sessionFilename,
  };
})();
