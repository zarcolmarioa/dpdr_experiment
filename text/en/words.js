/* =========================================================================
 * text/en/words.js — the descriptors rated before the image task.
 *
 * WHY THIS TASK COMES FIRST
 * -------------------------
 * The ratings are the PREDICTOR: the analysis asks whether someone who
 * rates "foggy" highly also shows a large b_fog in the image task, and
 * whether "lifeless" predicts b_sat. If the images came first, the ratings
 * would be contaminated by what the participant had just spent fifteen
 * minutes looking at, and the predictor would no longer be independent of
 * the outcome.
 *
 * WHY THERE ARE FILLERS
 * ---------------------
 * Only `foggy` and `lifeless` are targets. The rest are there so that
 * indiscriminate endorsement is detectable: someone who rates every word
 * 5 or 6 is not describing an experience, and their target ratings mean
 * nothing. A spread of visual and non-visual fillers makes that visible.
 *
 * Fillers were chosen to sit AWAY from the two manipulated dimensions.
 * A filler that is itself about colour or clarity would correlate with the
 * targets and defeat the purpose.
 *
 * TWO CAUTIONS IF YOU EDIT THIS LIST
 * ----------------------------------
 *  - `id` values become column names in the output (word_foggy, ...) and
 *    are what the analysis joins on. Changing an id after data collection
 *    has started breaks that join. Add or remove items, but do not rename.
 *  - Keep the target ids `foggy` and `lifeless`. record.js promotes those
 *    two to session-level columns so they appear on every trial row.
 *
 * The framing rules in instructions.js apply here too: the condition is
 * NAMED, never described, and the question is about how things LOOKED.
 * ========================================================================= */

var WORDS_EN = {

  // Shown on its own screen first, so the rating grid itself needs only a
  // one-line reminder and the whole grid fits without scrolling.
  instruction:
    '<p>Before the main task, we would like to know how you would describe ' +
    'your experience.</p>' +
    '<p>On the next screen you will see a list of words. Thinking about ' +
    '<b>an episode of depersonalization or derealization</b>, rate how well ' +
    'each word describes how your surroundings <b>looked</b> to you.</p>' +
    '<p>Some words will not apply at all. That is expected &mdash; please ' +
    'rate every word anyway.</p>',

  // The one-line header above the grid.
  question_short:
    'During an episode, how well does each word describe how your ' +
    'surroundings <b>looked</b>?',

  button_begin:    'Continue',
  button_submit:   'Continue',
  progress:        '{DONE} of {TOTAL} rated',

  anchor_low:  'not at all',
  anchor_high: 'exactly',

  // Presented in random order; the order shown is recorded.
  items: [
    { id: 'foggy',      label: 'foggy' },        // TARGET
    { id: 'lifeless',   label: 'lifeless' },     // TARGET
    { id: 'crowded',    label: 'crowded' },
    { id: 'echoing',    label: 'echoing' },
    { id: 'still',      label: 'still' },
    { id: 'jagged',     label: 'jagged' },
    { id: 'heavy',      label: 'heavy' },
    { id: 'warm',       label: 'warm' },
    { id: 'rushed',     label: 'rushed' },
    { id: 'cluttered',  label: 'cluttered' },
  ],
};
