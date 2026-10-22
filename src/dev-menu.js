/* =========================================================================
 * dev-menu.js — the block jumper shown by dev.html.
 *
 * WHY THIS EXISTS
 * ---------------
 * Testing the last screen of the study normally means sitting through
 * consent, full screen, ID entry, calibration, a ~150 MB preload, 211 pair
 * trials and two grid blocks. Twenty-five minutes to check one thing,
 * which means it does not get checked. This makes any single block
 * reachable in a few seconds.
 *
 * It is loaded ONLY by dev.html. index.html — what participants open —
 * does not include it, so there is no way for a participant to reach it.
 *
 * Every session started here is stamped `is_dev = true` on every row, so a
 * test session can never be mistaken for data even if it uploads.
 *
 * GROUP. The group comes from ?group= exactly as on index.html. The chips
 * below set it; until one is chosen the presets are disabled. ?set_code=
 * (0 or 1) fixes the grid set swap — dev.html only.
 *
 * Presets set CONFIG.blocks, CONFIG.calibration and CONFIG.limits, then
 * hand control back to main.js, which builds the timeline as usual. Nothing
 * here duplicates the experiment logic — a block tested from this menu is
 * the same code the participant runs. The custom section lists EVERY block
 * switch in CONFIG.blocks and CONFIG.calibration.
 * ========================================================================= */

