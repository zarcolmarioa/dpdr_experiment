/* =========================================================================
 * phases/consent.js — the consent screen, the FIRST screen of a session.
 *
 * Layout: the consent text, an "I agree" checkbox, and two buttons:
 *   "I agree, continue"  — enabled only once the box is ticked. Stamps
 *                          consent_given = true on every row and continues.
 *   "I do not agree"     — always enabled. Shows a short thank-you screen
 *                          and ends the session there. NOTHING is uploaded:
 *                          the session never reaches the save step, and the
 *                          contact screen (the only other upload) comes
 *                          later. No full screen, no image download either.
 *
 * The wording lives in text/<lang>/instructions.js, section `consent`. It
 * is a PLACEHOLDER until the approved text is pasted in; validate.js warns
 * while bracketed gaps remain, and refuses to start a production session
 * (index.html, debug off) with them.
 *
 * Switch: CONFIG.blocks.consent. index.html refuses to start with it off
 * (validate.js); only dev.html can skip it.
 *
 * OUTPUT
 *   One row, block 'consent', with consent_given.
 *   consent_given = true is also stamped on every row of the session.
 * ========================================================================= */

var ConsentPhase = (function () {

  var _declined = false;

  function declined() { return _declined; }

  function _consentNode(jsPsych) {
    var result = null;

    return {
      type: jsPsychCallFunction,
      async: true,
      func: function (done) {
        var C = Loader.text().consent;
        var display = jsPsych.getDisplayElement();

        display.innerHTML =
          '<div class="card consent-card">' +
          '<h2>' + C.title + '</h2>' +
          '<div class="consent-text">' + C.body + '</div>' +
          '<label class="check-line">' +
          '<input type="checkbox" id="consent-checkbox">' +
          '<span>' + C.checkbox + '</span>' +
          '</label>' +
          '<div class="btn-row consent-buttons">' +
          '<button id="consent-decline" class="calib-btn btn-secondary" type="button">' +
          C.button_decline + '</button>' +
          '<button id="consent-agree" class="calib-btn" type="button" disabled ' +
          'style="opacity:0.35; cursor:not-allowed;">' +
          C.button_agree + '</button>' +
          '</div>' +
          '</div>';

        var box     = document.getElementById('consent-checkbox');
        var agree   = document.getElementById('consent-agree');
        var decline = document.getElementById('consent-decline');
        var finished = false;

        box.addEventListener('change', function () {
          agree.disabled      = !box.checked;
          agree.style.opacity = box.checked ? '1' : '0.35';
          agree.style.cursor  = box.checked ? 'pointer' : 'not-allowed';
        });

        agree.addEventListener('click', function () {
          if (finished || !box.checked) return;
          finished = true;
          result = { consent_given: true };
          jsPsych.data.addProperties({ consent_given: true });
          if (CONFIG.debug) console.log('[Consent] given');
          display.innerHTML = '';
          done();
        });

        decline.addEventListener('click', function () {
          if (finished) return;
          finished = true;
          _declined = true;
          result = { consent_given: false };
          if (CONFIG.debug) console.log('[Consent] declined — session ends, nothing uploaded');
          display.innerHTML = '';
          done();
        });
      },
      data: { block: 'consent' },
      on_finish: function (data) {
        if (result) data.consent_given = result.consent_given;
      },
    };
  }

  // Shown only after "I do not agree". Waits for the page to be closed:
  // the timeline never moves on, so the save step is never reached.
  function _declinedNode() {
    return {
      timeline: [{
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function () {
          var C = Loader.text().consent;
          return '<div class="card"><h2>' + C.declined_title + '</h2>' +
                 C.declined_body + '</div>';
        },
        choices: 'NO_KEYS',
        data: { block: 'consent_declined' },
      }],
      conditional_function: function () { return _declined; },
    };
  }

  function buildNodes(jsPsych) {
    return [_consentNode(jsPsych), _declinedNode()];
  }

  return { buildNodes: buildNodes, declined: declined };
})();
