/* =========================================================================
 * phases/words.js — the descriptor rating task.
 *
 * TWO SCREENS
 *   1. Instructions, with a Continue button.
 *   2. The rating grid: a one-line question, then ten rows.
 *
 * Splitting them is what makes the grid fit without scrolling. The whole
 * grid must be visible at once, because the point of a single page is that
 * the participant can compare their answers across words — which they
 * cannot do if half the list is off-screen.
 *
 * WHY THE GRID IS HAND-BUILT
 * --------------------------
 * jsPsych's survey-likert emits a fixed structure — the word and its scale
 * in separate stacked blocks, with the scale labels repeated under every
 * row. That is ~180 px per word and cannot be compacted from CSS without
 * fighting the plugin. Here the markup is built directly: word on the left,
 * scale on the right, and the 0-6 legend printed ONCE in a header row.
 * That is the single biggest saving — nine repetitions of the legend
 * removed — and it also makes the chosen positions line up vertically, so
 * the pattern across words is readable at a glance.
 *
 * The control is still a radio button, not a slider. A slider has no empty
 * state: its handle starts somewhere, so a participant who never touches it
 * still submits a value and "rated 3" cannot be told from "skipped". Most
 * fillers SHOULD legitimately be rated 0, so a default-valued control would
 * silently inflate them.
 *
 * OUTPUT
 *   One row, block 'word_ratings': word_foggy, word_lifeless, ... plus
 *   word_order, word_range, word_mean, rt.
 *   record.js promotes the two targets to session-level columns
 *   (rating_foggy, rating_lifeless) so they sit on every trial row.
 * ========================================================================= */

var WordsPhase = (function () {

  var N_POINTS = 7;   // 0-6

  function words() {
    return (Loader.language() === 'ja') ? WORDS_JA : WORDS_EN;
  }

  // Fisher-Yates, so presentation order does not favour the targets.
  function _shuffled(items) {
    var a = items.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // -----------------------------------------------------------------------
  // The legend row: the numbers 0-6 once, with the endpoint wording under
  // the first and last only.
  // -----------------------------------------------------------------------
  function _headerHTML(W) {
    var cells = '';
    for (var i = 0; i < N_POINTS; i++) {
      var anchor = '';
      if (i === 0)                 anchor = '<span class="wr-anchor">' + W.anchor_low  + '</span>';
      else if (i === N_POINTS - 1) anchor = '<span class="wr-anchor">' + W.anchor_high + '</span>';
      cells += '<div class="wr-cell"><span class="wr-num">' + i + '</span>' + anchor + '</div>';
    }
    return '<div class="wr-row wr-header">' +
           '<div class="wr-word"></div>' +
           '<div class="wr-scale wr-scale-head">' + cells + '</div>' +
           '</div>';
  }

  function _rowHTML(item) {
    var cells = '';
    for (var i = 0; i < N_POINTS; i++) {
      cells +=
        '<div class="wr-cell">' +
        '<input type="radio" name="wr_' + item.id + '" value="' + i + '" ' +
        'id="wr_' + item.id + '_' + i + '" aria-label="' + i + '">' +
        '</div>';
    }
    return '<div class="wr-row" data-word="' + item.id + '">' +
           '<div class="wr-word">' + item.label + '</div>' +
           '<div class="wr-scale">' + cells + '</div>' +
           '</div>';
  }

  // -----------------------------------------------------------------------
  // Screen 1: instructions.
  // -----------------------------------------------------------------------
  function _instructionNode() {
    var W = words();
    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: '<div class="card word-intro"><h2>' + W.title + '</h2>' +
                W.instruction + '</div>',
      choices: [W.button_begin],
      data: { block: 'word_instructions' },
    };
  }

  // -----------------------------------------------------------------------
  // Screen 2: the grid.
  //
  // Built with call-function/async rather than a plugin, so the markup and
  // the enable-on-complete behaviour are under direct control.
  // -----------------------------------------------------------------------
  function _gridNode(jsPsych) {
    var W     = words();
    var order = _shuffled(W.items);

    return {
      type: jsPsychCallFunction,
      async: true,
      func: function (done) {
        var display = jsPsych.getDisplayElement();
        var t0 = performance.now();

        var rows = order.map(_rowHTML).join('');

        display.innerHTML =
          '<div class="wr-wrap">' +
          '<div class="wr-question">' + W.question_short + '</div>' +
          '<div class="wr-grid">' + _headerHTML(W) + rows + '</div>' +
          '<div class="wr-foot">' +
          '<span class="wr-progress" id="wr-progress"></span>' +
          '<button id="wr-submit" class="calib-btn" disabled>' +
          W.button_submit + '</button>' +
          '</div>' +
          '</div>';

        var submit   = document.getElementById('wr-submit');
        var progress = document.getElementById('wr-progress');

        function answered() {
          var n = 0;
          order.forEach(function (item) {
            if (display.querySelector('input[name="wr_' + item.id + '"]:checked')) n++;
          });
          return n;
        }

        function refresh() {
          var n = answered();
          progress.textContent = W.progress
            .replace('{DONE}', String(n))
            .replace('{TOTAL}', String(order.length));
          var complete = (n === order.length);
          submit.disabled = !complete;
          submit.style.opacity = complete ? '1' : '0.35';
          submit.style.cursor  = complete ? 'pointer' : 'not-allowed';
        }

        // Mark the row as answered, for the faint highlight.
        display.addEventListener('change', function (e) {
          if (e.target && e.target.type === 'radio') {
            var row = e.target.closest('.wr-row');
            if (row) row.classList.add('wr-done');
            refresh();
          }
        });

        refresh();

        submit.addEventListener('click', function () {
          var ratings = {};
          order.forEach(function (item) {
            var sel = display.querySelector('input[name="wr_' + item.id + '"]:checked');
            ratings[item.id] = sel ? parseInt(sel.value, 10) : null;
          });

          var vals = order.map(function (i) { return ratings[i.id]; })
                          .filter(function (v) { return v !== null; });

          var data = {
            block:      'word_ratings',
            word_order: order.map(function (i) { return i.id; }).join(','),
            rt:         Math.round(performance.now() - t0),
          };
          order.forEach(function (item) {
            data['word_' + item.id] = ratings[item.id];
          });

          // Someone who gives every word the same value is not describing
          // an experience, and their target ratings carry no information.
          data.word_range = vals.length
            ? Math.max.apply(null, vals) - Math.min.apply(null, vals) : null;
          data.word_mean = vals.length
            ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : null;

          jsPsych.data.write(data);
          Record.stampWordRatings(jsPsych, ratings);

          if (CONFIG.debug) {
            console.log('[Words] ratings:', ratings,
                        '| range:', data.word_range,
                        '| rt:', data.rt + 'ms');
          }

          display.innerHTML = '';
          done();
        }, { once: true });
      },
      data: { block: 'word_grid' },
    };
  }

  function buildNodes(jsPsych) {
    return [_instructionNode(), _gridNode(jsPsych)];
  }

  return { buildNodes: buildNodes, words: words };
})();
