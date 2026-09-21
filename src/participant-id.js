/* =========================================================================
 * participant-id.js — who is running the session.
 *
 * ONE SCREEN asks for everything at the start:
 *
 *   Participant ID   REQUIRED. Pre-filled from ?pid= in the invitation link.
 *   Name             optional
 *   Email            optional
 *
 * Each field can be switched off in CONFIG.participant. If all three are
 * off, the screen is skipped.
 *
 * THE ID links the session to the participant's CDS-29 score, so a session
 * cannot continue without a valid one. It is checked as it is typed: an
 * invalid ID blocks the Continue button with a message in the participant's
 * language. Test IDs (CONFIG.participant.superuser_ids) are accepted too,
 * and flag every row is_test = true.
 *
 * NAME AND EMAIL are handled with care:
 *   - they are REMOVED from the jsPsych data as soon as the screen ends, so
 *     they never appear in the response CSV uploaded to OSF;
 *   - they are uploaded straight away as a separate one-row CSV to a
 *     SEPARATE DataPipe experiment (CONFIG.contact_datapipe), so the file
 *     that identifies people can be restricted or deleted on its own;
 *   - the response data records only whether each was given, and whether
 *     the separate upload succeeded (contact_saved).
 * Uploading at the start means contact details survive even if the
 * participant abandons the session partway. The upload happens on every
 * platform, including local and dev runs, so it can be tested quickly —
 * those files are flagged is_test / is_dev.
 * ========================================================================= */

