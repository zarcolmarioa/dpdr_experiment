/* =========================================================================
 * validate.js — preflight checks, run before anything is displayed.
 *
 * The point is to turn vague failures into specific ones. Without this, a
 * missing image is a grey box halfway through a session and you do not know
 * which file. With it, you get the filename before the experiment starts.
 *
 * In debug mode a full report is printed to the console and, if anything
 * failed, shown on screen instead of starting the study. In production a
 * failure shows a neutral error rather than running a broken session.
 *
 * The v4 design is preregistered and frozen, so departures from it are
 * ERRORS, not warnings: wrong trial counts, a catch_mode this code does not
 * implement, a catch sequence of the wrong length, grid layout constants
 * that differ from the package's.
 *
 * Some checks depend on WHERE the session is started:
 *   - index.html (a real session) refuses to start with the consent screen
 *     switched off. Only dev.html (window.DEV_MODE) can run without it.
 *   - placeholder text left in the consent screen or the state items is a
 *     warning while CONFIG.debug is on, and an ERROR on index.html with
 *     debug off — the configuration participants would get.
 *
 * What is NOT checked here: whether the image files actually exist on the
 * server. That would need 478 HTTP requests (334 pair + 144 grid). The
 * preload steps do it instead, and report any that 404.
 * ========================================================================= */

