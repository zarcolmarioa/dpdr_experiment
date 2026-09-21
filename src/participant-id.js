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
 *
 * After the ID, an optional CONTACT screen asks for name and email (each
 * field switchable in CONFIG.participant; both optional for the
 * participant). These are handled with care:
 *
 *   - they are REMOVED from the jsPsych data as soon as the screen ends, so
 *     they never appear in the response CSV uploaded to OSF;
 *   - they are uploaded straight away as a separate small CSV
 *     (participant_id, name, email, ...) to a SEPARATE DataPipe experiment
 *     (CONFIG.contact_datapipe), so the identifying file can be restricted
 *     or deleted independently of the responses;
 *   - the response data records only whether each was given, and whether
 *     the separate upload succeeded (contact_saved).
 *
 * Uploading immediately, rather than at the end, means contact details
 * survive even if the participant abandons the session partway.
 *
 * All wording comes from Loader.text().id and .contact, so both languages
 * are covered.
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

  // -----------------------------------------------------------------------
  // Timeline nodes for establishing the ID.
  //
  // If the URL carried a valid ID, one confirmation screen is shown.
  // Otherwise a typed-entry screen loops until a valid ID is given.
  // -----------------------------------------------------------------------
  function _card(title, body, hint) {
    return '<div class="card"><h2>' + title + '</h2>' + (body || '') +
           (hint ? '<p class="hint">' + hint + '</p>' : '') + '</div>';
  }

  function buildNodes(jsPsych) {
    var T = Loader.text().id;
    var nodes = [];

    // --- ID collection switched off -------------------------------------
    if (!CONFIG.participant.collect_id) {
      accept(_anonymousId());
      console.warn('[ID] collect_id is off — anonymous ID ' + _id +
                   '. This session cannot be linked to a CDS-29 score.');
      return nodes.concat(buildContactNodes(jsPsych));
    }

    var urlId = fromURL();

    // --- ID arrived in the link: confirm it ------------------------------
    if (urlId && isValid(urlId)) {
      accept(urlId);
      nodes.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: _card(T.confirm_title,
                        T.confirm_body + '<p class="id-echo">' + urlId + '</p>',
                        T.confirm_hint),
        choices: [' '],
        data: { block: 'participant_id', id_source: 'url' },
      });
      return nodes.concat(buildContactNodes(jsPsych));
    }

    // --- No usable ID and typing is not allowed: stop here ---------------
    if (!CONFIG.participant.allow_manual_id) {
      nodes.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: _card(T.missing_title, T.missing_body),
        choices: 'NO_KEYS',
        data: { block: 'participant_id', id_source: 'missing' },
      });
      return nodes;
    }

    // --- Typed entry, repeated until valid --------------------------------
    var entry = {
      type: jsPsychSurveyText,
      preamble: _card(T.entry_title, T.entry_body, T.entry_hint),
      questions: [{ prompt: T.entry_label, name: 'pid', required: true, columns: 30 }],
      button_label: Loader.text().calibration.button_continue,
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
        stimulus: _card(T.retry_title, T.retry_body, T.retry_hint),
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

    return nodes.concat(buildContactNodes(jsPsych));
  }

  // =======================================================================
  // CONTACT DETAILS (optional name and email)
  // =======================================================================

  var _contactSaved = null;   // true / false once the upload returns

  function _escapeHTML(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

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
  function _pipeSucceeded(result) {
    return !!(result && result.message === 'Success' && !result.error);
  }

  function _uploadContact(name, email) {
    if (CONFIG.platform === 'local') {
      console.log('[Contact] local mode — not uploaded.', { name: name, email: email });
      _contactSaved = null;
      return;
    }
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
        _contactSaved = _pipeSucceeded(result);
        console.log('[Contact] upload ' + (_contactSaved ? 'succeeded' : 'FAILED'), result);
      })
      .catch(function (err) {
        _contactSaved = false;
        console.error('[Contact] upload failed', err);
      });
  }

  function buildContactNodes(jsPsych) {
    var askName  = !!CONFIG.participant.collect_name;
    var askEmail = !!CONFIG.participant.collect_email;
    if (!askName && !askEmail) return [];

    var T = Loader.text().contact;
    var fields = '<div class="contact-fields">';
    if (askName) {
      fields += '<label>' + T.name_label +
                '<input type="text" name="contact_name" autocomplete="name" ' +
                'maxlength="120"></label>';
    }
    if (askEmail) {
      // type="email": the browser rejects a malformed address on submit,
      // but an EMPTY field is allowed, since the field is optional.
      fields += '<label>' + T.email_label +
                '<input type="email" name="contact_email" autocomplete="email" ' +
                'maxlength="200"></label>';
    }
    fields += '</div>';

    return [{
      type: jsPsychSurveyHtmlForm,
      preamble: '<div class="card contact-card"><h2>' + T.title + '</h2>' +
                T.body + '</div>',
      html: fields,
      button_label: T.button,
      data: { block: 'contact' },
      on_finish: function (data) {
        var r = data.response || {};
        var name  = askName  ? String(r.contact_name  || '').trim() : '';
        var email = askEmail ? String(r.contact_email || '').trim() : '';

        // REMOVE the identifying values from the response data, so they can
        // never reach the OSF response file.
        data.response = null;
        data.contact_name_given  = askName  ? (name.length  > 0) : null;
        data.contact_email_given = askEmail ? (email.length > 0) : null;

        if (name || email) {
          _uploadContact(name, email);
        } else {
          _contactSaved = null;   // nothing to save
        }

        jsPsych.data.addProperties({
          contact_name_given:  data.contact_name_given,
          contact_email_given: data.contact_email_given,
        });
      },
    }];
  }

  // Whether the separate contact upload succeeded: true, false, or null
  // (nothing given / local mode / still in flight).
  function contactSaved() { return _contactSaved; }

  return {
    get:          get,
    isSuperuser:  isSuperuser,
    contactSaved: contactSaved,
    pipeSucceeded: _pipeSucceeded,
    isValid:     isValid,
    normalise:   normalise,
    fromURL:     fromURL,
    buildNodes:  buildNodes,
  };
})();
