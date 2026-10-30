/* =========================================================================
 * phases/state.js — the state items, an optional block at the end.
 *
 * ONE SCREEN: the lead-in ("Right now, at this moment:"), then four items
 * from a published questionnaire (items 2, 13, 19 and 29), in a fixed
 * order, each on the same 0-6 scale as the word ratings, from "not at all"
 * (0) to "completely" (6). Radio buttons with no default answer; Continue
 * is enabled only when all four are answered.
 *
 * The screen is the word-rating grid (phases/rating-grid.js), so it looks
 * and behaves exactly like the word ratings.
 *
 * The item wording is a PLACEHOLDER in text/<lang>/instructions.js
 * (section `state`) until the exact published English and Japanese
 * wording is pasted in. validate.js warns while placeholders remain, and
 * refuses a production session (index.html, debug off) with them.
 *
 * Switch: CONFIG.blocks.state (default on). The same for both groups.
 *
 * OUTPUT
 *   One row, block 'state': state_q02, state_q13, state_q19, state_q29
 *   (0-6), and rt.
 * ========================================================================= */

var StatePhase = (function () {

  function buildNodes(jsPsych) {
    var result = null;

    return [{
      type: jsPsychCallFunction,
      async: true,
      func: function (done) {
        var S = Loader.text().state;
        var display = jsPsych.getDisplayElement();

        RatingGrid.render(display, {
          question:    S.lead_in,
          items:       S.items,            // fixed order, never shuffled
          anchor_low:  S.anchor_low,
          anchor_high: S.anchor_high,
          button:      S.button_submit,
          progress:    S.progress,
          wrapClass:   'wr-state',
        }, function (ratings, rt) {
          result = { rt: rt };
          S.items.forEach(function (item) {
            result['state_' + item.id] = ratings[item.id];
          });
          if (CONFIG.debug) console.log('[State]', result);
          display.innerHTML = '';
          done();
        });
      },
      data: { block: 'state' },
      on_finish: function (data) {
        if (!result) return;
        for (var k in result) {
          if (Object.prototype.hasOwnProperty.call(result, k)) data[k] = result[k];
        }
      },
    }];
  }

  return { buildNodes: buildNodes };
})();
