/* =========================================================================
 * text/en/words.js — the ten words rated in the word-rating task.
 *
 * WHEN THEY ARE RATED
 * -------------------
 * After the pair trials and the episode grid block, and before the
 * normal-appearance grid block. Participants rate how well each word
 * describes how their surroundings looked during the episode they brought
 * to mind on the anchoring screen; controls rate how well each word
 * describes how the surroundings might look to someone experiencing
 * derealization. Same scale, same grid, for both groups.
 *
 * THE WORDS
 * ---------
 * Ten words, shown in a random order per participant (recorded as
 * word_order). The two TARGETS are `foggy` and `faded`: record.js promotes
 * them to session-level columns, rating_foggy and rating_faded, so they
 * sit on every row. The other eight are recorded on the word_ratings row
 * only.
 *
 * TWO CAUTIONS IF YOU EDIT THIS FILE
 * ----------------------------------
 *  - `id` values become column names in the output (word_foggy, ...) and
 *    must be exactly the registered ones. validate.js refuses to start if
 *    the ids differ from the registered list or between languages.
 *  - Only `label` is participant-facing. Change wording there, never ids.
 *
 * GROUP-DEPENDENT STRINGS: `instruction` and `question_short` (one entry
 * per group). Everything else is shared.
 *
 * The framing rules in instructions.js apply to the instruction and the
 * question (not to the rated words themselves, which are the measure).
 * ========================================================================= */

var WORDS_EN = {

  // Shown on its own screen first, so the rating grid itself needs only a
  // one-line reminder and the whole grid fits without scrolling.
  title: 'Rating words',
  instruction: {
    participant:
      '<p>On the next screen you will see a list of words.</p>' +
      '<p><b>During that episode, how well does each word describe how your ' +
      'surroundings looked?</b></p>' +
      '<p>Rate every word from 0 (not at all) to 6 (exactly). Some words will ' +
      'not apply at all. That is expected &mdash; please rate every word ' +
      'anyway.</p>',
    control:
      '<p>On the next screen you will see a list of words.</p>' +
      '<p><b>How well does each word describe how the surroundings might ' +
      'look to someone experiencing derealization?</b></p>' +
      '<p>Rate every word from 0 (not at all) to 6 (exactly). Some words will ' +
      'not apply at all. That is expected &mdash; please rate every word ' +
      'anyway.</p>',
  },

  // The one-line header above the grid.
  question_short: {
    participant: 'During that episode, how well does each word describe how ' +
                 'your surroundings looked?',
    control:     'How well does each word describe how the surroundings might ' +
                 'look to someone experiencing derealization?',
  },

  button_begin:    'Continue',
  button_submit:   'Continue',
  progress:        '{DONE} of {TOTAL} rated',

  anchor_low:  'not at all',
  anchor_high: 'exactly',

  // Presented in random order; the order shown is recorded.
  items: [
    { id: 'foggy',          label: 'foggy' },          // TARGET
    { id: 'faded',          label: 'faded' },          // TARGET
    { id: 'veiled',         label: 'veiled' },
    { id: 'lifeless',       label: 'lifeless' },
    { id: 'unreal',         label: 'unreal' },
    { id: 'dreamlike',      label: 'dreamlike' },
    { id: 'distant',        label: 'distant' },
    { id: 'like_a_picture', label: 'like a picture' },
    { id: 'oppressive',     label: 'oppressive' },
    { id: 'threatening',    label: 'threatening' },
  ],
};
