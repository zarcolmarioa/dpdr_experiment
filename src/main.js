/* =========================================================================
 * main.js — assembles the timeline and runs it.
 *
 * Before anything: the GROUP must come from the link (?group=participant
 * or ?group=control). Without a valid one the session does not start; it
 * shows the "incomplete link" screen and nothing is recorded.
 *
 * A session, the same for both groups (each step has its own switch in
 * config.js):
 *    1. consent                      phases/consent.js     blocks.consent
 *       "I do not agree" ends the session here, nothing uploaded.
 *    2. full screen + window check   calibration/screen-check.js
 *       a window too small for the trial layout STOPS the session here,
 *       before the ID screen, so nothing is uploaded.
 *    3. participant ID (+ optional name/email, uploaded separately)
 *       -> the background image download starts after this screen
 *    4. brightness confirmation      calibration/brightness-confirmation.js
 *    5. gamma matching               calibration/gamma.js
 *    6. anchoring                    phases/anchoring.js   blocks.anchoring
 *    7. practice                     phases/pairs.js       blocks.practice
 *    8. pair trials (205)            phases/pairs.js       blocks.main
 *    9. episode grid block           phases/grid.js        blocks.grid_episode
 *   10. word ratings                 phases/words.js       blocks.words
 *   11. normal-appearance grid block phases/grid.js        blocks.grid_normal
 *   12. state items (optional)       phases/state.js       blocks.state
 *   13. save  (DataPipe / Pavlovia / local download)
 *   14. completion screen, showing whether the upload succeeded
 *
 * Session-level stamps on every row: experiment, group, interview_date,
 * set_code (the grid set swap, drawn once here), display, consent_given,
 * participant_id / is_test, the target word ratings, the closing stamps.
 * ========================================================================= */

/* global CONFIG, ParticipantID, Record, MockPhase, PairsPhase, WordsPhase, GridPhase,
          ConsentPhase, AnchoringPhase, StatePhase,
          ScreenCheck, BrightnessConfirmation, GammaCalibration,
          Loader, Validate, DevMenu, TEXT_EN, TEXT_JA,
          initJsPsych, jsPsychHtmlKeyboardResponse, jsPsychSurveyText,
          jsPsychCallFunction, jsPsychFullscreen, jsPsychPreload,
          jsPsychHtmlButtonResponse, jsPsychSurveyLikert, jsPsychSurveyHtmlForm,
          jsPsychPipe, jsPsychPavlovia */

// NOTE: there is deliberately no on_finish here. The completion screen
// waits for the participant to close the page, so the timeline never
// finishes and an on_finish would never run. Local-mode saving is done by
// an explicit node in _buildSaveNodes() instead.
var jsPsych = initJsPsych({});

