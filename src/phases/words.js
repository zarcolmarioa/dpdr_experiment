/* =========================================================================
 * phases/words.js — the descriptor rating task.
 *
 * Ten words, each rated 0-6, on a single page. Runs BEFORE the image task.
 *
 * WHY RATINGS RATHER THAN A FORCED CHOICE
 * ---------------------------------------
 * Asking "which word best describes it?" yields one categorical label per
 * participant. Rating every word yields `rating_foggy` and
 * `rating_lifeless` as two CONTINUOUS predictors, which is what the
 * analysis needs: it asks whether a high foggy rating goes with a large
 * b_fog in the image task, and whether lifeless goes with b_sat. A person
 * can be high on both, low on both, or high on one — a forced choice
 * cannot represent that.
 *
 * WHY ONE PAGE RATHER THAN ONE WORD PER SCREEN
 * --------------------------------------------
 * Ratings are more consistent when the words can be compared against each
 * other. One-per-screen invites drift, where the same felt intensity gets
 * a 4 early and a 6 later.
 *
 * ORDER IS RANDOMISED per participant, because the first word anchors the
 * scale for the rest. The order shown is recorded.
 *
 * OUTPUT
 *   One row, block 'word_ratings', with a column per word: word_foggy,
 *   word_lifeless, ... plus word_order and rt.
 *   record.js additionally promotes the two targets to session-level
 *   columns (rating_foggy, rating_lifeless) so they sit on every trial row
 *   and the per-participant model needs no join.
 * ========================================================================= */

var WordsPhase = (function () {

  var N_POINTS = 7;   // 0-6

  // -----------------------------------------------------------------------
  // The active word list, matching CONFIG.language / ?lang=.
  // -----------------------------------------------------------------------
  function words() {
    return (Loader.language() === 'ja') ? WORDS_JA : WORDS_EN;
  }

  // -----------------------------------------------------------------------
  // Scale labels. Endpoints are named; the middle points are bare numbers,
  // so the scale reads as a continuum rather than as seven categories.
  // -----------------------------------------------------------------------
  function _labels(W) {
    var out = [];
    for (var i = 0; i < N_POINTS; i++) {
      if (i === 0)                out.push('0<br><span class="anchor">' + W.anchor_low  + '</span>');
      else if (i === N_POINTS - 1) out.push('6<br><span class="anchor">' + W.anchor_high + '</span>');
      else                         out.push(String(i));
    }
    return out;
  }

  // -----------------------------------------------------------------------
  // Fisher-Yates, so presentation order does not favour the targets.
  // -----------------------------------------------------------------------
  function _shuffled(items) {
    var a = items.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildNodes(jsPsych) {
    var W      = words();
    var order  = _shuffled(W.items);
    var labels = _labels(W);

    var questions = order.map(function (item) {
      return {
        prompt:   '<span class="word-item">' + item.label + '</span>',
        labels:   labels,
        required: true,
        name:     item.id,
      };
    });

    var node = {
      type: jsPsychSurveyLikert,
      preamble: '<div class="card word-preamble">' + W.instruction + '</div>',
      questions: questions,
      randomize_question_order: false,   // already shuffled, and recorded
      button_label: Loader.text().calibration.button_continue,
      data: {
        block:      'word_ratings',
        word_order: order.map(function (i) { return i.id; }).join(','),
      },
      on_finish: function (data) {
        // survey-likert returns {name: index}. The index IS the rating,
        // because the labels run 0-6 in order.
        var resp = data.response || {};
        var ratings = {};
        order.forEach(function (item) {
          var v = resp[item.id];
          data['word_' + item.id] = (v === undefined) ? null : v;
          ratings[item.id] = data['word_' + item.id];
        });

        // Flag a participant who used almost no range: if every word gets
        // the same value, the target ratings carry no information and the
        // between-participant analysis cannot use them.
        var vals = order.map(function (i) { return ratings[i.id]; })
                        .filter(function (v) { return v !== null; });
        var min = Math.min.apply(null, vals);
        var max = Math.max.apply(null, vals);
        data.word_range = (vals.length ? max - min : null);
        data.word_mean  = (vals.length
          ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length
          : null);

        Record.stampWordRatings(jsPsych, ratings);

        if (CONFIG.debug) {
          console.log('[Words] ratings:', ratings,
                      '| range:', data.word_range);
        }
      },
    };

    return [node];
  }

  return { buildNodes: buildNodes, words: words };
})();
