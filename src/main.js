/* =========================================================================
 * main.js — assembles the timeline and runs it.
 *
 * Structure of a session (smoke test version):
 *   1. participant ID
 *   2. mock trials
 *   3. save  (DataPipe / Pavlovia / local download)
 *   4. completion screen, showing whether the upload succeeded
 *
 * The full experiment adds consent, calibration, word ratings, preload,
 * the real pair trials, the grid block and the final questions between
 * steps 1 and 3. Nothing about the save path changes.
 * ========================================================================= */

/* global CONFIG, ParticipantID, Record, MockPhase, PairsPhase, ScreenCheck,
          BrightnessConfirmation, GammaCalibration,
          Loader, Validate, DevMenu, TEXT_EN, TEXT_JA,
          initJsPsych, jsPsychHtmlKeyboardResponse, jsPsychSurveyText,
          jsPsychCallFunction, jsPsychFullscreen, jsPsychPreload,
          jsPsychHtmlButtonResponse, jsPsychPipe, jsPsychPavlovia */

var jsPsych = initJsPsych({
  on_finish: function () {
    // In local mode nothing is uploaded, so the file is downloaded instead.
    if (CONFIG.platform === 'local') {
      var filename = Record.sessionFilename(ParticipantID.get() || 'NOID');
      jsPsych.data.get().localSave('csv', filename);
    }
    if (CONFIG.debug) {
      console.log('[Data] Final dataset:');
      console.log(jsPsych.data.get().csv());
    }
  },
});

// Holds whatever DataPipe reports back, so the completion screen can show it.
var UPLOAD_RESULT = { attempted: false, success: null, detail: '' };

// ---------------------------------------------------------------------------
// Pavlovia init node — must be the first thing in the timeline.
// ---------------------------------------------------------------------------
function _buildPavloviaInit() {
  if (CONFIG.platform !== 'pavlovia') return [];
  return [{
    type: jsPsychPavlovia,
    command: 'init',
    setPavloviaInfo: function (info) {
      console.log('[Pavlovia] Initialised:', info);
    },
  }];
}

