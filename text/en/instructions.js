/* =========================================================================
 * text/en/instructions.js — every participant-facing string, English.
 *
 * Nothing displayed to a participant is written anywhere else in the code.
 * text/ja/instructions.js holds the same keys in Japanese; CONFIG.language
 * selects between them, and validate.js checks the two files have identical
 * key sets so a missing translation is caught before anyone runs the study.
 *
 * NOTE on the `instruction` column in trial_list.json: it is NOT used. It
 * contains English text written by build_trials.py, phrased for a mouse
 * click ("Click the image on the RIGHT"). The prompts below are used
 * instead, keyed on trial type, so all participant-facing wording lives in
 * one place and can be translated.
 * ========================================================================= */

var TEXT_EN = {

  lang_name: 'English',

  // --- Prompts shown above the image pair -------------------------------
  prompt: {
    // The main question, shown on every analysed trial.
    main: 'Which of these looks more like how the world looked to you?',

    // Catch trials. {ARROW} and {SIDE} are substituted at runtime.
    catch: 'Press the {SIDE} arrow key ({ARROW})',

    side_left:  'LEFT',
    side_right: 'RIGHT',
  },

  // --- Practice ---------------------------------------------------------
  practice: {
    title: 'Practice',
    body:
      '<p>You will see two pictures of the same place, side by side. They ' +
      'differ in how they have been adjusted.</p>' +
      '<p>Your task is to choose the one that looks more like how the world ' +
      'looked to you <b>during times when it seemed unreal or ' +
      'unfamiliar</b>.</p>' +
      '<p>There is no right or wrong answer. Go with your first impression.</p>' +
      '<p>Use the <b>&#8592;</b> and <b>&#8594;</b> arrow keys to choose the ' +
      'left or right picture.</p>' +
      '<p>We will start with a few practice trials.</p>',
    continue_hint: 'Press <b>SPACE</b> to begin the practice.',

    end_title: 'End of practice',
    end_body:
      '<p>That is the end of the practice.</p>' +
      '<p>The main part of the study works the same way. It has about 140 ' +
      'trials and takes roughly 15 minutes.</p>' +
      '<p>Occasionally a trial will ask you to press a particular key ' +
      'instead of making a choice. These check that you are still paying ' +
      'attention. Just follow the instruction on the screen.</p>',
    end_hint: 'Press <b>SPACE</b> to begin.',
  },

  // --- Breaks -----------------------------------------------------------
  brk: {
    title: 'Short break',
    body: '<p>You are {DONE} trials into {TOTAL}.</p>' +
          '<p>Take a moment if you would like. Try to stay in full screen.</p>',
    hint: 'Press <b>SPACE</b> when you are ready to continue.',
  },

  // --- Preloading -------------------------------------------------------
  preload: {
    message:
      '<div class="card">' +
      '<h2>Loading images</h2>' +
      '<p>The study is downloading the pictures it needs. This happens once, ' +
      'at the start, and may take a minute on a slow connection.</p>' +
      '<p>Please do not close this page.</p>' +
      '</div>',
    error:
      '<div class="card">' +
      '<h2>Some images could not be loaded</h2>' +
      '<p>Please check your internet connection and reload the page.</p>' +
      '<p>If this keeps happening, contact the researcher.</p>' +
      '</div>',
  },

  // --- Errors -----------------------------------------------------------
  error: {
    title: 'Something went wrong',
    body:
      '<p>The study could not start. Please reload the page.</p>' +
      '<p>If the problem continues, contact the researcher.</p>',
  },
};
