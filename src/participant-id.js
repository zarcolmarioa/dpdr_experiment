/* =========================================================================
 * participant-id.js — establishes who is running the session.
 *
 * Order of preference:
 *   1. ?pid=R_... in the URL  (mail-merged invitation link)
 *   2. typed entry            (the same ID is printed in the email)
 *
 * The ID links the session back to the participant's existing CDS-29 score.
 * A session without a valid ID cannot be linked and is therefore unusable,
 * so there is no "skip" option — only a "contact the researcher" exit.
 * ========================================================================= */

var ParticipantID = (function () {

  var _id         = null;
  var _superuser  = false;

  function get()         { return _id; }
  function isSuperuser() { return _superuser; }

  // -----------------------------------------------------------------------
  // Read ?pid= from the URL. Entirely client-side: the query string is never
  // processed by the server, so this works identically on GitHub Pages,
  // Pavlovia, or a file opened from disk.
  // -----------------------------------------------------------------------
  function fromURL() {
    var params = new URLSearchParams(window.location.search);
    var raw = params.get('pid');
    return raw ? normalise(raw) : null;
  }

  // -----------------------------------------------------------------------
  // Clean up what was typed or pasted. Whitespace is stripped and a pasted
  // 'pid=' prefix is removed. Case is deliberately NOT touched: these IDs
  // are case-sensitive.
  // -----------------------------------------------------------------------
  function normalise(raw) {
    return String(raw)
      .trim()
      .replace(/^\??pid=/i, '')
      .replace(/\s+/g, '');
  }

  function isValid(candidate) {
    if (!candidate) return false;
    if (candidate === CONFIG.participant.superuser_id) return true;
    return new RegExp(CONFIG.participant.id_pattern).test(candidate);
  }

  function accept(candidate) {
    _id = candidate;
    _superuser = (candidate === CONFIG.participant.superuser_id);
    if (_superuser) {
      console.log('[ID] Superuser session — rows flagged is_test = true.');
    }
    return _id;
  }

  // -----------------------------------------------------------------------
  // Timeline nodes for establishing the ID.
  //
  // If the URL carried a valid ID, one confirmation screen is shown.
  // Otherwise a typed-entry screen loops until a valid ID is given.
  // -----------------------------------------------------------------------
  function buildNodes(jsPsych) {
    var nodes = [];
    var urlId = fromURL();

    if (urlId && isValid(urlId)) {
      accept(urlId);
      nodes.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus:
          '<div class="card">' +
          '<h2>Before we begin</h2>' +
          '<p>Your participant ID is:</p>' +
          '<p class="id-echo">' + urlId + '</p>' +
          '<p>If this is correct, press <b>SPACE</b> to continue.<br>' +
          'If not, please close this page and contact the researcher.</p>' +
          '</div>',
        choices: [' '],
        data: { block: 'participant_id', id_source: 'url' },
      });
      return nodes;
    }

    if (!CONFIG.participant.allow_manual_id) {
      nodes.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus:
          '<div class="card">' +
          '<h2>Missing participant ID</h2>' +
          '<p>This link is incomplete. Please use the full link from your ' +
          'invitation email, or contact the researcher.</p>' +
          '</div>',
        choices: 'NO_KEYS',
        data: { block: 'participant_id', id_source: 'missing' },
      });
      return nodes;
    }

    // Typed entry, repeated until valid.
    var entry = {
      type: jsPsychSurveyText,
      preamble:
        '<div class="card">' +
        '<h2>Participant ID</h2>' +
        '<p>Please enter the participant ID from your invitation email.</p>' +
        '<p class="hint">It looks like <code>R_</code> followed by 15 ' +
        'letters and numbers. Capital and small letters matter.</p>' +
        '</div>',
      questions: [{ prompt: 'Participant ID', name: 'pid', required: true, columns: 30 }],
      data: { block: 'participant_id', id_source: 'typed' },
      on_finish: function (data) {
        var candidate = normalise(data.response.pid);
        data.id_valid = isValid(candidate);
        data.id_entered = candidate;
        if (data.id_valid) accept(candidate);
      },
    };

    // Shown only when the entry above was rejected.
    var retry = {
      timeline: [{
        type: jsPsychHtmlKeyboardResponse,
        stimulus:
          '<div class="card">' +
          '<h2>That ID was not recognised</h2>' +
          '<p>Please check your invitation email and try again.</p>' +
          '<p>Press <b>SPACE</b> to re-enter it.</p>' +
          '</div>',
        choices: [' '],
        data: { block: 'participant_id_retry' },
      }],
      conditional_function: function () {
        return _id === null;   // nothing accepted yet
      },
    };

    nodes.push({
      timeline: [entry, retry],
      loop_function: function () {
        return _id === null;   // keep looping until an ID is accepted
      },
    });

    return nodes;
  }

  return {
    get:         get,
    isSuperuser: isSuperuser,
    isValid:     isValid,
    normalise:   normalise,
    fromURL:     fromURL,
    buildNodes:  buildNodes,
  };
})();