// ---------------------------------------------------------------------------
// Save nodes.
//
// 'github'   -> DataPipe upload to the OSF component
// 'pavlovia' -> Pavlovia finish command
// 'local'    -> nothing here; on_finish above downloads the CSV
// ---------------------------------------------------------------------------
function _buildSaveNodes() {
  var nodes = [];

  // Closing stamps, applied to every row before the data is serialised.
  nodes.push({
    type: jsPsychCallFunction,
    func: function () {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
      Record.stampSessionEnd(jsPsych, {
        viewport_width_end:  window.innerWidth,
        viewport_height_end: window.innerHeight,
      });
    },
  });

  if (CONFIG.platform === 'github') {
    nodes.push({
      type:          jsPsychPipe,
      action:        'save',
      experiment_id: CONFIG.datapipe.experiment_id,
      filename:      function () {
        return Record.sessionFilename(ParticipantID.get() || 'NOID');
      },
      data_string:   function () { return jsPsych.data.get().csv(); },
      on_finish: function (data) {
        // The exact response shape depends on the plugin version, so the
        // whole thing is captured rather than one assumed field.
        UPLOAD_RESULT.attempted = true;
        UPLOAD_RESULT.success   = (data.success === true);
        try {
          UPLOAD_RESULT.detail = JSON.stringify(data);
        } catch (e) {
          UPLOAD_RESULT.detail = String(data);
        }
        console.log('[DataPipe] Response:', data);
      },
    });

  } else if (CONFIG.platform === 'pavlovia') {
    nodes.push({
      type: jsPsychPavlovia,
      command: 'finish',
      dataFilter: function (data) { return data; },
      completedCallback: function () {
        UPLOAD_RESULT.attempted = true;
        UPLOAD_RESULT.success = true;
        console.log('[Pavlovia] Data submitted.');
      },
    });
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// Completion screen. In debug mode it reports the upload outcome, which is
// the whole point of the smoke test: DataPipe failures are otherwise silent.
// ---------------------------------------------------------------------------
function _buildCompletionNode() {
  return {
    type: jsPsychHtmlKeyboardResponse,
    choices: 'NO_KEYS',
    stimulus: function () {
      var html = '<div class="card"><h2>Thank you</h2>' +
                 '<p>The session is complete. You may close this page.</p>';

      if (CONFIG.debug) {
        html += '<hr><div class="debug-box">';
        html += '<p><b>Debug — not shown to participants</b></p>';
        html += '<p>Platform: <code>' + CONFIG.platform + '</code></p>';
        html += '<p>Participant: <code>' +
                (ParticipantID.get() || 'none') + '</code>' +
                (ParticipantID.isSuperuser() ? ' (test session)' : '') + '</p>';

        if (CONFIG.platform === 'local') {
          html += '<p>Local mode — CSV downloaded, nothing uploaded.</p>';
        } else if (!UPLOAD_RESULT.attempted) {
          html += '<p class="fail">No upload was attempted.</p>';
        } else if (UPLOAD_RESULT.success) {
          html += '<p class="ok">Upload reported SUCCESS.</p>';
        } else {
          html += '<p class="fail">Upload reported FAILURE. Check that ' +
                  '&ldquo;Enable data collection&rdquo; is switched on for ' +
                  'experiment <code>' + CONFIG.datapipe.experiment_id +
                  '</code> on the DataPipe dashboard.</p>';
        }
        if (UPLOAD_RESULT.detail) {
          html += '<pre>' + UPLOAD_RESULT.detail + '</pre>';
        }
        html += '</div>';
      }

      return html + '</div>';
    },
  };
}

// ---------------------------------------------------------------------------
// Build and run.
// ---------------------------------------------------------------------------
function runExperiment() {
  var timeline = [];

  // Panels are a fixed size unless scaling is explicitly permitted.
  if (CONFIG.display.allow_scaling) {
    document.body.classList.add('allow-scaling');
  }

  // Arrow keys scroll the page by default. There is nothing to scroll in
  // fullscreen, but suppressing it removes any chance of the screen
  // shifting under the participant mid-trial. Text fields are exempt so
  // the ID entry still behaves normally.
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].indexOf(e.key) !== -1) {
      e.preventDefault();
    }
  }, false);

  timeline = timeline.concat(_buildPavloviaInit());
  timeline = timeline.concat(ParticipantID.buildNodes(jsPsych));

  // Stamp the session properties once the ID is known.
  timeline.push({
    type: jsPsychCallFunction,
    func: function () {
      Record.stampSessionStart(
        jsPsych, ParticipantID.get(), ParticipantID.isSuperuser()
      );
      // Mark anything started from dev.html, or run with a trial limit, so
      // it can never be mistaken for a real session.
      jsPsych.data.addProperties({
        is_dev: !!window.DEV_MODE ||
                (CONFIG.limits && CONFIG.limits.max_trials > 0),
      });
    },
  });

  // Fullscreen, viewport gate, and the stimulus size check.
  timeline = timeline.concat(ScreenCheck.buildNodes(jsPsych));

  // Display calibration. Order matters: brightness first, because the gamma
  // match is judged by eye and a dimmed screen would bias it.
  if (CONFIG.calibration.brightness) {
    timeline = timeline.concat(BrightnessConfirmation.getNodes(jsPsych));
  }
  if (CONFIG.calibration.gamma) {
    timeline = timeline.concat(GammaCalibration.getNodes(jsPsych));
  }

  // Start downloading the stimuli in the BACKGROUND. This does not block:
  // the participant carries on with the screens above while the images
  // arrive. PairsPhase then gates on completion just before practice.
  timeline.push({
    type: jsPsychCallFunction,
    func: function () {
      try {
        jsPsych.pluginAPI.preloadImages(Loader.preloadURLs());
        if (CONFIG.debug) {
          console.log('[Preload] background download started (' +
                      Loader.preloadURLs().length + ' images).');
        }
      } catch (e) {
        console.warn('[Preload] background start failed; the gate will ' +
                     'download them instead.', e);
      }
    },
  });

  if (CONFIG.blocks.mock) {
    timeline = timeline.concat(MockPhase.buildNodes(jsPsych));
  } else {
    timeline = timeline.concat(PairsPhase.buildNodes(jsPsych));
  }
  timeline = timeline.concat(_buildSaveNodes());
  timeline.push(_buildCompletionNode());

  jsPsych.run(timeline);
}

// ---------------------------------------------------------------------------
// Fatal error screen — shown when the data files cannot be loaded at all.
// ---------------------------------------------------------------------------
function _showFatal(message) {
  var T = (typeof TEXT_EN !== 'undefined') ? TEXT_EN : null;
  var title = T ? T.error.title : 'Something went wrong';
  var body  = T ? T.error.body  : '<p>The study could not start.</p>';
  var html  = '<div class="card"><h2>' + title + '</h2>' + body;
  if (CONFIG.debug && message) {
    html += '<div class="debug-box"><pre>' + message + '</pre></div>';
  }
  html += '</div>';
  document.body.innerHTML =
    '<div class="jspsych-display-element"><div>' + html + '</div></div>';
  console.error('[Fatal] ' + message);
}

// ---------------------------------------------------------------------------
// Entry point.
//
// Data files are loaded and validated BEFORE the timeline is built, so a
// broken trial list stops the session at the first screen rather than
// producing grey boxes partway through.
// ---------------------------------------------------------------------------
Loader.loadAll()
  .then(function (data) {
    var result = Validate.run(data);
    if (CONFIG.debug) Validate.report(result);

    if (!result.ok) {
      if (CONFIG.debug) {
        document.body.innerHTML =
          '<div class="jspsych-display-element"><div>' +
          Validate.toHTML(result) + '</div></div>';
      } else {
        _showFatal('Validation failed: ' + result.errors.join(' | '));
      }
      return;
    }

    // dev.html sets window.DEV_MODE and loads dev-menu.js. index.html does
    // neither, so a participant can never reach the menu.
    if (window.DEV_MODE && typeof DevMenu !== 'undefined') {
      DevMenu.show(result.summary, runExperiment);
      return;
    }
    runExperiment();
  })
  .catch(function (err) {
    _showFatal(err && err.message ? err.message : String(err));
  });
