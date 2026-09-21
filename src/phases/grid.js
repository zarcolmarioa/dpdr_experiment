/* =========================================================================
 * grid.js — the grid block, run after the pairwise trials.
 *
 * Driven entirely by the active set's grid files:
 *
 *     data/sets/<set>/grid/grid_trials.json   one record per screen
 *     data/sets/<set>/grid/preload.json       every image those use
 *     data/sets/<set>/grid/stimuli/*.png
 *
 * Only sets listed in CONFIG.data.grid_sets have a grid. For any other set
 * the block is skipped silently, so adding a grid to a set later means
 * dropping its files in place and adding its name to that list.
 *
 * STRUCTURE
 *   preload gate   (usually instant — main.js started the download early)
 *   instructions
 *   one screen per record, in FILE ORDER. Nothing is shuffled here: screen
 *   order and column direction (forward / reversed) are set in the file.
 *   optional free-text question — coded but OFF (CONFIG.blocks.grid_none_text)
 *
 * ONE SCREEN
 *   Rows are scenes, columns are levels of one change. No labels, numbers
 *   or arrows. Clicking anywhere in a column selects the whole column.
 *   "None of these" is a separate button underneath. Continue is enabled
 *   once something is selected; the choice can be changed until then.
 *   Mouse only, no time limit.
 *
 * CELL SIZE
 *   Computed once per session from the viewport, so every screen uses the
 *   same size, and computed for the WIDEST screen in the file, so a 5-column
 *   screen is not shown larger than a 6-column one. Capped at
 *   CONFIG.grid.max_cell_px. It is NOT fixed like the pair panels — six
 *   columns of 512 px cannot fit any laptop — so the rendered size is
 *   recorded on every row (grid_cell_px) as a covariate.
 *
 * DATA — one row per screen, block = 'grid'. See DATA_DICTIONARY.md §7b.
 * ========================================================================= */

