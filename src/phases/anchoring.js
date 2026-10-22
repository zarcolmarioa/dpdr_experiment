/* =========================================================================
 * phases/anchoring.js — the anchoring screen, just before the practice.
 *
 * It fixes what every later judgment is about, and it is one of the four
 * places where the two groups' wording differs:
 *
 *   participant  bring to mind ONE specific episode in which the
 *                surroundings felt different from usual, ideally a recent
 *                one remembered clearly, and answer about that episode
 *                throughout. Then an OPTIONAL text box: which episode it is,
 *                in a few words. Recorded as episode_note ('' if left empty).
 *
 *   control      what derealization is, named and defined without visual
 *                words, and the instruction to imagine how the surroundings
 *                might look to someone experiencing it. No text box.
 *
 * Wording: text/<lang>/instructions.js, section `anchoring`. Like every
 * instruction, it must not describe the experience with visual words
 * (foggy, blurred, faded, dull, colourless, unreal, dreamlike, flat,
 * veiled, as if behind glass), and it does not mention any interview.
 *
 * The note is free text and is stored WITH the responses (it is on the
 * anchoring row of the response file). The consent text and a hint under
 * the box ask participants not to include names or other identifying
 * details.
 *
 * OUTPUT
 *   One row, block 'anchoring'. episode_note on that row only:
 *   the typed text (trimmed) or '' for participants; null for controls.
 * ========================================================================= */

var AnchoringPhase = (function () {

  // The text box is part of the participant version only.
  var NOTE_GROUP = 'participant';
  var NOTE_MAX   = 300;   // characters

  function buildNodes(jsPsych) {
    var result = null;

    return [{
      type: jsPsychCallFunction,
      async: true,
      func: function (done) {
        var A = Loader.text().anchoring;
        var withNote = (Loader.group() === NOTE_GROUP);
        var display = jsPsych.getDisplayElement();

        display.innerHTML =
          '<div class="card anchoring-card">' +
          '<h2>' + A.title + '</h2>' +
          Loader.byGroup(A.body) +
          (withNote
            ? '<label class="note-field">' + A.note_label +
              '<textarea id="episode-note" rows="2" maxlength="' + NOTE_MAX + '" ' +
              'autocomplete="off"></textarea>' +
              '<span class="field-hint">' + A.note_hint + '</span></label>'
            : '') +
          '<div class="btn-row">' +
          '<button id="anchoring-continue" class="calib-btn" type="button">' +
          A.button + '</button></div>' +
          '</div>';

        var btn = document.getElementById('anchoring-continue');
        btn.addEventListener('click', function () {
          var note = null;
          if (withNote) {
            var el = document.getElementById('episode-note');
            note = el ? String(el.value || '').trim() : '';
          }
          result = { episode_note: note };
          if (CONFIG.debug) {
            console.log('[Anchoring] group ' + Loader.group() +
                        (withNote ? ' | note: "' + note + '"' : ''));
          }
          display.innerHTML = '';
          done();
        }, { once: true });
      },
      data: { block: 'anchoring' },
      on_finish: function (data) {
        if (result) data.episode_note = result.episode_note;
      },
    }];
  }

  return { buildNodes: buildNodes };
})();
