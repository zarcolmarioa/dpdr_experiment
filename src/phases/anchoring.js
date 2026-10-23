/* =========================================================================
 * phases/anchoring.js — the anchoring screen, just before the practice.
 *
 * It fixes what every later judgment is about, and it is one of the four
 * places where the two groups' wording differs:
 *
 *   participant  bring to mind your MOST RECENT episode that you remember
 *                clearly, in which the surroundings felt different from
 *                usual, and answer about that episode throughout. Then up to
 *                four short questions about it (CONFIG.anchoring.questions):
 *                  when      one short text field, example hint beside it
 *                  duration  one short text field, example hint beside it
 *                  where     one short text field, example hint beside it
 *                  clarity   0-6 + Prefer not to say
 *                None is required: Continue always works.
 *
 *   control      what derealization is, named and defined without visual
 *                words, and the instruction to imagine how the surroundings
 *                might look to someone experiencing it. NO questions —
 *                controls have no episode to describe.
 *
 * Wording: text/<lang>/instructions.js, section `anchoring`. Like every
 * instruction, it must not describe the experience with visual words, and
 * the questions ask only when, how long, where and how clearly — never how
 * it felt or looked. It does not mention any interview.
 *
 * Anything typed is stored WITH the responses (on the anchoring row). The
 * consent text says so.
 *
 * OUTPUT
 *   One row, block 'anchoring'. On that row only, for participants:
 *     episode_when, episode_duration, episode_where   the typed text
 *                                                     (trimmed), or empty if
 *                                                     left blank / switched off
 *     episode_clarity                                 0-6, 'prefer_not', or empty
 *   Controls: all empty.
 * ========================================================================= */

var AnchoringPhase = (function () {

  // The questions are part of the participant version only.
  var QUESTION_GROUP = 'participant';
  var TEXT_MAX = 200;    // characters
  var TEXT_QUESTIONS = ['when', 'duration', 'where'];
  var N_CLARITY = 7;     // 0-6

  function _on(name) {
    var q = (CONFIG.anchoring && CONFIG.anchoring.questions) || {};
    return q[name] !== false;
  }

  // One text question: the question, then a short field with an example
  // hint BESIDE it (not a placeholder, so it stays visible while typing).
  function _textHTML(name, Q) {
    return (
      '<fieldset class="aq" data-q="' + name + '">' +
      '<legend><label for="aq_' + name + '">' + Q.label + '</label></legend>' +
      '<div class="aq-field">' +
      '<input type="text" class="aq-text" id="aq_' + name + '" ' +
      'maxlength="' + TEXT_MAX + '" autocomplete="off">' +
      '<span class="aq-hint">' + Q.hint + '</span>' +
      '</div></fieldset>'
    );
  }

  // How clearly: 0-6 with the end labels, plus Prefer not to say.
  function _clarityHTML(Q, A) {
    var cells = '';
    for (var i = 0; i < N_CLARITY; i++) {
      cells += '<label class="aq-scale-pt"><input type="radio" name="aq_clarity" ' +
               'value="' + i + '"><span>' + i + '</span></label>';
    }
    return (
      '<fieldset class="aq" data-q="clarity">' +
      '<legend>' + Q.label + '</legend>' +
      '<div class="aq-scale">' +
      '<span class="aq-anchor">' + Q.anchor_low + '</span>' + cells +
      '<span class="aq-anchor">' + Q.anchor_high + '</span>' +
      '<label class="aq-opt"><input type="radio" ' +
      'name="aq_clarity" value="prefer_not"><span>' + A.prefer_not +
      '</span></label>' +
      '</div>' +
      '</fieldset>'
    );
  }

  function _checked(display, name) {
    var el = display.querySelector('input[name="aq_' + name + '"]:checked');
    return el ? el.value : null;
  }

  function buildNodes(jsPsych) {
    var result = null;

    return [{
      type: jsPsychCallFunction,
      async: true,
      func: function (done) {
        var A = Loader.text().anchoring;
        var asks = (Loader.group() === QUESTION_GROUP);
        var display = jsPsych.getDisplayElement();

        var qs = '';
        if (asks) {
          TEXT_QUESTIONS.forEach(function (name) {
            if (_on(name)) qs += _textHTML(name, A.questions[name]);
          });
          if (_on('clarity')) qs += _clarityHTML(A.questions.clarity, A);
        }

        display.innerHTML =
          '<div class="card anchoring-card">' +
          '<h2>' + A.title + '</h2>' +
          Loader.byGroup(A.body) +
          (qs ? '<p class="aq-intro">' + A.questions_intro + '</p>' +
                '<div class="aq-list">' + qs + '</div>' : '') +
          '<div class="btn-row">' +
          '<button id="anchoring-continue" class="calib-btn" type="button">' +
          A.button + '</button></div>' +
          '</div>';

        var btn = document.getElementById('anchoring-continue');
        btn.addEventListener('click', function () {
          result = {};
          TEXT_QUESTIONS.forEach(function (name) {
            var v = null;
            if (asks && _on(name)) {
              var f = document.getElementById('aq_' + name);
              v = f ? String(f.value || '').trim() : '';
              if (!v) v = null;          // left blank = empty, like unanswered
            }
            result['episode_' + name] = v;
          });
          var c = (asks && _on('clarity')) ? _checked(display, 'clarity') : null;
          result.episode_clarity = (c === null || c === 'prefer_not') ? c : parseInt(c, 10);

          if (CONFIG.debug) {
            console.log('[Anchoring] group ' + Loader.group() +
                        (asks ? ' | ' + JSON.stringify(result) : ''));
          }
          display.innerHTML = '';
          done();
        }, { once: true });
      },
      data: { block: 'anchoring' },
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