var DevMenu = (function () {

  // The switches as config.js ships them, captured before any preset
  // changes CONFIG — used as the defaults of the custom section.
  var BLOCK_DEFAULTS = JSON.parse(JSON.stringify(CONFIG.blocks));
  var CALIB_KEYS     = ['fullscreen', 'screen_check', 'brightness', 'gamma'];
  var CALIB_DEFAULTS = {};
  CALIB_KEYS.forEach(function (k) { CALIB_DEFAULTS[k] = CONFIG.calibration[k]; });

  // All block switches off, then the listed ones on. Calibration likewise.
  function _only(blocksOn, calibOn) {
    var blocks = {};
    Object.keys(BLOCK_DEFAULTS).forEach(function (k) {
      blocks[k] = (blocksOn.indexOf(k) !== -1);
    });
    // The free-text option is a sub-switch of the episode grid; keep it as
    // shipped whenever the episode grid runs.
    if (blocks.grid_episode) blocks.grid_none_text = BLOCK_DEFAULTS.grid_none_text;
    var calibration = {};
    CALIB_KEYS.forEach(function (k) { calibration[k] = (calibOn.indexOf(k) !== -1); });
    return { blocks: blocks, calibration: calibration };
  }

  function _merge(a, b) {
    var out = {};
    [a, b].forEach(function (o) {
      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) out[k] = o[k];
    });
    return out;
  }

  var SCREEN = ['fullscreen', 'screen_check'];

  // -----------------------------------------------------------------------
  // Presets. Each returns the overrides to apply.
  //
  // `platform` is forced to 'local' on every preset except the upload test,
  // so routine dev runs (including a full timed run) do not fill the OSF
  // component with junk. Use the custom section to upload anything else.
  // -----------------------------------------------------------------------
  var PRESETS = [
    {
      id: 'full',
      label: 'Full session (local)',
      note: 'Exactly what a participant gets, ~25 minutes; the CSV downloads ' +
            'instead of uploading. Use this for the timed run.',
      apply: function () { return { platform: 'local' }; },
    },
    {
      id: 'consent',
      label: 'Consent screen only',
      note: 'Agree or decline. Declining shows the thank-you screen and stops.',
      apply: function () {
        return _merge(_only(['consent'], []), { platform: 'local' });
      },
    },
    {
      id: 'screen',
      label: 'Full screen, window check &amp; size readout',
      note: 'Resize the window to see the hard stop. No trials, no preload.',
      apply: function () {
        return _merge(_only(['size_check'], SCREEN), { platform: 'local' });
      },
    },
    {
      id: 'calibration',
      label: 'Calibration only',
      note: 'Brightness (with the viewing-conditions note) and the 3&times; ' +
            'gamma match. ~3 minutes.',
      apply: function () {
        return _merge(_only([], SCREEN.concat(['brightness', 'gamma'])),
                      { platform: 'local' });
      },
    },
    {
      id: 'anchoring',
      label: 'Anchoring + practice',
      note: 'The anchoring screen for the chosen group, then the 6 practice trials.',
      apply: function () {
        return _merge(_only(['anchoring', 'practice'], SCREEN), { platform: 'local' });
      },
    },
    {
      id: 'main_short',
      label: 'Pair trials — first 10',
      note: 'Skips practice. Preloads only the images those trials need.',
      apply: function () {
        return _merge(_only(['main'], SCREEN), {
          limits: { max_trials: 10, max_practice: 0 }, platform: 'local',
        });
      },
    },
    {
      id: 'catch',
      label: 'Catch trials',
      note: 'Runs far enough into the pair trials to reach the first catch ' +
            'trial (list trial 23).',
      apply: function () {
        return _merge(_only(['main'], SCREEN), {
          limits: { max_trials: 20, max_practice: 0 }, platform: 'local',
        });
      },
    },
    {
      id: 'grid_episode',
      label: 'Episode grid block only',
      note: 'Full screen, then the 4 episode screens, with "None of these" ' +
            'and the free-text box.',
      apply: function () {
        return _merge(_only(['grid_episode'], SCREEN), { platform: 'local' });
      },
    },
    {
      id: 'words',
      label: 'Word ratings only',
      note: 'The 10 words, 0&ndash;6, wording for the chosen group.',
      apply: function () {
        return _merge(_only(['words'], []), { platform: 'local' });
      },
    },
    {
      id: 'grid_normal',
      label: 'Normal-appearance grid block only',
      note: 'Full screen, then the 4 normal screens. No "None of these".',
      apply: function () {
        return _merge(_only(['grid_normal'], SCREEN), { platform: 'local' });
      },
    },
    {
      id: 'state',
      label: 'State items only',
      note: 'The four state items, 0&ndash;6 (placeholder wording until pasted in).',
      apply: function () {
        return _merge(_only(['state'], []), { platform: 'local' });
      },
    },
    {
      id: 'save_test',
      label: 'Upload test — 3 trials + both grid blocks',
      note: 'Three pair trials, the two grid blocks, then uploads to ' +
            'DataPipe/OSF. Use to check the save path.',
      upload: true,
      apply: function () {
        return _merge(_only(['main', 'grid_episode', 'grid_normal'], SCREEN), {
          limits: { max_trials: 3, max_practice: 0 },
        });
      },
    },
    {
      id: 'mock',
      label: 'Mock trials (no images)',
      note: 'Six coloured placeholders. Works without any stimulus files.',
      apply: function () {
        return _merge(_only(['mock'], []), { platform: 'local' });
      },
    },
  ];

  // -----------------------------------------------------------------------
  // Apply overrides onto CONFIG, one level deep.
  // -----------------------------------------------------------------------
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
    var group = Loader.group();
    var setCodeParam = new URLSearchParams(window.location.search).get('set_code');

    var html =
      '<div class="dev-menu">' +
      '<h1>Developer menu</h1>' +
      '<p class="dev-warning">Test sessions only. Every row is stamped ' +
      '<code>is_dev = true</code>. Participants use <code>index.html</code>.</p>';

    // --- Current state ---------------------------------------------------
    html += '<div class="dev-state"><table>';
    html += '<tr><th>stimulus set</th><td><code>' + _esc(summary.stimulus_set) + '</code></td></tr>';
    html += '<tr><th>trials / analysed</th><td>' + summary.trials + ' / ' + summary.analysed + '</td></tr>';
    html += '<tr><th>pair images</th><td>' + summary.images + '</td></tr>';
    html += '<tr><th>scenes</th><td>' + summary.scenes + '</td></tr>';
    html += '<tr><th>grid</th><td>' + (summary.grid_version
              ? _esc(summary.grid_version) + ', ' + summary.grid_screens +
                ' screens, ' + summary.grid_images + ' images'
              : 'not loaded') + '</td></tr>';
    html += '<tr><th>language</th><td><code>' + _esc(summary.language) + '</code></td></tr>';
    html += '<tr><th>group</th><td>' + (group ? '<code>' + _esc(group) + '</code>'
              : '<b class="dev-missing">none &mdash; choose one below</b>') + '</td></tr>';
    html += '<tr><th>interview_date</th><td>' + (summary.interview_date
              ? '<code>' + _esc(summary.interview_date) + '</code>' : '(none)') + '</td></tr>';
    html += '<tr><th>set_code</th><td>' + ((setCodeParam === '0' || setCodeParam === '1')
              ? '<code>' + setCodeParam + '</code> (fixed)' : 'random') + '</td></tr>';
    html += '<tr><th>platform</th><td><code>' + _esc(CONFIG.platform) + '</code></td></tr>';
    html += '</table></div>';

    // --- Switchers -------------------------------------------------------
    html += '<div class="dev-switchers">';
    html += '<span>group:</span>';
    (CONFIG.groups || []).forEach(function (g) {
      html += '<a class="dev-chip' + (g === group ? ' on' : '') +
              '" href="' + _link({ group: g }) + '">' + _esc(g) + '</a>';
    });
    html += '<span>language:</span>';
    ['en', 'ja'].forEach(function (l) {
      html += '<a class="dev-chip' + (l === summary.language ? ' on' : '') +
              '" href="' + _link({ lang: l }) + '">' + l + '</a>';
    });
    html += '<span>set_code:</span>';
    [['random', null], ['0', '0'], ['1', '1']].forEach(function (c) {
      var on = (c[1] === null) ? !(setCodeParam === '0' || setCodeParam === '1')
                               : setCodeParam === c[1];
      html += '<a class="dev-chip' + (on ? ' on' : '') +
              '" href="' + _link({ set_code: c[1] }) + '">' + c[0] + '</a>';
    });
    html += '<span>set:</span>';
    (CONFIG.data.available_sets || []).forEach(function (s) {
      html += '<a class="dev-chip' + (s === summary.stimulus_set ? ' on' : '') +
              '" href="' + _link({ set: s }) + '">' + _esc(s) + '</a>';
    });
    html += '</div>';

    if (!group) {
      html += '<p class="dev-warning">Choose a group first. index.html refuses ' +
              'to start without <code>?group=</code>, and so does this menu.</p>';
    }

    // --- Presets ---------------------------------------------------------
    html += '<div class="dev-presets">';
    PRESETS.forEach(function (p) {
      html += '<button class="dev-preset" data-id="' + p.id + '"' +
              (group ? '' : ' disabled') + '>' +
              '<span class="dev-preset-label">' + p.label +
              (p.upload ? ' <span class="dev-upload">uploads</span>' : '') +
              '</span>' +
              '<span class="dev-preset-note">' + p.note + '</span>' +
              '</button>';
    });
    html += '</div>';

    // --- Custom: every switch --------------------------------------------
    html += '<div class="dev-custom"><h2>Custom session</h2>' +
            '<p class="dev-preset-note">Every switch in <code>CONFIG.blocks</code> ' +
            'and <code>CONFIG.calibration</code>, preset to the values in ' +
            'config.js, in session order.</p><div class="dev-switches">';
    CALIB_KEYS.forEach(function (k) {
      html += '<label><input type="checkbox" data-calib="' + k + '"' +
              (CALIB_DEFAULTS[k] ? ' checked' : '') + '> calibration.' + k + '</label>';
    });
    Object.keys(BLOCK_DEFAULTS).forEach(function (k) {
      html += '<label><input type="checkbox" data-block="' + k + '"' +
              (BLOCK_DEFAULTS[k] ? ' checked' : '') + '> blocks.' + k + '</label>';
    });
    html += '</div>' +
            '<p>Pair trials: <input id="dev-n" type="number" min="0" max="205" ' +
            'value="0"> (0 = all 205) &nbsp; ' +
            '<label class="dev-inline"><input id="dev-upload" type="checkbox"> upload to OSF</label> ' +
            '<button id="dev-run-custom"' + (group ? '' : ' disabled') + '>Run</button></p>' +
            '</div>';

    html += '</div>';

    document.body.innerHTML = html;

    // --- Wiring ----------------------------------------------------------
    var buttons = document.querySelectorAll('.dev-preset');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        if (!Loader.group()) return;
        var id = this.getAttribute('data-id');
        for (var j = 0; j < PRESETS.length; j++) {
          if (PRESETS[j].id === id) {
            _apply(PRESETS[j].apply());
            console.log('[Dev] preset "' + id + '" — platform=' + CONFIG.platform +
                        ', blocks=', CONFIG.blocks, ', calibration=', CONFIG.calibration,
                        ', limits=', CONFIG.limits);
            document.body.innerHTML = '';
            onStart();
            return;
          }
        }
      });
    }

    document.getElementById('dev-run-custom').addEventListener('click', function () {
      if (!Loader.group()) return;
      var blocks = {}, calibration = {};
      var boxes = document.querySelectorAll('.dev-switches input');
      for (var b = 0; b < boxes.length; b++) {
        var bk = boxes[b].getAttribute('data-block');
        var ck = boxes[b].getAttribute('data-calib');
        if (bk) blocks[bk] = boxes[b].checked;
        if (ck) calibration[ck] = boxes[b].checked;
      }
      var n = parseInt(document.getElementById('dev-n').value, 10) || 0;
      var up = document.getElementById('dev-upload').checked;
      _apply({ blocks: blocks, calibration: calibration,
               limits: { max_trials: n, max_practice: 0 } });
      if (!up) CONFIG.platform = 'local';
      console.log('[Dev] custom — blocks=', blocks, 'calibration=', calibration,
                  'trials=' + (n || 'all') + ', upload=' + up);
      document.body.innerHTML = '';
      onStart();
    });
  }

  // Build a link to this page with query parameters changed (null removes).
  function _link(changes) {
    var params = new URLSearchParams(window.location.search);
    for (var k in changes) {
      if (!Object.prototype.hasOwnProperty.call(changes, k)) continue;
      if (changes[k] === null) params.delete(k); else params.set(k, changes[k]);
    }
    return window.location.pathname + '?' + params.toString();
  }

  return { show: show };
})();
