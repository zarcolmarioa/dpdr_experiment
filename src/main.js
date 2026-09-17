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

/* global CONFIG, ParticipantID, Record, MockPhase,
          initJsPsych, jsPsychHtmlKeyboardResponse, jsPsychSurveyText,
          jsPsychCallFunction, jsPsychPipe, jsPsychPavlovia */

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

  timeline = timeline.concat(_buildPavloviaInit());
  timeline = timeline.concat(ParticipantID.buildNodes(jsPsych));

  // Stamp the session properties once the ID is known.
  timeline.push({
    type: jsPsychCallFunction,
    func: function () {
      Record.stampSessionStart(
        jsPsych, ParticipantID.get(), ParticipantID.isSuperuser()
      );
    },
  });

  timeline = timeline.concat(MockPhase.buildNodes(jsPsych));
  timeline = timeline.concat(_buildSaveNodes());
  timeline.push(_buildCompletionNode());

  jsPsych.run(timeline);
}

// Entry point. index.html loads this file last, with `defer`, so the DOM
// exists by the time this runs.
runExperiment();