var GridPhase = (function () {

  var _cellPx      = null;   // computed once, reused on every screen
  var _anyNone     = false;  // drives the (inactive) free-text question

  function _cfg() {
    var g = CONFIG.grid || {};
    return {
      max_cell_px: g.max_cell_px || 240,
      min_cell_px: g.min_cell_px || 100,
      row_gap_px:  g.row_gap_px  || 6,
      col_gap_px:  g.col_gap_px  || 22,
      chrome_px:   g.chrome_px   || 190,   // question + buttons + margins
    };
  }

  // -----------------------------------------------------------------------
  // Cell size from the viewport, for the widest screen in the file.
  // -----------------------------------------------------------------------
  function _computeCell(screens) {
    var c = _cfg();
    var maxCols = 1, maxRows = 1;
    screens.forEach(function (s) {
      maxCols = Math.max(maxCols, s.columns.length);
      maxRows = Math.max(maxRows, s.rows.length);
    });

    // Each column carries 2 x (3 px border + 4 px padding) of its own.
    var colChrome = 14;
    var byWidth  = (window.innerWidth - 48 - (maxCols - 1) * c.col_gap_px) / maxCols - colChrome;
    var byHeight = (window.innerHeight - c.chrome_px - (maxRows - 1) * c.row_gap_px) / maxRows;

    var px = Math.floor(Math.min(byWidth, byHeight, c.max_cell_px));
    return Math.max(px, c.min_cell_px);
  }

  // -----------------------------------------------------------------------
  // Markup for one screen.
  // -----------------------------------------------------------------------
  function _screenHTML(screen, T, index, total) {
    var c = _cfg();
    var cols = screen.columns.map(function (col, ci) {
      var cells = screen.rows.map(function (row) {
        return '<img class="grid-cell" draggable="false" alt="" src="' +
               Loader.gridImageURL(row.images[ci]) + '" style="width:' +
               _cellPx + 'px;height:' + _cellPx + 'px;">';
      }).join('');
      return '<div class="grid-col" data-col="' + ci + '" style="gap:' +
             c.row_gap_px + 'px;">' + cells + '</div>';
    }).join('');

    return (
      '<div class="grid-wrap">' +
      '<div class="stim-prompt grid-question">' + T.grid.question + '</div>' +
      '<div class="grid-cols" style="gap:' + c.col_gap_px + 'px;">' + cols + '</div>' +
      '<div class="grid-foot">' +
      '<button id="grid-none" class="grid-none" type="button">' + T.grid.none + '</button>' +
      '<span class="grid-progress">' +
      T.grid.progress.replace('{DONE}', String(index + 1))
                     .replace('{TOTAL}', String(total)) +
      '</span>' +
      '<button id="grid-continue" class="calib-btn" type="button" disabled>' +
      T.grid.button_continue + '</button>' +
      '</div>' +
      '</div>'
    );
  }

  // -----------------------------------------------------------------------
  // One screen as a call-function/async node. The result is copied onto
  // the node's own row in on_finish, so each screen is exactly one row.
  // -----------------------------------------------------------------------
  function _screenNode(jsPsych, screen, index, total) {
    var result = null;

    return {
      type: jsPsychCallFunction,
      async: true,
      func: function (done) {
        var T = Loader.text();
        var display = jsPsych.getDisplayElement();
        var screens = Loader.grid();
        if (_cellPx === null) _cellPx = _computeCell(screens);

        display.innerHTML = _screenHTML(screen, T, index, total);

        var t0       = performance.now();
        var colsEls  = display.querySelectorAll('.grid-col');
        var noneBtn  = document.getElementById('grid-none');
        var contBtn  = document.getElementById('grid-continue');
        var choice   = null;        // column index (0-based), or 'none'
        var nChanges = 0;

        function paint() {
          for (var i = 0; i < colsEls.length; i++) {
            colsEls[i].classList.toggle('selected', choice === i);
          }
          noneBtn.classList.toggle('selected', choice === 'none');
          var on = (choice !== null);
          contBtn.disabled = !on;
          contBtn.style.opacity = on ? '1' : '0.35';
          contBtn.style.cursor  = on ? 'pointer' : 'not-allowed';
        }

        function select(value) {
          if (choice === value) return;
          if (choice !== null) nChanges++;
          choice = value;
          paint();
        }

        for (var i = 0; i < colsEls.length; i++) {
          colsEls[i].addEventListener('click', function () {
            select(parseInt(this.getAttribute('data-col'), 10));
          });
        }
        noneBtn.addEventListener('click', function () { select('none'); });
        paint();

        contBtn.addEventListener('click', function () {
          if (choice === null) return;
          var rt = Math.round(performance.now() - t0);

          // Rendered size, measured rather than assumed.
          var img = display.querySelector('.grid-cell');
          var measured = img ? Math.round(img.getBoundingClientRect().width) : null;

          var col = (choice === 'none') ? null : screen.columns[choice];
          if (choice === 'none') _anyNone = true;

          result = {
            block:                   'grid',
            analysed:                false,
            grid_screen:             screen.screen,
            grid_screen_position:    index + 1,
            grid_feature:            screen.feature,
            grid_column_order:       screen.column_order,
            grid_n_columns:          screen.columns.length,
            grid_choice:             (choice === 'none') ? 'none' : 'column',
            grid_choice_column:      col ? col.column : null,
            grid_choice_level_index: col ? col.level_index : null,
            grid_choice_level_label: col ? col.level_label : null,
            grid_choice_chroma:      col ? col.chroma : null,
            grid_choice_haze:        col ? col.haze : null,
            grid_scenes:             screen.rows.map(function (r) { return r.scene_id; }).join(';'),
            grid_n_changes:          nChanges,
            grid_cell_px:            measured,
            grid_viewport:           window.innerWidth + 'x' + window.innerHeight,
            rt:                      rt,
          };

          if (CONFIG.debug) {
            console.log('[Grid] screen ' + screen.screen + ' (' + screen.feature +
                        ', ' + screen.column_order + '): ' +
                        (col ? 'column ' + col.column + ' = ' + col.level_label : 'none') +
                        ' | changes ' + nChanges + ' | cell ' + measured + 'px | ' + rt + 'ms');
          }

          display.innerHTML = '';
          done();
        }, { once: true });
      },
      data: { block: 'grid' },
      on_finish: function (data) {
        if (!result) return;
        for (var k in result) {
          if (Object.prototype.hasOwnProperty.call(result, k)) data[k] = result[k];
        }
      },
    };
  }

  // -----------------------------------------------------------------------
  // Free-text follow-up. Built but OFF: runs only if
  // CONFIG.blocks.grid_none_text is true AND "None of these" was chosen on
  // at least one screen. Optional — may be left blank.
  // -----------------------------------------------------------------------
  function _noneTextNode() {
    var T = Loader.text();
    return {
      timeline: [{
        type: jsPsychSurveyText,
        questions: [{
          prompt: T.grid.none_text_prompt,
          name: 'grid_none_text',
          rows: 4,
          columns: 60,
          required: false,
        }],
        button_label: T.grid.none_text_button,
        data: { block: 'grid_none_text', analysed: false },
        on_finish: function (data) {
          var r = data.response || {};
          data.grid_none_text = (r.grid_none_text || '').trim();
        },
      }],
      conditional_function: function () {
        return !!CONFIG.blocks.grid_none_text && _anyNone;
      },
    };
  }

  function _instructionNode() {
    var T = Loader.text();
    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: '<div class="card"><h2>' + T.grid.title + '</h2>' +
                T.grid.instructions + '</div>',
      choices: [T.grid.button_begin],
      data: { block: 'grid_instructions' },
    };
  }

  function _preloadGate() {
    var T = Loader.text();
    return {
      type: jsPsychPreload,
      images: Loader.gridPreloadURLs(),
      message: T.preload.message,
      show_progress_bar: true,
      continue_after_error: false,
      error_message: T.preload.error,
      max_load_time: 300000,
      data: { block: 'grid_preload' },
    };
  }

  // -----------------------------------------------------------------------
  // Build the block. Returns [] when the active set has no grid.
  // -----------------------------------------------------------------------
  function buildNodes(jsPsych) {
    var screens = Loader.grid();
    if (!screens || !screens.length) {
      if (CONFIG.debug) {
        console.log('[Grid] no grid for set "' + Loader.stimulusSet() +
                    '" — block skipped.');
      }
      return [];
    }

    var nodes = [_preloadGate(), _instructionNode()];
    screens.forEach(function (s, i) {
      nodes.push(_screenNode(jsPsych, s, i, screens.length));
    });
    nodes.push(_noneTextNode());
    return nodes;
  }

  return { buildNodes: buildNodes };
})();
