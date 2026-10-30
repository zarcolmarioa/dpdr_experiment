/* =========================================================================
 * phases/rating-grid.js — the hand-built 0-6 rating grid, shared by the
 * word ratings (phases/words.js) and the state items (phases/state.js).
 *
 * WHY THE GRID IS HAND-BUILT
 * --------------------------
 * jsPsych's survey-likert emits a fixed structure — the item and its scale
 * in separate stacked blocks, with the scale labels repeated under every
 * row. That is ~180 px per item and cannot be compacted from CSS without
 * fighting the plugin. Here the markup is built directly: item on the left,
 * scale on the right, and the 0-6 legend printed ONCE in a header row.
 * That is the single biggest saving, and it also makes the chosen
 * positions line up vertically, so the pattern across items is readable at
 * a glance.
 *
 * The control is a radio button, not a slider. A slider has no empty
 * state: its handle starts somewhere, so a participant who never touches it
 * still submits a value and "rated 3" cannot be told from "skipped". There
 * is NO default answer, and Continue stays disabled until every row is
 * answered.
 *
 * This module only draws the screen and collects the answers. What is
 * recorded, and where, is up to the caller.
 * ========================================================================= */

var RatingGrid = (function () {

  var N_POINTS = 7;   // 0-6

  // -----------------------------------------------------------------------
  // The legend row: the numbers 0-6 once, with the endpoint wording under
  // the first and last only.
  // -----------------------------------------------------------------------
  function _headerHTML(spec) {
    var cells = '';
    for (var i = 0; i < N_POINTS; i++) {
      var anchor = '';
      if (i === 0)                 anchor = '<span class="wr-anchor">' + spec.anchor_low  + '</span>';
      else if (i === N_POINTS - 1) anchor = '<span class="wr-anchor">' + spec.anchor_high + '</span>';
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
  // Draw the grid into `display` and call onSubmit(ratings, rtMs) when
  // Continue is pressed. `ratings` maps item id -> 0..6.
  //
  // spec:
  //   question     one line above the grid (HTML)
  //   items        [{id, label}], in the order to show
  //   anchor_low, anchor_high   the endpoint wording under 0 and 6
  //   button       Continue label
  //   progress     e.g. '{DONE} of {TOTAL} rated'
  //   wrapClass    optional extra class on the wrapper (layout variants)
  // -----------------------------------------------------------------------
  function render(display, spec, onSubmit) {
    var items = spec.items;
    var t0 = performance.now();

    display.innerHTML =
      '<div class="wr-wrap' + (spec.wrapClass ? ' ' + spec.wrapClass : '') + '">' +
      '<div class="wr-question">' + spec.question + '</div>' +
      '<div class="wr-grid">' + _headerHTML(spec) + items.map(_rowHTML).join('') + '</div>' +
      '<div class="wr-foot">' +
      '<span class="wr-progress" id="wr-progress"></span>' +
      '<button id="wr-submit" class="calib-btn" disabled>' +
      spec.button + '</button>' +
      '</div>' +
      '</div>';

    var submit   = document.getElementById('wr-submit');
    var progress = document.getElementById('wr-progress');

    function answered() {
      var n = 0;
      items.forEach(function (item) {
        if (display.querySelector('input[name="wr_' + item.id + '"]:checked')) n++;
      });
      return n;
    }

    function refresh() {
      var n = answered();
      progress.textContent = spec.progress
        .replace('{DONE}', String(n))
        .replace('{TOTAL}', String(items.length));
      var complete = (n === items.length);
      submit.disabled = !complete;
      submit.style.opacity = complete ? '1' : '0.35';
      submit.style.cursor  = complete ? 'pointer' : 'not-allowed';
    }

    // Mark the row as answered, for the faint highlight.
    function onChange(e) {
      if (e.target && e.target.type === 'radio') {
        var row = e.target.closest('.wr-row');
        if (row) row.classList.add('wr-done');
        refresh();
      }
    }
    display.addEventListener('change', onChange);

    refresh();

    var submitted = false;
    submit.addEventListener('click', function () {
      if (submitted || answered() !== items.length) return;
      submitted = true;
      var ratings = {};
      items.forEach(function (item) {
        var sel = display.querySelector('input[name="wr_' + item.id + '"]:checked');
        ratings[item.id] = sel ? parseInt(sel.value, 10) : null;
      });
      display.removeEventListener('change', onChange);
      onSubmit(ratings, Math.round(performance.now() - t0));
    });
  }

  return { render: render, N_POINTS: N_POINTS };
})();
