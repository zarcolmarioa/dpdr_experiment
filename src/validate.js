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
 * What is NOT checked here: whether the image files actually exist on the
 * server. That would need 227 HTTP requests. The preload step does it
 * instead, and reports any that 404.
 * ========================================================================= */

var Validate = (function () {

  var REQUIRED_FIELDS = [
    'trial', 'trial_type', 'analysed', 'scene_id', 'category',
    'left_path', 'right_path', 'a_is_left',
    'd_sat', 'd_fog', 'z_sat', 'z_fog', 'mag_bin',
  ];

  // Counts build_trials.py is expected to produce. A mismatch usually means
  // the trial list was regenerated with different parameters.
  var EXPECTED_COUNTS = {
    practice:     6,
    sat_only:    40,
    fog_only:    40,
    together:    20,
    conflict:    20,
    consistency: 11,
    catch:        6,
  };

  function _pathSet(list) {
    var s = {};
    for (var i = 0; i < list.length; i++) s[list[i]] = true;
    return s;
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
      errors.push('preload.json is empty or not an array.');
      return _result(errors, warnings, {});
    }

    // --- Required fields present on every row ----------------------------
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

    // --- Type counts -----------------------------------------------------
    var counts = {};
    trials.forEach(function (t) {
      counts[t.trial_type] = (counts[t.trial_type] || 0) + 1;
    });
    for (var type in EXPECTED_COUNTS) {
      var got = counts[type] || 0;
      if (got !== EXPECTED_COUNTS[type]) {
        warnings.push('Expected ' + EXPECTED_COUNTS[type] + ' "' + type +
                      '" trials, found ' + got + '.');
      }
    }

    // --- Every referenced image is in preload.json -----------------------
    var preloadSet = _pathSet(preload);
    var notPreloaded = {};
    trials.forEach(function (t) {
      [t.left_path, t.right_path].forEach(function (p) {
        if (!preloadSet[p]) notPreloaded[p] = true;
      });
    });
    var npKeys = Object.keys(notPreloaded);
    if (npKeys.length) {
      errors.push(npKeys.length + ' image(s) referenced by trials are not in ' +
                  'preload.json, e.g. ' + npKeys.slice(0, 3).join(', '));
    }

    // Unused preload entries are harmless but usually mean the two files
    // came from different runs of build_trials.py.
    var used = {};
    trials.forEach(function (t) { used[t.left_path] = true; used[t.right_path] = true; });
    var unused = preload.filter(function (p) { return !used[p]; });
    if (unused.length) {
      warnings.push(unused.length + ' image(s) in preload.json are never ' +
                    'shown. trial_list.json and preload.json may be out of step.');
    }

    // --- a_is_left is a real boolean -------------------------------------
    var badAIL = trials.filter(function (t) { return typeof t.a_is_left !== 'boolean'; });
    if (badAIL.length) {
      errors.push(badAIL.length + ' trial(s) have a non-boolean a_is_left. ' +
                  'The analysis cannot map side to choice without it.');
    }

    // --- Catch trials ----------------------------------------------------
    var catches = trials.filter(function (t) { return t.trial_type === 'catch'; });
    catches.forEach(function (t) {
      if (t.correct_response !== 'left' && t.correct_response !== 'right') {
        errors.push('Catch trial ' + t.trial + ' has correct_response "' +
                    t.correct_response + '" (expected "left" or "right").');
      }
    });
    // correct_response should appear nowhere else.
    var strayCR = trials.filter(function (t) {
      return t.trial_type !== 'catch' &&
             t.correct_response !== null && t.correct_response !== undefined;
    });
    if (strayCR.length) {
      warnings.push(strayCR.length + ' non-catch trial(s) carry a ' +
                    'correct_response. They would be scored as catch trials.');
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
      var origNum = Math.round(t.repeat_of);   // stored as float via pandas
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

    // --- Text files have matching keys ------------------------------------
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

    // --- Summary ---------------------------------------------------------
    var summary = {
      trials:       trials.length,
      analysed:     trials.filter(function (t) { return t.analysed; }).length,
      images:       preload.length,
      scenes:       Object.keys(trials.reduce(function (a, t) {
                      a[t.scene_id] = 1; return a;
                    }, {})).length,
      counts:       counts,
      language:     Loader.language(),
    };

    return _result(errors, warnings, summary);
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
               '<p>The experiment did not start because the data files are ' +
               'inconsistent. This screen appears only in debug mode.</p>' +
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
