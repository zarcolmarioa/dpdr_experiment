/* =========================================================================
 * dev-menu.js — the block jumper shown by dev.html.
 *
 * WHY THIS EXISTS
 * ---------------
 * Testing the last screen of the study normally means sitting through
 * consent, ID entry, fullscreen, calibration, a 63 MB preload and 143
 * trials. Ten minutes to check one thing, which means it does not get
 * checked. This makes any single block reachable in a few seconds.
 *
 * It is loaded ONLY by dev.html. index.html — what participants open —
 * does not include it, so there is no way for a participant to reach it.
 *
 * Every session started here is stamped `is_dev = true` on every row, so a
 * test session can never be mistaken for data even if it uploads.
 *
 * Presets set CONFIG.blocks and CONFIG.limits, then hand control back to
 * main.js, which builds the timeline as usual. Nothing here duplicates the
 * experiment logic — a block tested from this menu is the same code the
 * participant runs.
 * ========================================================================= */

var DevMenu = (function () {

  // -----------------------------------------------------------------------
  // Presets. Each returns the overrides to apply.
  //
  // `platform` is forced to 'local' on presets that are not about testing
  // the upload, so routine dev runs do not fill the OSF component with
  // junk. The two save-test presets deliberately leave it alone.
  // -----------------------------------------------------------------------
  var PRESETS = [
    {
      id: 'full',
      label: 'Full session',
      note: 'Exactly what a participant gets. ~20 minutes.',
      apply: function () { return {}; },
    },
    {
      id: 'screen',
      label: 'Screen &amp; size check only',
      note: 'Fullscreen, viewport gate, panel size readout. No trials, no preload.',
      apply: function () {
        return {
          calibration: { fullscreen: true, screen_check: true,
                         brightness: false, gamma: false },
          blocks: { size_check: true, words: false, practice: false,
                    main: false, mock: false },
          platform: 'local',
        };
      },
    },
    {
      id: 'words',
      label: 'Word ratings only',
      note: 'The 10 descriptors, 0&ndash;6. No calibration, no images.',
      apply: function () {
        return {
          calibration: { fullscreen: false, screen_check: false,
                         brightness: false, gamma: false },
          blocks: { size_check: false, words: true, practice: false,
                    main: false, mock: false },
          platform: 'local',
        };
      },
    },
    {
      id: 'calibration',
      label: 'Calibration only',
      note: 'Brightness confirmation and the 3&times; gamma match. ~3 minutes.',
      apply: function () {
        return {
          calibration: { fullscreen: true, screen_check: true,
                         brightness: true, gamma: true },
          blocks: { size_check: false, words: false, practice: false,
                    main: false, mock: false },
          platform: 'local',
        };
      },
    },
    {
      id: 'practice', _skipCalib: true,
      label: 'Practice only',
      note: 'The 6 practice trials, with feedback on the first two.',
      apply: function () {
        return {
          blocks: { size_check: false, practice: true, main: false, mock: false },
          platform: 'local',
        };
      },
    },
    {
      id: 'main_short', _skipCalib: true,
      label: 'Main block — first 10 trials',
      note: 'Skips practice. Preloads only the images those trials need.',
      apply: function () {
        return {
          blocks: { size_check: false, practice: false, main: true, mock: false },
          limits: { max_trials: 10, max_practice: 0 },
          platform: 'local',
        };
      },
    },
    {
      id: 'catch', _skipCalib: true,
      label: 'Catch trials',
      note: 'Runs far enough into the main block to reach the first catch trial (~63).',
      apply: function () {
        return {
          blocks: { size_check: false, practice: false, main: true, mock: false },
          limits: { max_trials: 70, max_practice: 0 },
          platform: 'local',
        };
      },
    },
    {
      id: 'save_test', _skipCalib: true,
      label: 'Upload test — 3 trials',
      note: 'Three trials, then uploads to DataPipe/OSF. Use to check the save path.',
      upload: true,
      apply: function () {
        return {
          blocks: { size_check: false, practice: false, main: true, mock: false },
          limits: { max_trials: 3, max_practice: 0 },
        };
      },
    },
    {
      id: 'mock', _skipCalib: true,
      label: 'Mock trials (no images)',
      note: 'Six coloured placeholders. Works without any stimulus files.',
      apply: function () {
        return {
          blocks: { size_check: false, practice: false, main: false, mock: true },
          platform: 'local',
        };
      },
    },
  ];

  // -----------------------------------------------------------------------
  // Apply overrides onto CONFIG, one level deep.
  // -----------------------------------------------------------------------
  // Presets other than 'full' and 'calibration' skip the calibration
  // screens, so a quick test does not mean sitting through the gamma match.
  function _skipCalibration() {
    return { calibration: { brightness: false, gamma: false },
             blocks: { words: false } };
  }

  function _apply(overrides) {
    for (var key in overrides) {
      if (!Object.prototype.hasOwnProperty.call(overrides, key)) continue;
      var val = overrides[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        CONFIG[key] = CONFIG[key] || {};
        for (var sub in val) {
          if (Object.prototype.hasOwnProperty.call(val, sub)) CONFIG[key][sub] = val[sub];
        }
      } else {
        CONFIG[key] = val;
      }
    }
  }

  function _esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  // -----------------------------------------------------------------------
  // Render the menu. `onStart` is called once a preset is chosen.
  // `summary` is the validation summary, shown so the loaded data is
  // visible before anything runs.
  // -----------------------------------------------------------------------
  function show(summary, onStart) {
    var html =
      '<div class="dev-menu">' +
      '<h1>Developer menu</h1>' +
      '<p class="dev-warning">Test sessions only. Every row is stamped ' +
      '<code>is_dev = true</code>. Participants use <code>index.html</code>.</p>';

    // --- Current state ---------------------------------------------------
    html += '<div class="dev-state"><table>';
    html += '<tr><th>stimulus set</th><td><code>' + _esc(summary.stimulus_set) + '</code></td></tr>';
    html += '<tr><th>trials / analysed</th><td>' + summary.trials + ' / ' + summary.analysed + '</td></tr>';
    html += '<tr><th>images</th><td>' + summary.images + '</td></tr>';
    html += '<tr><th>scenes</th><td>' + summary.scenes + '</td></tr>';
    html += '<tr><th>language</th><td><code>' + _esc(summary.language) + '</code></td></tr>';
    html += '<tr><th>platform</th><td><code>' + _esc(CONFIG.platform) + '</code></td></tr>';
    html += '</table></div>';

    // --- Switchers -------------------------------------------------------
    html += '<div class="dev-switchers">';
    html += '<span>set:</span>';
    (CONFIG.data.available_sets || []).forEach(function (s) {
      html += '<a class="dev-chip' + (s === summary.stimulus_set ? ' on' : '') +
              '" href="' + _link({ set: s }) + '">' + _esc(s) + '</a>';
    });
    html += '<span>language:</span>';
    ['en', 'ja'].forEach(function (l) {
      html += '<a class="dev-chip' + (l === summary.language ? ' on' : '') +
              '" href="' + _link({ lang: l }) + '">' + l + '</a>';
    });
    html += '</div>';

    // --- Presets ---------------------------------------------------------
    html += '<div class="dev-presets">';
    PRESETS.forEach(function (p) {
      html += '<button class="dev-preset" data-id="' + p.id + '">' +
              '<span class="dev-preset-label">' + p.label +
              (p.upload ? ' <span class="dev-upload">uploads</span>' : '') +
              '</span>' +
              '<span class="dev-preset-note">' + p.note + '</span>' +
              '</button>';
    });
    html += '</div>';

    // --- Custom trial count ----------------------------------------------
    html += '<div class="dev-custom">' +
            '<label>Custom: run <input id="dev-n" type="number" min="1" max="143" ' +
            'value="5"> main trials, ' +
            '<label class="dev-inline"><input id="dev-upload" type="checkbox"> upload to OSF</label> ' +
            '<button id="dev-run-custom">Run</button>' +
            '</label></div>';

    html += '</div>';

    document.body.innerHTML = html;

    // --- Wiring ----------------------------------------------------------
    var buttons = document.querySelectorAll('.dev-preset');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        for (var j = 0; j < PRESETS.length; j++) {
          if (PRESETS[j].id === id) {
            if (PRESETS[j]._skipCalib) _apply(_skipCalibration());
            _apply(PRESETS[j].apply());
            console.log('[Dev] preset "' + id + '" — platform=' + CONFIG.platform +
                        ', blocks=', CONFIG.blocks, ', limits=', CONFIG.limits);
            document.body.innerHTML = '';
            onStart();
            return;
          }
        }
      });
    }

    document.getElementById('dev-run-custom').addEventListener('click', function () {
      var n = parseInt(document.getElementById('dev-n').value, 10) || 5;
      var up = document.getElementById('dev-upload').checked;
      _apply(_skipCalibration());
      _apply({
        blocks: { size_check: false, practice: false, main: true, mock: false },
        limits: { max_trials: n, max_practice: 0 },
      });
      if (!up) CONFIG.platform = 'local';
      console.log('[Dev] custom — ' + n + ' trials, upload=' + up);
      document.body.innerHTML = '';
      onStart();
    });
  }

  // Build a link to this page with one query parameter changed.
  function _link(changes) {
    var params = new URLSearchParams(window.location.search);
    for (var k in changes) {
      if (Object.prototype.hasOwnProperty.call(changes, k)) params.set(k, changes[k]);
    }
    return window.location.pathname + '?' + params.toString();
  }

  return { show: show };
})();
