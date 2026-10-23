/* =========================================================================
 * grid.js — the two grid blocks, driven by the v4 grid package:
 *
 *     data/sets/<set>/grid/grid_trials.json   blocks, set_assignment,
 *                                             layout, and sets A and B
 *     data/sets/<set>/grid/preload.json       {"images": [...]}
 *     data/sets/<set>/grid/stimuli/*.png
 *     data/sets/<set>/grid/interface_spec.md  THE CONTRACT this file follows
 *
 * The grid is DESCRIPTIVE ONLY: nothing recorded here enters a registered
 * test.
 *
 * TWO BLOCKS (CONFIG.blocks.grid_episode / grid_normal, separately)
 *   episode   after the pair trials. "None of these" button; after a screen
 *             answered "None of these", an optional follow-up "Which comes
 *             closest?" with five position-based options
 *             (CONFIG.blocks.grid_none_followup). Question is
 *             group-dependent.
 *   normal    after the word ratings. No "None" button, so no follow-up.
 *             The same question for both groups.
 *
 * DEPARTURE FROM interface_spec.md, by design decision: the spec's free
 * text after "None of these" (free_text) is replaced by clickable options
 * (none_detail), so no open question — and no visual words — come just
 * before the word ratings. The package itself is unchanged.
 *
 * THE SET SWAP
 *   main.js draws set_code = 0 or 1 (p = .5) once at session start, stamps
 *   it on every row, and passes it here. From the package's set_assignment:
 *     code 0 -> episode block shows set A, normal block shows set B
 *     code 1 -> episode block shows set B, normal block shows set A
 *   so no photograph appears in both blocks.
 *
 * EACH BLOCK
 *   preload gate   (usually instant — main.js started the download early)
 *   instructions   (one short screen, adapted to the block)
 *   the set's 4 screens, in `screen` order. Nothing is shuffled.
 *
 * ONE SCREEN
 *   Rows are scenes, columns are levels of one change. `columns` in the
 *   file is ALREADY the display order (forward or reversed as shipped) and
 *   is drawn exactly as listed — never reversed again here. No labels,
 *   numbers or arrows. A click anywhere in a column selects the whole
 *   column. Continue is enabled once something is selected; the choice can
 *   be changed until then. Mouse only, no time limit.
 *
 * CELL SIZE
 *   ONE size per block, computed when the block starts, from the window and
 *   the WIDEST screen in the package (interface_spec.md):
 *     byWidth  = (innerWidth  - 48  - (cols-1)*22) / cols - 14
 *     byHeight = (innerHeight - 190 - (rows-1)*6)  / rows
 *     cell     = max(100, floor(min(byWidth, byHeight, 240)))
 *   The constants are CONFIG.grid, checked against the package's `layout`
 *   by validate.js. The computed size is recorded as cell_px.
 *
 * DATA — one row per screen, 4 per block, 8 per session. The fields of
 * interface_spec.md, with none_detail in place of free_text: block
 * ('episode' / 'normal'), set_code, scene_set, screen, feature,
 * column_order, scene_ids, chosen_display_column, chosen_level_index,
 * chose_none, none_detail (beyond_left / beyond_right / between /
 * other_way / cant_say, or empty), rt_ms, cell_px, inner_w, inner_h.
 * Level parameters and measured features are
 * NOT copied into the data: they are in grid_trials.csv, keyed by set,
 * screen, row and column. See DATA_DICTIONARY.md §8.
 * ========================================================================= */

