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
 *                  when      choices + Other (with a field) + Prefer not to say
 *                  duration  choices + Other (with a field) + Prefer not to say
 *                  where     choices + Other (with a field) + Prefer not to say
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
 * Anything typed under "Other" is stored WITH the responses (on the
 * anchoring row). The consent text says so.
 *
 * OUTPUT
 *   One row, block 'anchoring'. On that row only, for participants:
 *     episode_when,     episode_when_other
 *     episode_duration, episode_duration_other
 *     episode_where,    episode_where_other
 *     episode_clarity
 *   episode_<q> is the chosen option's code ('past_month', ..., 'other',
 *   'prefer_not'), or empty if unanswered or switched off. episode_<q>_other
 *   is the typed text when 'other' was chosen, else empty. episode_clarity is
 *   0-6, 'prefer_not', or empty. Controls: all empty.
 * ========================================================================= */

var AnchoringPhase = (function () {

  // The questions are part of the participant version only.
  var QUESTION_GROUP = 'participant';
  var OTHER_MAX = 200;   // characters
  var CHOICE_QUESTIONS = ['when', 'duration', 'where'];
  var N_CLARITY = 7;     // 0-6

  function _on(name) {
    var q = (CONFIG.anchoring && CONFIG.anchoring.questions) || {};
    return q[name] !== false;
  }

  // One choice question: its options, then Other (with a field), then
  // Prefer not to say. Radio buttons, none pre-selected.
  function _choiceHTML(name, Q, A) {
    var opts = Q.options.map(function (o) {
      return '<label class="aq-opt"><input type="radio" name="aq_' + name + '" ' +
             'value="' + o.code + '"><span>' + o.label + '</span></label>';
    }).join('');
    return (
      '<fieldset class="aq" data-q="' + name + '">' +
      '<legend>' + Q.label + '</legend>' +
      '<div class="aq-opts">' + opts +
      '<label class="aq-opt aq-other"><input type="radio" name="aq_' + name + '" ' +
      'value="other"><span>' + A.other + '</span>' +
      '<input type="text" class="aq-other-text" id="aq_' + name + '_other" ' +
      'maxlength="' + OTHER_MAX + '" autocomplete="off"></label>' +
      '<label class="aq-opt"><input type="radio" name="aq_' + name + '" ' +
      'value="prefer_not"><span>' + A.prefer_not + '</span></label>' +
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
          CHOICE_QUESTIONS.forEach(function (name) {
            if (_on(name)) qs += _choiceHTML(name, A.questions[name], A);
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

        // Typing in an Other field selects Other.
        var others = display.querySelectorAll('.aq-other-text');
        for (var i = 0; i < others.length; i++) {
          others[i].addEventListener('input', function () {
            var radio = this.parentNode.querySelector('input[type="radio"]');
            if (radio && this.value.trim()) radio.checked = true;
          });
        }

        var btn = document.getElementById('anchoring-continue');
        btn.addEventListener('click', function () {
          result = {};
          CHOICE_QUESTIONS.forEach(function (name) {
            var v = (asks && _on(name)) ? _checked(display, name) : null;
            var t = null;
            if (v === 'other') {
              var f = document.getElementById('aq_' + name + '_other');
              t = f ? String(f.value || '').trim() : '';
            }
            result['episode_' + name] = v;
            result['episode_' + name + '_other'] = t;
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