var Validate = (function () {

  var REQUIRED_FIELDS = [
    'trial', 'trial_type', 'analysed', 'scene_id', 'category',
    'left_path', 'right_path', 'a_is_left',
    'pred_sat', 'pred_fog', 'd_sat', 'd_fog', 'z_sat', 'z_fog', 'mag_bin',
    'catch_mode', 'repeat_of',
  ];

  // The frozen v4 trial list (drl2drv_updated/data_trials/
  // frozen_trial_list_v4). Any difference means the wrong file is deployed.
  var EXPECTED_COUNTS = {
    practice:     6,
    sat_only:    60,
    fog_only:    60,
    together:    30,
    conflict:    30,
    consistency: 15,
    catch:       10,
  };
  var EXPECTED_TOTAL    = 211;
  var EXPECTED_ANALYSED = 180;
  var EXPECTED_PRELOAD  = 334;
  var ANALYSED_TYPES    = ['sat_only', 'fog_only', 'together', 'conflict'];

  // The word list. The ids become output columns (word_<id>) and must be
  // exactly these. The two targets are promoted to rating_foggy and
  // rating_faded by record.js.
  var EXPECTED_WORD_IDS = ['foggy', 'faded', 'veiled', 'lifeless', 'unreal',
                           'dreamlike', 'distant', 'like_a_picture',
                           'oppressive', 'threatening'];
  var TARGET_WORDS      = ['foggy', 'faded'];

  // State items: columns state_q02, state_q13, state_q19, state_q29.
  var EXPECTED_STATE_IDS = ['q02', 'q13', 'q19', 'q29'];

  // Recorded option codes. The labels may change; the codes are the data
  // and must be identical in both languages.
  var EXPECTED_CODES = {
    'grid.none_followup.options':
      ['beyond_left', 'beyond_right', 'between', 'other_way', 'cant_say'],
  };

  // Grid package.
  var EXPECTED_GRID_SCREENS = 4;     // per scene set
  var EXPECTED_GRID_BLOCKS = {
    episode: { none_button: true,  free_text_on_none: true  },
    normal:  { none_button: false, free_text_on_none: false },
  };
  var GRID_LAYOUT_KEYS = ['max_cell_px', 'min_cell_px', 'row_gap_px',
                          'col_gap_px', 'chrome_px', 'page_side_px',
                          'cell_chrome_px'];

  // Blocks the registered design needs. Switching one off on index.html is
  // allowed (warning) but such a session is not a registered session.
  var REGISTERED_BLOCKS = ['consent', 'anchoring', 'practice', 'main',
                           'grid_episode', 'words', 'grid_normal'];

  // Instruction text must not describe the experience with visual words —
  // those are exactly what the word ratings and the images measure.
  // Checked in the English text (not the rated words themselves, and not
  // the questionnaire items, whose wording is fixed by the instrument).
  var VISUAL_WORDS = /\b(fog|foggy|blur|blurred|blurry|faded|fade|dull|colou?rless|unreal|dream-?like|flat|veiled|veil|behind glass)\b/i;

  // A bracketed gap such as [researcher names] or [CDS item 2: ...].
  var PLACEHOLDER = /\[[^\]]+\]/;

  function _pathSet(list) {
    var s = {};
    for (var i = 0; i < list.length; i++) s[list[i]] = true;
    return s;
  }

  function _isProduction() {
    return !window.DEV_MODE && !CONFIG.debug;
  }

  // -----------------------------------------------------------------------
  // Recursively collect the key structure of a text object, so the English
  // and Japanese files can be compared.
  // -----------------------------------------------------------------------
  function _keyPaths(obj, prefix, out) {
    out = out || [];
    prefix = prefix || '';
    for (var k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      var path = prefix ? prefix + '.' + k : k;
      if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
        _keyPaths(obj[k], path, out);
      } else {
        out.push(path);
      }
    }
    return out;
  }

  // Every string in an object, with its path, skipping the listed paths.
  function _strings(obj, prefix, skip, out) {
    out = out || [];
    for (var k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      var path = prefix ? prefix + '.' + k : k;
      if (skip.indexOf(path) !== -1) continue;
      var v = obj[k];
      if (typeof v === 'string') out.push({ path: path, value: v });
      else if (v && typeof v === 'object') _strings(v, path, skip, out);
    }
    return out;
  }

  function _get(obj, path) {
    var parts = path.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (obj === null || obj === undefined) return undefined;
      obj = obj[parts[i]];
    }
    return obj;
  }

  // -----------------------------------------------------------------------
  // Run every check. Returns { ok, errors, warnings, summary }.
  // -----------------------------------------------------------------------
  function run(data) {
    var errors   = [];
    var warnings = [];
    var trials   = data.trials;
    var preload  = data.preload;

    // --- Structural ------------------------------------------------------
    if (!Array.isArray(trials) || trials.length === 0) {
      errors.push('trial_list.json is empty or not an array.');
      return _result(errors, warnings, {});
    }
    if (!Array.isArray(preload) || preload.length === 0) {
      errors.push('preload.json is empty or not a plain list of paths.');
      return _result(errors, warnings, {});
    }

    // --- Required fields present on every row ----------------------------
    // (null is a valid value — it means "not applicable" — but the key must
    // be there.) There is deliberately no correct_response column.
    var missingFields = {};
    trials.forEach(function (t) {
      REQUIRED_FIELDS.forEach(function (f) {
        if (t[f] === undefined) {
          missingFields[f] = (missingFields[f] || 0) + 1;
        }
      });
    });
    for (var f in missingFields) {
      errors.push('Field "' + f + '" missing on ' + missingFields[f] + ' trials.');
    }

    // --- Trial numbering -------------------------------------------------
    var nums = trials.map(function (t) { return t.trial; });
    var sorted = nums.slice().sort(function (a, b) { return a - b; });
    var dupes = sorted.filter(function (n, i) { return i > 0 && n === sorted[i - 1]; });
    if (dupes.length) {
      errors.push('Duplicate trial numbers: ' + dupes.slice(0, 5).join(', '));
    }
    for (var i = 1; i < nums.length; i++) {
      if (nums[i] < nums[i - 1]) {
        warnings.push('trial_list.json is not in ascending trial order. ' +
                      'It will be presented in file order regardless.');
        break;
      }
    }

    // --- Counts: the frozen v4 design ------------------------------------
    var counts = {};
    trials.forEach(function (t) {
      counts[t.trial_type] = (counts[t.trial_type] || 0) + 1;
    });
    for (var type in EXPECTED_COUNTS) {
      var got = counts[type] || 0;
      if (got !== EXPECTED_COUNTS[type]) {
        errors.push('Expected ' + EXPECTED_COUNTS[type] + ' "' + type +
                    '" trials, found ' + got + '.');
      }
    }
    for (var t2 in counts) {
      if (!(t2 in EXPECTED_COUNTS)) {
        errors.push('Unknown trial_type "' + t2 + '" (' + counts[t2] + ' rows).');
      }
    }
    if (trials.length !== EXPECTED_TOTAL) {
      errors.push('Expected ' + EXPECTED_TOTAL + ' trials, found ' +
                  trials.length + '.');
    }
    var nAnalysed = trials.filter(function (t) { return t.analysed === true; }).length;
    if (nAnalysed !== EXPECTED_ANALYSED) {
      errors.push('Expected ' + EXPECTED_ANALYSED + ' analysed trials, found ' +
                  nAnalysed + '.');
    }
    var badAnalysed = trials.filter(function (t) {
      return t.analysed !== (ANALYSED_TYPES.indexOf(t.trial_type) !== -1);
    });
    if (badAnalysed.length) {
      errors.push(badAnalysed.length + ' trial(s) have `analysed` set ' +
                  'inconsistently with their type (e.g. trial ' +
                  badAnalysed[0].trial + ').');
    }
    var practiceAt = trials.map(function (t, k) {
      return t.trial_type === 'practice' ? k : -1;
    }).filter(function (k) { return k !== -1; });
    if (practiceAt.length && practiceAt[practiceAt.length - 1] !== practiceAt.length - 1) {
      errors.push('Practice trials are not the first rows of trial_list.json.');
    }

    // --- Catch trials ----------------------------------------------------
    // The kind of catch trial is declared per row (catch_mode) and must be
    // the kind this code implements. The target key comes from
    // CONFIG.catch_trials.sequence, one per catch row, in order.
    var catchMode = CONFIG.catch_trials && CONFIG.catch_trials.mode;
    var catches = trials.filter(function (t) { return t.trial_type === 'catch'; });
    var wrongMode = catches.filter(function (t) { return t.catch_mode !== catchMode; });
    if (wrongMode.length) {
      errors.push(wrongMode.length + ' catch row(s) expect catch_mode "' +
                  wrongMode[0].catch_mode + '" but CONFIG.catch_trials.mode is "' +
                  catchMode + '". The experiment and the trial list disagree ' +
                  'about what a catch trial is.');
    }
    var strayMode = trials.filter(function (t) {
      return t.trial_type !== 'catch' && t.catch_mode !== null;
    });
    if (strayMode.length) {
      errors.push(strayMode.length + ' non-catch row(s) have a catch_mode.');
    }

    var seq = (CONFIG.catch_trials && CONFIG.catch_trials.sequence) || [];
    if (seq.length !== catches.length) {
      errors.push('CONFIG.catch_trials.sequence has ' + seq.length +
                  ' entries but there are ' + catches.length + ' catch ' +
                  'rows. There must be exactly one target per catch row.');
    }
    var badKeys = seq.filter(function (k) {
      return k !== 'ArrowUp' && k !== 'ArrowDown';
    });
    if (badKeys.length) {
      errors.push('CONFIG.catch_trials.sequence contains non-vertical keys: ' +
                  badKeys.join(', ') + '. A left/right target would be ' +
                  'satisfied by the trained response without reading.');
    }
    var nUp = seq.filter(function (k) { return k === 'ArrowUp'; }).length;
    var nDown = seq.length - nUp;
    if (Math.abs(nUp - nDown) > 1) {
      errors.push('Catch targets are unbalanced (' + nUp + ' up, ' +
                  nDown + ' down). A near-constant target is learnable.');
    }
    var streak = 1, maxRun = seq.length ? 1 : 0;
    for (var s = 1; s < seq.length; s++) {
      streak = (seq[s] === seq[s - 1]) ? streak + 1 : 1;
      maxRun = Math.max(maxRun, streak);
    }
    if (maxRun > 2) {
      errors.push('CONFIG.catch_trials.sequence has ' + maxRun + ' identical ' +
                  'targets in a row; the maximum is 2.');
    }
    if (!CONFIG.catch_trials || !(CONFIG.catch_trials.lockout_ms > 0)) {
      warnings.push('No catch-trial lockout. A keypress carried over from ' +
                    'the previous trial could land before the participant ' +
                    'has read the screen.');
    }

    // --- Every image a trial SHOWS is in preload.json --------------------
    // Catch rows in 'no_images' mode show nothing, so their paths are not
    // expected in preload.json (the package omits the 15 images used only
    // by catch rows on purpose).
    function shows(t) {
      return !(t.trial_type === 'catch' && t.catch_mode === 'no_images');
    }
    var preloadSet = _pathSet(preload);
    var notPreloaded = {};
    var used = {};
    trials.forEach(function (t) {
      if (!shows(t)) return;
      [t.left_path, t.right_path].forEach(function (p) {
        used[p] = true;
        if (!preloadSet[p]) notPreloaded[p] = true;
      });
    });
    var npKeys = Object.keys(notPreloaded);
    if (npKeys.length) {
      errors.push(npKeys.length + ' image(s) shown by trials are not in ' +
                  'preload.json, e.g. ' + npKeys.slice(0, 3).join(', '));
    }
    var unused = preload.filter(function (p) { return !used[p]; });
    if (unused.length) {
      warnings.push(unused.length + ' image(s) in preload.json are never ' +
                    'shown. trial_list.json and preload.json may be out of step.');
    }
    if (preload.length !== EXPECTED_PRELOAD) {
      errors.push('Expected ' + EXPECTED_PRELOAD + ' paths in preload.json, ' +
                  'found ' + preload.length + '.');
    }

    // --- a_is_left is a real boolean -------------------------------------
    var badAIL = trials.filter(function (t) { return typeof t.a_is_left !== 'boolean'; });
    if (badAIL.length) {
      errors.push(badAIL.length + ' trial(s) have a non-boolean a_is_left. ' +
                  'The analysis cannot map side to choice without it.');
    }

    // --- Consistency trials ----------------------------------------------
    var byNumber = {};
    trials.forEach(function (t) { byNumber[t.trial] = t; });

    var consistency = trials.filter(function (t) { return t.trial_type === 'consistency'; });
    consistency.forEach(function (t) {
      if (t.repeat_of === null || t.repeat_of === undefined) {
        errors.push('Consistency trial ' + t.trial + ' has no repeat_of.');
        return;
      }
      var origNum = Math.round(t.repeat_of);   // may be stored as a float
      var orig = byNumber[origNum];
      if (!orig) {
        errors.push('Consistency trial ' + t.trial + ' points at trial ' +
                    origNum + ', which does not exist.');
        return;
      }
      if (origNum >= t.trial) {
        errors.push('Consistency trial ' + t.trial + ' points at trial ' +
                    origNum + ', which is not earlier.');
      }
      var samePair =
        (t.left_path === orig.left_path && t.right_path === orig.right_path) ||
        (t.left_path === orig.right_path && t.right_path === orig.left_path);
      if (!samePair) {
        errors.push('Consistency trial ' + t.trial + ' does not show the same ' +
                    'image pair as trial ' + origNum + '. The consistency ' +
                    'measure would be meaningless.');
      }
    });
    var strayRepeat = trials.filter(function (t) {
      return t.trial_type !== 'consistency' && t.repeat_of !== null;
    });
    if (strayRepeat.length) {
      errors.push(strayRepeat.length + ' non-consistency row(s) have a repeat_of.');
    }

    // --- Text files ------------------------------------------------------
    _checkText(errors, warnings);

    // --- Participant fields and contact ---------------------------------
    var P = CONFIG.participant || {};
    if (!P.collect_id) {
      warnings.push('collect_id is OFF. Sessions get an anonymous ID and ' +
                    'cannot be linked to a CDS-29 score.');
    }
    // ID for sessions without a participant ID: prefix + '_' + 8 characters.
    // It must not be mistakable for a real or a test ID.
    if (P.collect_id && P.allow_manual_id && P.collect_name && P.collect_email) {
      var pre = P.no_id_prefix;
      if (!pre || !/^[A-Za-z0-9_]+$/.test(pre)) {
        errors.push('CONFIG.participant.no_id_prefix must be letters, digits ' +
                    'and _ (it starts the ID of sessions without an ID).');
      } else {
        var sample = pre + '_ABCDEFGH';
        if (new RegExp(P.id_pattern).test(sample) ||
            (P.superuser_ids || []).indexOf(sample) !== -1) {
          errors.push('IDs made from no_id_prefix ("' + sample + '") would match ' +
                      'id_pattern or a test ID. Choose another prefix.');
        }
      }
    }
    if ((P.collect_name || P.collect_email) &&
        !(CONFIG.contact_datapipe && CONFIG.contact_datapipe.experiment_id)) {
      errors.push('Name/email collection is on but CONFIG.contact_datapipe.' +
                  'experiment_id is empty — contact details would be lost.');
    }
    if (!CONFIG.researcher_contact ||
        /CHANGE_ME/.test(CONFIG.researcher_contact)) {
      warnings.push('CONFIG.researcher_contact is still the placeholder. ' +
                    'It appears on the final screen and the upload-failure ' +
                    'screen — set it before recruiting.');
    }

    // --- Blocks: consent is a hard requirement for a real session --------
    var B = CONFIG.blocks || {};
    if (!B.consent) {
      if (!window.DEV_MODE) {
        errors.push('CONFIG.blocks.consent is OFF. A real session must not ' +
                    'run without the consent screen. Use dev.html to test ' +
                    'without it.');
      } else {
        warnings.push('Consent screen is off (dev session).');
      }
    }
    if (!window.DEV_MODE) {
      REGISTERED_BLOCKS.forEach(function (b) {
        if (!B[b]) {
          warnings.push('Registered block CONFIG.blocks.' + b + ' is OFF. ' +
                        'Sessions run like this are not registered sessions.');
        }
      });
      if (B.mock) {
        warnings.push('CONFIG.blocks.mock is ON: placeholder trials replace ' +
                      'the real pair trials.');
      }
      var L = CONFIG.limits || {};
      if (L.max_trials > 0 || L.max_practice > 0) {
        warnings.push('CONFIG.limits truncates the trials; every session ' +
                      'will be stamped is_dev.');
      }
    }
    if (CONFIG.display && CONFIG.display.allow_scaling) {
      warnings.push('display.allow_scaling is ON. The registered design ' +
                    'shows every image at exactly ' + CONFIG.display.image_px + ' px.');
    }

    // --- Grid package ----------------------------------------------------
    var grid = data.grid;
    if (grid) {
      _checkGrid(grid, data.gridPreload, errors, warnings);
    } else if (B.grid_episode || B.grid_normal) {
      errors.push('A grid block is switched on but grid_trials.json was not loaded.');
    }

    // --- Summary ---------------------------------------------------------
    var summary = {
      stimulus_set: Loader.stimulusSet(),
      trials:       trials.length,
      analysed:     nAnalysed,
      images:       preload.length,
      scenes:       Object.keys(trials.reduce(function (a, t) {
                      a[t.scene_id] = 1; return a;
                    }, {})).length,
      counts:       counts,
      language:     Loader.language(),
      group:        Loader.group(),
      interview_date: Loader.interviewDate(),
      grid_version: grid ? grid.version : null,
      grid_screens: grid ? Loader.gridAllScreens().length : 0,
      grid_images:  (data.gridPreload && data.gridPreload.length) || 0,
    };

    return _result(errors, warnings, summary);
  }

  // -----------------------------------------------------------------------
  // Text checks: both languages have the same keys, every group-dependent
  // string has a version for every group, the word and state lists are
  // exactly the registered ones, and no placeholder is left in production.
  // -----------------------------------------------------------------------
  function _checkText(errors, warnings) {
    var enKeys = _keyPaths(TEXT_EN).sort();
    var jaKeys = _keyPaths(TEXT_JA).sort();
    var missingJa = enKeys.filter(function (k) { return jaKeys.indexOf(k) === -1; });
    var missingEn = jaKeys.filter(function (k) { return enKeys.indexOf(k) === -1; });
    if (missingJa.length) {
      errors.push('Missing from Japanese text: ' + missingJa.join(', '));
    }
    if (missingEn.length) {
      errors.push('Missing from English text: ' + missingEn.join(', '));
    }

    // Group-dependent strings: an object with one entry per group.
    var groups = CONFIG.groups || [];
    if (groups.length < 2) {
      errors.push('CONFIG.groups must list the groups (participant, control).');
    }
    var GROUP_TEXT = [
      ['TEXT', 'prompt.main'],
      ['TEXT', 'anchoring.body'],
      ['TEXT', 'grid.question_episode'],
      ['WORDS', 'instruction'],
      ['WORDS', 'question_short'],
    ];
    [['EN', TEXT_EN, typeof WORDS_EN !== 'undefined' ? WORDS_EN : null],
     ['JA', TEXT_JA, typeof WORDS_JA !== 'undefined' ? WORDS_JA : null]
    ].forEach(function (lang) {
      GROUP_TEXT.forEach(function (gt) {
        var src = (gt[0] === 'TEXT') ? lang[1] : lang[2];
        if (!src) return;
        var v = _get(src, gt[1]);
        groups.forEach(function (g) {
          if (!v || typeof v !== 'object' || typeof v[g] !== 'string' || !v[g]) {
            errors.push(gt[0] + '_' + lang[0] + '.' + gt[1] + ' has no "' + g +
                        '" version. Group-dependent strings need one per group.');
          }
        });
      });
    });

    // Word lists.
    if (typeof WORDS_EN !== 'undefined' && typeof WORDS_JA !== 'undefined') {
      var idsEn = WORDS_EN.items.map(function (w) { return w.id; });
      var idsJa = WORDS_JA.items.map(function (w) { return w.id; });
      if (idsEn.slice().sort().join(',') !== idsJa.slice().sort().join(',')) {
        errors.push('Word lists differ between languages. EN: ' +
                    idsEn.join(', ') + ' | JA: ' + idsJa.join(', '));
      }
      if (idsEn.slice().sort().join(',') !== EXPECTED_WORD_IDS.slice().sort().join(',')) {
        errors.push('Word ids are not the registered ten (' +
                    EXPECTED_WORD_IDS.join(', ') + '). Found: ' + idsEn.join(', '));
      }
      TARGET_WORDS.forEach(function (target) {
        if (idsEn.indexOf(target) === -1) {
          errors.push('Target word "' + target + '" is missing from the word ' +
                      'list. It is promoted to a session-level column.');
        }
      });
      ['title', 'instruction', 'question_short', 'anchor_low', 'anchor_high',
       'button_begin', 'button_submit', 'progress'].forEach(function (k) {
        if (WORDS_EN[k] === undefined) errors.push('WORDS_EN is missing "' + k + '".');
        if (WORDS_JA[k] === undefined) errors.push('WORDS_JA is missing "' + k + '".');
      });
      var wordKeysEn = _keyPaths(WORDS_EN).sort().join(',');
      var wordKeysJa = _keyPaths(WORDS_JA).sort().join(',');
      if (wordKeysEn !== wordKeysJa) {
        errors.push('WORDS_EN and WORDS_JA have different keys.');
      }
    } else if (CONFIG.blocks.words) {
      errors.push('CONFIG.blocks.words is on but the word lists are not ' +
                  'loaded. Check the text/*/words.js script tags.');
    }

    // State items: exactly the four, same ids in both languages.
    [['EN', TEXT_EN], ['JA', TEXT_JA]].forEach(function (lang) {
      var st = lang[1].state;
      var ids = (st && Array.isArray(st.items))
                ? st.items.map(function (x) { return x.id; }) : [];
      if (ids.join(',') !== EXPECTED_STATE_IDS.join(',')) {
        errors.push('TEXT_' + lang[0] + '.state.items must be ' +
                    EXPECTED_STATE_IDS.join(', ') + ' in that order. Found: ' +
                    (ids.join(', ') || 'none'));
      }
    });

    // Option lists (arrays, so not covered by the key comparison above).
    for (var path in EXPECTED_CODES) {
      var want = EXPECTED_CODES[path].join(',');
      [['EN', TEXT_EN], ['JA', TEXT_JA]].forEach(function (lang) {
        var list = _get(lang[1], path);
        var got = Array.isArray(list)
          ? list.map(function (o) { return o && o.code; }).join(',') : '';
        if (got !== want) {
          errors.push('TEXT_' + lang[0] + '.' + path + ' codes are [' + got +
                      '], expected [' + want + '] — codes are what is recorded.');
        }
        if (Array.isArray(list) && list.some(function (o) { return !o || !o.label; })) {
          errors.push('TEXT_' + lang[0] + '.' + path + ' has an option with no label.');
        }
      });
    }

    // Placeholders. The consent wording and the four state items ship as
    // marked placeholders; they must be replaced before recruiting.
    var gaps = [];
    [['EN', TEXT_EN], ['JA', TEXT_JA]].forEach(function (lang) {
      _strings(lang[1].consent || {}, 'consent', [], []).forEach(function (s) {
        if (PLACEHOLDER.test(s.value)) gaps.push(lang[0] + ' ' + s.path);
      });
      if (CONFIG.blocks.state && lang[1].state) {
        (lang[1].state.items || []).forEach(function (it) {
          if (PLACEHOLDER.test(it.label)) gaps.push(lang[0] + ' state ' + it.id);
        });
      }
    });
    if (gaps.length) {
      var msg = 'Placeholder text still in use (' + gaps.join('; ') + '). ' +
                'Paste the approved wording before recruiting.';
      if (_isProduction()) errors.push(msg); else warnings.push(msg);
    }

    // Visual words in instruction text (English). The rated words and the
    // questionnaire items are exempt.
    var hits = [];
    _strings(TEXT_EN, '', ['state.items'], []).forEach(function (s) {
      if (VISUAL_WORDS.test(s.value.replace(/<[^>]+>/g, ' '))) hits.push(s.path);
    });
    if (typeof WORDS_EN !== 'undefined') {
      _strings(WORDS_EN, 'words', ['words.items'], []).forEach(function (s) {
        if (VISUAL_WORDS.test(s.value.replace(/<[^>]+>/g, ' '))) hits.push(s.path);
      });
    }
    if (hits.length) {
      warnings.push('Instruction text describes the experience with a visual ' +
                    'word (foggy, faded, dull, unreal, ...): ' + hits.join(', '));
    }
  }

  // -----------------------------------------------------------------------
  // Grid package checks, against interface_spec.md.
  // -----------------------------------------------------------------------
  function _checkGrid(grid, gridPre, errors, warnings) {
    if (typeof grid !== 'object' || Array.isArray(grid)) {
      errors.push('grid_trials.json is not an object (old grid format?).');
      return;
    }
    if (!Array.isArray(gridPre) || !gridPre.length) {
      errors.push('grid/preload.json must be {"images": [...]} with at least ' +
                  'one path.');
      return;
    }

    // Blocks and their flags.
    for (var name in EXPECTED_GRID_BLOCKS) {
      var b = Loader.gridBlock(name);
      if (!b) {
        errors.push('Grid package has no "' + name + '" block.');
        continue;
      }
      var want = EXPECTED_GRID_BLOCKS[name];
      if (b.none_button !== want.none_button ||
          b.free_text_on_none !== want.free_text_on_none) {
        errors.push('Grid block "' + name + '" has none_button=' + b.none_button +
                    ', free_text_on_none=' + b.free_text_on_none + '; expected ' +
                    want.none_button + ', ' + want.free_text_on_none + '.');
      }
    }

    // Set assignment: random_recorded, code 0 = A/B, code 1 = B/A.
    var sa = grid.set_assignment || {};
    if (sa.rule !== 'random_recorded') {
      errors.push('Grid set_assignment.rule is "' + sa.rule + '"; this code ' +
                  'implements only "random_recorded".');
    }
    if (Loader.gridSceneSet('episode', 0) !== 'A' || Loader.gridSceneSet('normal', 0) !== 'B' ||
        Loader.gridSceneSet('episode', 1) !== 'B' || Loader.gridSceneSet('normal', 1) !== 'A') {
      errors.push('Grid set_assignment does not map code 0 -> episode A / ' +
                  'normal B and code 1 -> episode B / normal A.');
    }

    // Layout constants must be the spec's.
    var lay = grid.layout || {};
    GRID_LAYOUT_KEYS.forEach(function (k) {
      if (lay[k] !== (CONFIG.grid || {})[k]) {
        errors.push('CONFIG.grid.' + k + ' is ' + (CONFIG.grid || {})[k] +
                    ' but the grid package layout says ' + lay[k] + '.');
      }
    });

    // Screens.
    var preSet = _pathSet(gridPre), usedImg = {}, missing = {};
    var scenesBySet = {};
    ['A', 'B'].forEach(function (setName) {
      var screens = (grid.sets || {})[setName];
      if (!Array.isArray(screens)) {
        errors.push('Grid package has no scene set ' + setName + '.');
        return;
      }
      if (screens.length !== EXPECTED_GRID_SCREENS) {
        errors.push('Grid set ' + setName + ' has ' + screens.length +
                    ' screens; ' + EXPECTED_GRID_SCREENS + ' expected.');
      }
      scenesBySet[setName] = {};
      var nums = screens.map(function (s) { return s.screen; });
      if (nums.join(',') !== nums.slice().sort(function (a, b) { return a - b; }).join(',')) {
        warnings.push('Grid set ' + setName + ' screens are not in screen ' +
                      'order in the file; they are shown sorted by `screen`.');
      }
      screens.forEach(function (sc) {
        var tag = 'Grid ' + setName + ' screen ' + sc.screen;
        if (sc.feature !== 'fog' && sc.feature !== 'colour') {
          errors.push(tag + ': feature is "' + sc.feature + '".');
        }
        if (sc.column_order !== 'forward' && sc.column_order !== 'reversed') {
          errors.push(tag + ': column_order is "' + sc.column_order + '".');
        }
        if (!Array.isArray(sc.columns) || !Array.isArray(sc.rows)) {
          errors.push(tag + ' has no columns or rows.');
          return;
        }
        sc.columns.forEach(function (c, ci) {
          ['display_column', 'column_label', 'level_index'].forEach(function (fld) {
            if (c[fld] === undefined) errors.push(tag + ': a column is missing "' + fld + '".');
          });
          // `columns` is already in display order; display_column must say so.
          if (c.display_column !== ci + 1) {
            errors.push(tag + ': column ' + (ci + 1) + ' has display_column ' +
                        c.display_column + '. columns must be listed in display order.');
          }
        });
        if (lay.rows_per_screen && sc.rows.length !== lay.rows_per_screen) {
          errors.push(tag + ' has ' + sc.rows.length + ' rows; layout says ' +
                      lay.rows_per_screen + '.');
        }
        sc.rows.forEach(function (r) {
          if (!r.scene_id) errors.push(tag + ': a row has no scene_id.');
          scenesBySet[setName][r.scene_id] = true;
          if (!Array.isArray(r.images) || r.images.length !== sc.columns.length) {
            errors.push(tag + ', row ' + r.row + ': ' +
                        (r.images ? r.images.length : 0) + ' images for ' +
                        sc.columns.length + ' columns.');
            return;
          }
          r.images.forEach(function (p) {
            usedImg[p] = true;
            if (!preSet[p]) missing[p] = true;
          });
        });
      });
    });

    // No photograph in both sets (the swap relies on it).
    if (scenesBySet.A && scenesBySet.B) {
      var both = Object.keys(scenesBySet.A).filter(function (k) { return scenesBySet.B[k]; });
      if (both.length) {
        errors.push('Scene(s) appear in both grid sets: ' + both.join(', '));
      }
    }

    var gm = Object.keys(missing);
    if (gm.length) {
      errors.push(gm.length + ' grid image(s) are not in grid/preload.json, ' +
                  'e.g. ' + gm.slice(0, 3).join(', '));
    }
    var gu = gridPre.filter(function (p) { return !usedImg[p]; });
    if (gu.length) {
      warnings.push(gu.length + ' image(s) in grid/preload.json are never shown.');
    }
  }

  function _result(errors, warnings, summary) {
    return {
      ok:       errors.length === 0,
      errors:   errors,
      warnings: warnings,
      summary:  summary,
    };
  }

  // -----------------------------------------------------------------------
  // Console report.
  // -----------------------------------------------------------------------
  function report(result) {
    console.log('%c[Validate] ' + (result.ok ? 'PASS' : 'FAIL'),
                'font-weight:bold;color:' + (result.ok ? '#1a7f37' : '#b3261e'));
    console.log('[Validate] summary:', result.summary);
    result.errors.forEach(function (e)   { console.error('  ERROR:   ' + e); });
    result.warnings.forEach(function (w) { console.warn ('  WARNING: ' + w); });
  }

  // -----------------------------------------------------------------------
  // On-screen report, used in debug mode when validation fails.
  // -----------------------------------------------------------------------
  function toHTML(result) {
    var html = '<div class="card"><h2>Validation failed</h2>' +
               '<p>The experiment did not start because the data files or ' +
               'settings are inconsistent. This screen appears only in debug ' +
               'mode.</p>' +
               '<div class="debug-box">';
    result.errors.forEach(function (e) {
      html += '<p class="fail">' + e + '</p>';
    });
    if (result.warnings.length) {
      html += '<hr>';
      result.warnings.forEach(function (w) { html += '<p>' + w + '</p>'; });
    }
    html += '</div></div>';
    return html;
  }

  return { run: run, report: report, toHTML: toHTML };
})();