var ParticipantID = (function () {

  var _id           = null;
  var _superuser    = false;
  var _contactSaved = null;   // true / false once the upload returns
  var _contactReply = '';     // DataPipe's raw reply, shown in debug mode

  function get()          { return _id; }
  function isSuperuser()  { return _superuser; }
  function contactSaved() { return _contactSaved; }
  function contactReply() { return _contactReply; }

  function _describe(x) {
    if (x instanceof Error) return x.name + ': ' + x.message;
    try { return JSON.stringify(x); } catch (e) { return String(x); }
  }

  // Accepts both the current list and the older single-ID setting.
  function _superusers() {
    var P = CONFIG.participant || {};
    var list = (P.superuser_ids || []).slice();
    if (P.superuser_id) list.push(P.superuser_id);
    return list;
  }

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
    if (_superusers().indexOf(candidate) !== -1) return true;
    return new RegExp(CONFIG.participant.id_pattern).test(candidate);
  }

  function accept(candidate) {
    _id = candidate;
    _superuser = (_superusers().indexOf(candidate) !== -1);
    if (_superuser) {
      console.log('[ID] Test ID ' + candidate + ' — rows flagged is_test = true.');
    }
    return _id;
  }

  // -----------------------------------------------------------------------
  // Anonymous ID, used only when CONFIG.participant.collect_id is false.
  // Such sessions cannot be linked to a CDS-29 score — validate.js warns.
  // -----------------------------------------------------------------------
  function _anonymousId() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var out = 'ANON_';
    for (var i = 0; i < 8; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  }

  function _escapeHTML(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _card(title, body, hint) {
    return '<div class="card"><h2>' + title + '</h2>' + (body || '') +
           (hint ? '<p class="hint">' + hint + '</p>' : '') + '</div>';
  }

  // =======================================================================
  // The separate contact upload
  // =======================================================================

  // One CSV field: quoted if it contains a comma, quote or line break, so a
  // name like 'Zarco, Mario' or one with quotes cannot break the file.
  function _csvField(v) {
    var s = (v === null || v === undefined) ? '' : String(v);
    if (/[",\r\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  // DataPipe reports success as {message: 'Success'}. The plugin marks a
  // NETWORK failure as success too (it returns the Error object, which has
  // no .error field), so success is judged from the message itself.
  function pipeSucceeded(result) {
    return !!(result && result.message === 'Success' && !result.error);
  }

  function _uploadContact(name, email) {
    if (typeof jsPsychPipe === 'undefined' || !jsPsychPipe.saveData) {
      console.error('[Contact] DataPipe plugin not loaded — contact not saved.');
      _contactSaved = false;
      return;
    }

    var stamp = new Date().toISOString();
    var header = ['participant_id', 'name', 'email', 'is_test', 'is_dev',
                  'stimulus_set', 'language', 'saved_at'];
    var row = [_id, name, email, _superuser, !!window.DEV_MODE,
               Loader.stimulusSet(), Loader.language(), stamp];
    var csv = header.join(',') + '\n' + row.map(_csvField).join(',') + '\n';

    var filename = 'contact_' + _id + '_' +
                   stamp.replace(/[:.]/g, '-').slice(0, 19) + '.csv';

    jsPsychPipe.saveData(CONFIG.contact_datapipe.experiment_id, filename, csv)
      .then(function (result) {
        _contactSaved = pipeSucceeded(result);
        _contactReply = _describe(result);
        console.log('[Contact] upload ' + (_contactSaved ? 'succeeded' : 'FAILED'), result);
      })
      .catch(function (err) {
        _contactSaved = false;
        _contactReply = _describe(err);
        console.error('[Contact] upload failed', err);
      });
  }

  // =======================================================================
  // The screen
  // =======================================================================

  function buildNodes(jsPsych) {
    var T        = Loader.text().id;
    var P        = CONFIG.participant;
    var askId    = !!P.collect_id;
    var askName  = !!P.collect_name;
    var askEmail = !!P.collect_email;
    var urlId    = fromURL();
    var urlValid = !!(urlId && isValid(urlId));

    // --- ID switched off: anonymous ID ------------------------------------
    if (!askId) {
      accept(_anonymousId());
      console.warn('[ID] collect_id is off — anonymous ID ' + _id +
                   '. This session cannot be linked to a CDS-29 score.');
    }

    // --- Nothing to ask ----------------------------------------------------
    if (!askId && !askName && !askEmail) return [];

    // --- No usable ID in the link and typing is not allowed: stop ---------
    if (askId && !urlValid && !P.allow_manual_id) {
      return [{
        type: jsPsychHtmlKeyboardResponse,
        stimulus: _card(T.missing_title, T.missing_body),
        choices: 'NO_KEYS',
        data: { block: 'participant_id', id_source: 'missing' },
      }];
    }

    // --- The form ----------------------------------------------------------
    var fields = '<div class="contact-fields">';
    if (askId) {
      // Read-only when the link supplied a valid ID and typing is not
      // allowed; otherwise editable, pre-filled from the link if present.
      var locked = urlValid && !P.allow_manual_id;
      fields +=
        '<label>' + T.id_label +
        '<input type="text" name="pid" id="pid-input" required ' +
        'autocomplete="off" autocapitalize="off" spellcheck="false" ' +
        (locked ? 'readonly ' : '') +
        'value="' + (urlId ? _escapeHTML(urlId) : '') + '">' +
        '<span class="field-hint">' + T.id_hint + '</span></label>';
    }
    if (askName) {
      fields += '<label>' + T.name_label +
                '<input type="text" name="contact_name" autocomplete="name" ' +
                'maxlength="120"></label>';
    }
    if (askEmail) {
      // type="email": the browser rejects a malformed address on submit,
      // but an EMPTY field is allowed, since it is optional.
      fields += '<label>' + T.email_label +
                '<input type="email" name="contact_email" autocomplete="email" ' +
                'maxlength="200"></label>';
    }
    fields += '</div>';

    var formNode = {
      type: jsPsychSurveyHtmlForm,
      preamble: '<div class="card contact-card"><h2>' + T.title + '</h2>' +
                (askId ? T.body : '') +
                ((askName || askEmail) ? T.optional_note : '') + '</div>',
      html: fields,
      button_label: T.button,
      autofocus: askId ? 'pid-input' : '',
      data: { block: 'participant_id' },

      // Check the ID as it is typed. An invalid ID makes the browser block
      // Continue and show T.invalid next to the field, in the participant's
      // language — so a typo is caught before the session starts.
      on_load: function () {
        var input = document.getElementById('pid-input');
        if (!input) return;
        function check() {
          input.setCustomValidity(isValid(normalise(input.value)) ? '' : T.invalid);
        }
        input.addEventListener('input', check);
        check();
      },

      on_finish: function (data) {
        var r = data.response || {};

        if (askId) {
          var candidate = normalise(r.pid || '');
          data.id_entered = candidate;
          data.id_valid   = isValid(candidate);
          data.id_source  = (urlId && candidate === urlId) ? 'url' : 'typed';
          if (data.id_valid) accept(candidate);
        }

        var name  = askName  ? String(r.contact_name  || '').trim() : '';
        var email = askEmail ? String(r.contact_email || '').trim() : '';

        // REMOVE everything typed from the response data, so name and email
        // can never reach the OSF response file. (The ID is kept above as
        // id_entered.)
        data.response = null;
        data.contact_name_given  = askName  ? (name.length  > 0) : null;
        data.contact_email_given = askEmail ? (email.length > 0) : null;

        jsPsych.data.addProperties({
          contact_name_given:  data.contact_name_given,
          contact_email_given: data.contact_email_given,
        });

        // Upload name/email only once the ID is accepted, so the contact
        // file is always linked to a real ID.
        if (_id && (name || email)) {
          _uploadContact(name, email);
        }
      },
    };

    // Safety net: the in-browser check above should make this unreachable,
    // but if an invalid ID ever gets through, say so and ask again.
    var retry = {
      timeline: [{
        type: jsPsychHtmlKeyboardResponse,
        stimulus: _card(T.retry_title, T.retry_body, T.retry_hint),
        choices: [' '],
        data: { block: 'participant_id_retry' },
      }],
      conditional_function: function () { return _id === null; },
    };

    return [{
      timeline: [formNode, retry],
      loop_function: function () { return _id === null; },
    }];
  }

  return {
    get:           get,
    isSuperuser:   isSuperuser,
    isValid:       isValid,
    normalise:     normalise,
    fromURL:       fromURL,
    contactSaved:  contactSaved,
    contactReply:  contactReply,
    pipeSucceeded: pipeSucceeded,
    buildNodes:    buildNodes,
  };
})();