// Holds whatever DataPipe reports back, so the completion screen can show it.
// status: 'saved' | 'queued' | 'failed' — see ParticipantID.pipeStatus().
var UPLOAD_RESULT = { attempted: false, success: null, status: null, detail: '' };

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
// 'local'    -> a node below downloads the CSV to the participant's computer
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
        // Whether the separate name/email upload succeeded. null when
        // nothing was given, in local mode, or if it had not returned yet.
        contact_saved:       ParticipantID.contactSaved(),
      });
    },
  });

  // Local mode: nothing is uploaded, so the CSV is downloaded here, BEFORE
  // the completion screen (which never ends by itself).
  if (CONFIG.platform === 'local') {
    nodes.push({
      type: jsPsychCallFunction,
      func: function () {
        var filename = Record.sessionFilename(ParticipantID.get() || 'NOID');
        jsPsych.data.get().localSave('csv', filename);
        if (CONFIG.debug) console.log('[Data] local CSV saved: ' + filename);
      },
    });
  }

  if (CONFIG.platform === 'github') {
    nodes.push({
      type:          jsPsychPipe,
      action:        'save',
      experiment_id: CONFIG.datapipe.experiment_id,
      filename:      function () {
        return Record.sessionFilename(ParticipantID.get() || 'NOID');
      },
      data_string:   function () { return jsPsych.data.get().csv(); },
      // Shown while the file uploads. Replaces the plugin's English default
      // so the Japanese version is covered, and says plainly not to close
      // the page — closing it now is how a session gets lost.
      wait_message:  Loader.text().end.saving,
      on_finish: function (data) {
        // Do NOT trust data.success: the plugin reports a network failure
        // as success (it returns the Error object, which has no .error
        // field). Success is judged from DataPipe's own reply instead.
        UPLOAD_RESULT.attempted = true;
        UPLOAD_RESULT.status    = ParticipantID.pipeStatus(data.result);
        UPLOAD_RESULT.success   = (UPLOAD_RESULT.status !== 'failed');
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
// Completion screen.
//
// Three outcomes, all in the participant's language:
//
//   saved     — thanks, confirmation the responses were saved, contact line
//   failed    — the upload did not go through: a button downloads the CSV so
//               the participant can email it, rather than the session being
//               lost silently
//   local     — dev/local mode: same as saved (the CSV was downloaded)
//
// In debug mode a box underneath reports the upload details. Set
// CONFIG.debug = false before recruiting and participants never see it.
// ---------------------------------------------------------------------------
function _contactHTML() {
  var c = CONFIG.researcher_contact || '';
  if (/^[^@\s]+@[^@\s]+$/.test(c)) {
    return '<a href="mailto:' + c + '">' + c + '</a>';
  }
  return c;
}

// Debug wording for an upload outcome.
function _statusHTML(status) {
  if (status === 'saved')  return '<span class="ok">SAVED &mdash; on OSF now</span>';
  if (status === 'queued') return '<span class="ok">RECEIVED by DataPipe &mdash; ' +
                                  'OSF upload pending, DataPipe retries automatically. ' +
                                  'Check OSF in a few minutes.</span>';
  if (status === 'failed') return '<span class="fail">FAILED</span>';
  return '<code>not attempted</code> (no name/email given, or still running)';
}

function _buildCompletionNode() {
  return {
    type: jsPsychHtmlKeyboardResponse,
    choices: 'NO_KEYS',
    stimulus: function () {
      var E = Loader.text().end;
      var contact = _contactHTML();
      var failed = (CONFIG.platform !== 'local') &&
                   !(UPLOAD_RESULT.attempted && UPLOAD_RESULT.success);
      var html;

      if (failed) {
        html = '<div class="card end-card"><h2>' + E.fail_title + '</h2>' +
               E.fail_body.replace(/\{CONTACT\}/g, contact) +
               '<p><button id="end-download" class="calib-btn">' +
               E.fail_button + '</button></p>' +
               '<p id="end-download-done" class="hint" style="display:none">' +
               E.fail_done + '</p>';
      } else {
        html = '<div class="card end-card"><h2>' + E.title + '</h2>' +
               E.body +
               '<p class="hint">' +
               E.contact_line.replace(/\{CONTACT\}/g, contact) + '</p>';
      }

      if (CONFIG.debug) {
        html += '<hr><div class="debug-box">';
        html += '<p><b>Debug — not shown to participants</b></p>';
        html += '<p>Platform: <code>' + CONFIG.platform + '</code></p>';
        html += '<p>Participant: <code>' +
                (ParticipantID.get() || 'none') + '</code>' +
                (ParticipantID.isSuperuser() ? ' (test session)' : '') + '</p>';
        html += '<p>Contact upload (to ' + CONFIG.contact_datapipe.experiment_id +
                '): ' + _statusHTML(ParticipantID.contactStatus()) + '</p>';
        if (ParticipantID.contactReply()) {
          html += '<pre>' + ParticipantID.contactReply()
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre>';
        }

        if (CONFIG.platform === 'local') {
          html += '<p>Local mode — CSV downloaded, nothing uploaded.</p>';
        } else if (!UPLOAD_RESULT.attempted) {
          html += '<p class="fail">No upload was attempted.</p>';
        } else if (UPLOAD_RESULT.success) {
          html += '<p>Responses upload (to ' + CONFIG.datapipe.experiment_id +
                  '): ' + _statusHTML(UPLOAD_RESULT.status) + '</p>';
        } else {
          html += '<p class="fail">Upload FAILED. Check that ' +
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
    on_load: function () {
      var btn = document.getElementById('end-download');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var filename = Record.sessionFilename(ParticipantID.get() || 'NOID');
        jsPsych.data.get().localSave('csv', filename);
        var done = document.getElementById('end-download-done');
        if (done) done.style.display = 'block';
      });
    },
  };
}

// ---------------------------------------------------------------------------
// The grid set swap, drawn ONCE per session with p = .5 and used for the
// whole session (interface_spec.md: rule random_recorded). dev.html may fix
// it with ?set_code=0 or 1, for testing both arrangements; index.html never
// reads that parameter.
// ---------------------------------------------------------------------------
function _drawSetCode() {
  if (window.DEV_MODE) {
    var forced = new URLSearchParams(window.location.search).get('set_code');
    if (forced === '0' || forced === '1') return parseInt(forced, 10);
  }
  return (Math.random() < 0.5) ? 0 : 1;
}

// ---------------------------------------------------------------------------
// "Incomplete link": no valid ?group=. The same kind of message as a
// missing participant ID. Nothing is recorded or uploaded.
// ---------------------------------------------------------------------------
function _runIncompleteLink() {
  var L = Loader.text().link;
  console.warn('[Main] ?group= is missing or invalid (expected one of ' +
               CONFIG.groups.join(', ') + ') — session not started.');
  jsPsych.run([{
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class="card"><h2>' + L.missing_title + '</h2>' +
              L.missing_body + '</div>',
    choices: 'NO_KEYS',
    data: { block: 'link_incomplete' },
  }]);
}

// ---------------------------------------------------------------------------
// Start the image download in the BACKGROUND. Does not block: the
// participant carries on with calibration and the anchoring screen while
// the images arrive. Each block's preload gate then waits for whatever is
// still missing. Pair images first (needed first), then the episode grid's
// set, then the normal grid's.
// ---------------------------------------------------------------------------
function _buildBackgroundPreload(setCode) {
  return {
    type: jsPsychCallFunction,
    func: function () {
      try {
        var urls = [];
        if (CONFIG.blocks.practice || CONFIG.blocks.main) {
          urls = urls.concat(Loader.preloadURLs());
        }
        if (Loader.hasGrid()) {
          ['episode', 'normal'].forEach(function (b) {
            if (!CONFIG.blocks['grid_' + b]) return;
            Loader.gridScreens(Loader.gridSceneSet(b, setCode)).forEach(function (s) {
              s.rows.forEach(function (r) {
                r.images.forEach(function (p) { urls.push(Loader.gridImageURL(p)); });
              });
            });
          });
        }
        if (urls.length) jsPsych.pluginAPI.preloadImages(urls);
        if (CONFIG.debug) {
          console.log('[Preload] background download started (' +
                      urls.length + ' images).');
        }
      } catch (e) {
        console.warn('[Preload] background start failed; the gates will ' +
                     'download them instead.', e);
      }
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

  // No valid group in the link: do not start.
  if (!Loader.group()) {
    _runIncompleteLink();
    return;
  }

  var setCode = _drawSetCode();

  timeline = timeline.concat(_buildPavloviaInit());

  // Session properties, stamped first so they reach every row (jsPsych's
  // addProperties also covers rows recorded later).
  timeline.push({
    type: jsPsychCallFunction,
    func: function () {
      Record.stampSessionStart(jsPsych, setCode);
      // Mark anything started from dev.html, or run with a trial limit, so
      // it can never be mistaken for a real session.
      jsPsych.data.addProperties({
        is_dev: !!window.DEV_MODE ||
                (CONFIG.limits && CONFIG.limits.max_trials > 0),
      });
    },
  });

  // 1. Consent. Declining ends the session here with nothing uploaded.
  if (CONFIG.blocks.consent) {
    timeline = timeline.concat(ConsentPhase.buildNodes(jsPsych));
  }

  // 2. Full screen, window check (hard stop), and the dev size check.
  //    Before the ID screen, so a stopped participant has uploaded nothing.
  timeline = timeline.concat(ScreenCheck.buildNodes(jsPsych));

  // 3. Participant ID, then stamp it.
  timeline = timeline.concat(ParticipantID.buildNodes(jsPsych));
  timeline.push({
    type: jsPsychCallFunction,
    func: function () {
      Record.stampParticipant(jsPsych, ParticipantID.get(),
                              ParticipantID.isSuperuser());
    },
  });

  // Start downloading the stimuli in the background, early, so they are
  // usually cached by the time the practice and the grid blocks need them.
  timeline.push(_buildBackgroundPreload(setCode));

  // 4-5. Display calibration. Order matters: brightness first, because the
  // gamma match is judged by eye and a dimmed screen would bias it.
  if (CONFIG.calibration.brightness) {
    timeline = timeline.concat(BrightnessConfirmation.getNodes(jsPsych));
  }
  if (CONFIG.calibration.gamma) {
    timeline = timeline.concat(GammaCalibration.getNodes(jsPsych));
  }

  // 6. Anchoring: the episode (participants) or the imagined experience
  // (controls) that every later judgment is about.
  if (CONFIG.blocks.anchoring) {
    timeline = timeline.concat(AnchoringPhase.buildNodes(jsPsych));
  }

  // 7-8. Practice and the pair trials.
  if (CONFIG.blocks.mock) {
    timeline = timeline.concat(MockPhase.buildNodes(jsPsych));
  } else {
    timeline = timeline.concat(PairsPhase.buildNodes(jsPsych));
  }

  // 9. Episode grid block.
  if (CONFIG.blocks.grid_episode) {
    timeline = timeline.concat(GridPhase.buildNodes(jsPsych, 'episode', setCode));
  }

  // 10. Word ratings — after the image task and the episode grid.
  if (CONFIG.blocks.words) {
    timeline = timeline.concat(WordsPhase.buildNodes(jsPsych));
  }

  // 11. Normal-appearance grid block.
  if (CONFIG.blocks.grid_normal) {
    timeline = timeline.concat(GridPhase.buildNodes(jsPsych, 'normal', setCode));
  }

  // 12. State items (optional block).
  if (CONFIG.blocks.state) {
    timeline = timeline.concat(StatePhase.buildNodes(jsPsych));
  }

  // 13-14. Save and completion.
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
