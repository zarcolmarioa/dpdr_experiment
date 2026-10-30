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
 * THE ID links the session to the participant's CDS-29 score. It is
 * checked as it is typed: an invalid ID blocks the Continue button with a
 * message in the participant's language. Test IDs
 * (CONFIG.participant.superuser_ids) are accepted too, and flag every row
 * is_test = true.
 *
 * WITHOUT A VALID ?pid= IN THE LINK (and with allow_manual_id on and both
 * name and email collected) the participant must give EITHER a valid ID
 * OR both a name and a valid email address. The screen says giving all
 * three is best. A typed ID that is not valid still blocks Continue; to go
 * on without an ID the field must be left empty. Such a session gets a
 * unique ID, CONFIG.participant.no_id_prefix + '_' + 8 random characters,
 * used in both the response file and the contact file so they still link;
 * id_source = 'no_id'. With a valid ?pid= the ID is required as before and
 * name and email stay optional.
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
  var _contactStatus = null;  // 'saved' / 'queued' / 'failed', for debug

  function get()          { return _id; }
  function isSuperuser()  { return _superuser; }
  function contactSaved() { return _contactSaved; }
  function contactReply() { return _contactReply; }
  function contactStatus() { return _contactStatus; }

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
  // No look-alike characters (no 0/O, no 1/I), so an ID can be read out or
  // copied by hand without mistakes.
  var ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function _randomPart(n) {
    var out = '';
    var buf = null;
    if (window.crypto && window.crypto.getRandomValues) {
      buf = new Uint32Array(n);
      window.crypto.getRandomValues(buf);
    }
    for (var i = 0; i < n; i++) {
      var r = buf ? buf[i] / 4294967296 : Math.random();
      out += ID_CHARS.charAt(Math.floor(r * ID_CHARS.length));
    }
    return out;
  }

  function _anonymousId() {
    return 'ANON_' + _randomPart(8);
  }

  // -----------------------------------------------------------------------
  // ID for a participant who gave a name and email but no ID, e.g.
  // NOID_DRCHAIN26_7K3QX9PA. Unique per session; 32^8 (~10^12) values.
  // -----------------------------------------------------------------------
  function _noId() {
    var prefix = (CONFIG.participant && CONFIG.participant.no_id_prefix) || 'NOID';
    return prefix + '_' + _randomPart(8);
  }

  // A plausible email address — the same rule as the browser's own
  // type="email" check, so the two cannot disagree.
  function _emailOK(el) {
    return !!(el && el.value.trim() && el.validity && el.validity.valid);
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

  // DataPipe replies in one of three ways:
  //
  //   'saved'   {message: 'Success'}                 — on OSF now
  //   'queued'  {message: 'Data received. OSF upload
  //              will be retried automatically.'}    — DataPipe HAS the
  //             file; OSF was slow or briefly down and DataPipe keeps
  //             retrying on its own. The data is safe.
  //   'failed'  anything else, including an {error: ...} reply
  //
  // The plugin marks a NETWORK failure as success too (it returns the Error
  // object, which has no .error field), so the outcome is judged from the
  // message itself, never from the plugin's own success flag.
  function pipeStatus(result) {
    if (!result || result.error) return 'failed';
    var msg = String(result.message || '');
    if (msg === 'Success') return 'saved';
    if (/data received/i.test(msg)) return 'queued';
    return 'failed';
  }

  // Saved or queued both count: in either case DataPipe holds the file, so
  // the participant must NOT be sent to the download-and-email fallback.
  function pipeSucceeded(result) {
    return pipeStatus(result) !== 'failed';
  }

  function _uploadContact(name, email) {
    if (typeof jsPsychPipe === 'undefined' || !jsPsychPipe.saveData) {
      console.error('[Contact] DataPipe plugin not loaded — contact not saved.');
      _contactSaved = false;
      _contactStatus = 'failed';
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
        _contactStatus = pipeStatus(result);
        _contactSaved  = (_contactStatus !== 'failed');
        _contactReply  = _describe(result);
        console.log('[Contact] upload ' + _contactStatus, result);
      })
      .catch(function (err) {
        _contactSaved = false;
        _contactStatus = 'failed';
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
    // No valid ID in the link: the participant may give a name AND email
    // instead of an ID (needs both fields, and typed entry allowed).
    var contactInstead = askId && !urlValid && !!P.allow_manual_id &&
                         askName && askEmail;

    var fields = '<div class="contact-fields">';
    if (askId) {
      // Read-only when the link supplied a valid ID and typing is not
      // allowed; otherwise editable, pre-filled from the link if present.
      // Validity is set by check() below, not by `required`, because
      // without a link ID an empty field can be valid.
      var locked = urlValid && !P.allow_manual_id;
      fields +=
        '<label>' + T.id_label +
        '<input type="text" name="pid" id="pid-input" ' +
        'autocomplete="off" autocapitalize="off" spellcheck="false" ' +
        (locked ? 'readonly ' : '') +
        'value="' + (urlId ? _escapeHTML(urlId) : '') + '">' +
        '<span class="field-hint">' + T.id_hint + '</span></label>';
    }
    if (askName) {
      fields += '<label>' + (contactInstead ? T.name_label_plain : T.name_label) +
                '<input type="text" name="contact_name" id="contact-name" ' +
                'autocomplete="name" maxlength="120"></label>';
    }
    if (askEmail) {
      // type="email": the browser rejects a malformed address on submit.
      // An EMPTY field is allowed by the browser; whether it may be empty
      // is decided by check() below.
      fields += '<label>' + (contactInstead ? T.email_label_plain : T.email_label) +
                '<input type="email" name="contact_email" id="contact-email" ' +
                'autocomplete="email" maxlength="200"></label>';
    }
    fields += '</div>';

    var formNode = {
      type: jsPsychSurveyHtmlForm,
      preamble: '<div class="card contact-card"><h2>' + T.title + '</h2>' +
                (contactInstead
                  ? T.body_no_pid
                  : ((askId ? T.body : '') +
                     ((askName || askEmail) ? T.optional_note : ''))) +
                '</div>',
      html: fields,
      button_label: T.button,
      autofocus: askId ? 'pid-input' : '',
      data: { block: 'participant_id' },

      // Check as it is typed. The browser blocks Continue and shows the
      // message next to the ID field, in the participant's language.
      //   - a typed ID that is not valid   -> T.invalid (always)
      //   - empty ID, link had a valid ID  -> T.invalid (ID required)
      //   - empty ID, no link ID           -> valid only with a name AND a
      //                                       valid email, else
      //                                       T.need_id_or_contact
      on_load: function () {
        var input = document.getElementById('pid-input');
        if (!input) return;
        var nameEl  = document.getElementById('contact-name');
        var emailEl = document.getElementById('contact-email');
        function check() {
          var v = normalise(input.value);
          var msg = '';
          if (v) {
            if (!isValid(v)) msg = T.invalid;
          } else if (!contactInstead) {
            msg = T.invalid;
          } else if (!(nameEl && nameEl.value.trim() && _emailOK(emailEl))) {
            msg = T.need_id_or_contact;
          }
          input.setCustomValidity(msg);
        }
        [input, nameEl, emailEl].forEach(function (el) {
          if (el) el.addEventListener('input', check);
        });
        check();
      },

      on_finish: function (data) {
        var r = data.response || {};

        var name  = askName  ? String(r.contact_name  || '').trim() : '';
        var email = askEmail ? String(r.contact_email || '').trim() : '';

        if (askId) {
          var candidate = normalise(r.pid || '');
          data.id_entered = candidate;
          data.id_valid   = isValid(candidate);
          if (data.id_valid) {
            data.id_source = (urlId && candidate === urlId) ? 'url' : 'typed';
            accept(candidate);
          } else if (!candidate && contactInstead && name && email) {
            // No ID: a unique generated one, shared with the contact file.
            data.id_source = 'no_id';
            accept(_noId());
            console.log('[ID] No ID given — session ID ' + _id +
                        ' (linked to the person through the contact file).');
          } else {
            data.id_source = (urlId && candidate === urlId) ? 'url' : 'typed';
          }
        }

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
    pipeStatus:    pipeStatus,
    contactStatus: contactStatus,
    buildNodes:    buildNodes,
  };
})();