var GridPhase = (function () {

  // -----------------------------------------------------------------------
  // Cell size from the window, for the widest screen in the package.
  // -----------------------------------------------------------------------
  function _computeCell() {
    var c = CONFIG.grid;
    var maxCols = 1, maxRows = 1;
    Loader.gridAllScreens().forEach(function (s) {
      maxCols = Math.max(maxCols, s.columns.length);
      maxRows = Math.max(maxRows, s.rows.length);
    });

    var byWidth  = (window.innerWidth - c.page_side_px - (maxCols - 1) * c.col_gap_px) /
                   maxCols - c.cell_chrome_px;
    var byHeight = (window.innerHeight - c.chrome_px - (maxRows - 1) * c.row_gap_px) /
                   maxRows;

    var px = Math.floor(Math.min(byWidth, byHeight, c.max_cell_px));
    return Math.max(px, c.min_cell_px);
  }

  // -----------------------------------------------------------------------
  // Markup for one screen. Columns are drawn in file order, which IS the
  // display order.
  // -----------------------------------------------------------------------
  function _screenHTML(screen, question, showNone, index, total, cellPx) {
    var T = Loader.text().grid;
    var c = CONFIG.grid;
    var cols = screen.columns.map(function (col, ci) {
      var cells = screen.rows.map(function (row) {
        return '<img class="grid-cell" draggable="false" alt="" src="' +
               Loader.gridImageURL(row.images[ci]) + '" style="width:' +
               cellPx + 'px;height:' + cellPx + 'px;">';
      }).join('');
      return '<div class="grid-col" data-col="' + ci + '" style="gap:' +
             c.row_gap_px + 'px;">' + cells + '</div>';
    }).join('');

    return (
      '<div class="grid-wrap">' +
      '<div class="stim-prompt grid-question">' + question + '</div>' +
      '<div class="grid-cols" style="gap:' + c.col_gap_px + 'px;">' + cols + '</div>' +
      '<div class="grid-foot">' +
      (showNone
        ? '<button id="grid-none" class="grid-none" type="button">' + T.none + '</button>'
        : '') +
      '<span class="grid-progress">' +
      T.progress.replace('{DONE}', String(index + 1))
                .replace('{TOTAL}', String(total)) +
      '</span>' +
      '<button id="grid-continue" class="calib-btn" type="button" disabled>' +
      T.button_continue + '</button>' +
      '</div>' +
      '</div>'
    );
  }

  // The follow-up shown after a screen answered "None of these" (episode
  // block, CONFIG.blocks.grid_none_followup): "Which comes closest?" with
  // five clickable options. They point to POSITIONS on the screen (far
  // left, far right, between), never to visual qualities, so nothing is
  // primed before the word ratings. Not required. It replaces the footer
  // under the (shrunk) grid, so the columns it refers to stay in view.
  // Recorded on the same row as none_detail.
  var FOLLOWUP_SHRINK = 0.75;

  function _followupHTML() {
    var T = Loader.text().grid;
    var opts = T.none_followup.options.map(function (o) {
      return '<label class="aq-opt"><input type="radio" name="grid_none_detail" ' +
             'value="' + o.code + '"><span>' + o.label + '</span></label>';
    }).join('');
    return (
      '<div class="grid-followup">' +
      '<div class="grid-followup-q">' + T.none_followup.question + '</div>' +
      '<div class="aq-opts grid-followup-opts">' + opts + '</div>' +
      '<button id="grid-followup-continue" class="calib-btn" type="button">' +
      T.none_followup.button + '</button>' +
      '</div>'
    );
  }

  // -----------------------------------------------------------------------
  // One screen as a call-function/async node. The result is copied onto
  // the node's own row in on_finish, so each screen is exactly one row.
  // -----------------------------------------------------------------------
  function _screenNode(jsPsych, ctx, screen, index, total) {
    var result = null;

    return {
      type: jsPsychCallFunction,
      async: true,
      func: function (done) {
        var display = jsPsych.getDisplayElement();
        if (ctx.cellPx === null) ctx.cellPx = _computeCell();

        var innerW = window.innerWidth, innerH = window.innerHeight;
        display.innerHTML = _screenHTML(screen, ctx.question, ctx.showNone,
                                        index, total, ctx.cellPx);

        var t0       = performance.now();
        var colsEls  = display.querySelectorAll('.grid-col');
        var noneBtn  = document.getElementById('grid-none');   // null in 'normal'
        var contBtn  = document.getElementById('grid-continue');
        var choice   = null;        // column index (0-based), or 'none'

        function paint() {
          for (var i = 0; i < colsEls.length; i++) {
            colsEls[i].classList.toggle('selected', choice === i);
          }
          if (noneBtn) noneBtn.classList.toggle('selected', choice === 'none');
          var on = (choice !== null);
          contBtn.disabled = !on;
          contBtn.style.opacity = on ? '1' : '0.35';
          contBtn.style.cursor  = on ? 'pointer' : 'not-allowed';
        }

        function select(value) {
          choice = value;
          paint();
        }

        for (var i = 0; i < colsEls.length; i++) {
          colsEls[i].addEventListener('click', function () {
            select(parseInt(this.getAttribute('data-col'), 10));
          });
        }
        if (noneBtn) noneBtn.addEventListener('click', function () { select('none'); });
        paint();

        function finish(detail) {
          result.none_detail = detail;
          if (CONFIG.debug) {
            console.log('[Grid] ' + ctx.block + ' ' + ctx.sceneSet + ' screen ' +
                        screen.screen + ' (' + screen.feature + ', ' +
                        screen.column_order + '): ' +
                        (result.chose_none ? 'none' : 'column ' +
                         result.chosen_display_column + ' = level ' +
                         result.chosen_level_index) +
                        (detail ? ' | closest: ' + detail : '') +
                        ' | cell ' + ctx.cellPx + 'px | ' + result.rt_ms + 'ms');
          }
          display.innerHTML = '';
          done();
        }

        contBtn.addEventListener('click', function () {
          if (choice === null) return;
          var rt = Math.round(performance.now() - t0);
          var none = (choice === 'none');
          var col  = none ? null : screen.columns[choice];

          result = {
            block:                 ctx.block,
            set_code:              ctx.setCode,
            scene_set:             ctx.sceneSet,
            screen:                screen.screen,
            feature:               screen.feature,
            column_order:          screen.column_order,
            scene_ids:             screen.rows.map(function (r) { return r.scene_id; }).join(';'),
            // 1-based position AS DISPLAYED (= the column's display_column).
            chosen_display_column: none ? null : choice + 1,
            chosen_level_index:    none ? null : col.level_index,
            chose_none:            none,
            none_detail:           null,
            rt_ms:                 rt,
            cell_px:               ctx.cellPx,
            inner_w:               innerW,
            inner_h:               innerH,
          };

          // "None of these" -> the optional follow-up, on the same row. The
          // grid stays in view, shrunk and no longer clickable, and the
          // footer is replaced by the question.
          if (none && ctx.followUp) {
            var small = Math.floor(ctx.cellPx * FOLLOWUP_SHRINK);
            var cells = display.querySelectorAll('.grid-cell');
            for (var c = 0; c < cells.length; c++) {
              cells[c].style.width = small + 'px';
              cells[c].style.height = small + 'px';
            }
            var colsWrap = display.querySelector('.grid-cols');
            if (colsWrap) colsWrap.classList.add('grid-cols-inert');
            for (var s = 0; s < colsEls.length; s++) colsEls[s].classList.remove('selected');
            var foot = display.querySelector('.grid-foot');
            if (foot) foot.outerHTML = _followupHTML();
            document.getElementById('grid-followup-continue').addEventListener('click', function () {
              var sel = display.querySelector('input[name="grid_none_detail"]:checked');
              finish(sel ? sel.value : null);
            }, { once: true });
            return;
          }
          finish(null);
        }, { once: true });
      },
      data: { block: ctx.block },
      on_finish: function (data) {
        if (!result) return;
        for (var k in result) {
          if (Object.prototype.hasOwnProperty.call(result, k)) data[k] = result[k];
        }
      },
    };
  }

  function _instructionNode(blockName) {
    var T = Loader.text().grid;
    var B = T[blockName];
    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: '<div class="card"><h2>' + B.title + '</h2>' +
                B.instructions + '</div>',
      choices: [T.button_begin],
      data: { block: 'grid_instructions_' + blockName },
    };
  }

  function _preloadGate(blockName, urls) {
    var T = Loader.text();
    return {
      type: jsPsychPreload,
      images: urls,
      message: T.preload.message,
      show_progress_bar: true,
      continue_after_error: false,
      error_message: T.preload.error,
      max_load_time: 300000,
      data: { block: 'grid_preload_' + blockName },
    };
  }

  // -----------------------------------------------------------------------
  // Build ONE block: 'episode' or 'normal', for this session's set_code.
  // -----------------------------------------------------------------------
  function buildNodes(jsPsych, blockName, setCode) {
    if (!Loader.hasGrid()) {
      console.warn('[Grid] no grid package loaded — ' + blockName + ' block skipped.');
      return [];
    }

    var def      = Loader.gridBlock(blockName) || {};
    var sceneSet = Loader.gridSceneSet(blockName, setCode);
    var screens  = Loader.gridScreens(sceneSet);
    var T        = Loader.text().grid;

    var ctx = {
      block:    blockName,
      setCode:  setCode,
      sceneSet: sceneSet,
      showNone: !!def.none_button,
      followUp: !!def.none_button && !!CONFIG.blocks.grid_none_followup,
      question: (blockName === 'episode')
                ? Loader.byGroup(T.question_episode)
                : T.question_normal,
      cellPx:   null,    // computed when the block's first screen starts
    };

    if (CONFIG.debug) {
      console.log('[Grid] ' + blockName + ' block: set_code ' + setCode +
                  ' -> scene set ' + sceneSet + ', ' + screens.length + ' screens');
    }

    var urls = {};
    screens.forEach(function (s) {
      s.rows.forEach(function (r) {
        r.images.forEach(function (p) { urls[Loader.gridImageURL(p)] = true; });
      });
    });

    var nodes = [_preloadGate(blockName, Object.keys(urls)),
                 _instructionNode(blockName)];
    screens.forEach(function (s, i) {
      nodes.push(_screenNode(jsPsych, ctx, s, i, screens.length));
    });
    return nodes;
  }

  return { buildNodes: buildNodes, computeCell: _computeCell };
})();
