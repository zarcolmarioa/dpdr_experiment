/* =========================================================================
 * text/en/instructions.js — every participant-facing string, English.
 *
 * Nothing displayed to a participant is written anywhere else in the code.
 * text/ja/instructions.js holds the same keys in Japanese; CONFIG.language
 * selects between them, and validate.js checks the two key sets match so a
 * missing translation is caught before anyone runs the study.
 *
 * FRAMING RULES — these wordings are deliberate, not incidental:
 *
 *  - The condition is NAMED ("an episode of depersonalization or
 *    derealization"), never DESCRIBED. Words like "unreal", "unfamiliar",
 *    "dreamlike" or "as if behind glass" name perceptual qualities, and
 *    those qualities are exactly what the word ratings and the image
 *    manipulations measure. Using them here would prime both the predictor
 *    and the outcome.
 *
 *  - The judgment is anchored on SURROUNDINGS, not on the self.
 *    Depersonalization concerns the self feeling unreal; derealization
 *    concerns the world. Every stimulus is a scene, so the instruction has
 *    to point at the world or participants will recall self-focused
 *    experiences the images cannot represent.
 *
 *  - The manipulation is ACKNOWLEDGED but UNSPECIFIED. Both images in a
 *    pair are the same scene, so participants will notice something was
 *    done. Saying "adjusted in different ways" closes the question without
 *    hinting at colour or haze.
 *
 *  - Nothing may suggest this is a DETECTION task. "Which looks more
 *    edited/distorted/altered" would convert a judgment about resemblance
 *    into a discrimination task, which people are good at and which
 *    measures something else entirely.
 * ========================================================================= */

var TEXT_EN = {

  lang_name: 'English',

  // --- Prompts shown above the image pair -------------------------------
  prompt: {
    // Shown on every analysed trial. See framing rules above.
    main: 'Which looks more like how your surroundings looked to you during an episode?',
  },

  // --- Catch trials -----------------------------------------------------
  // No images are shown. The screen is large text on the plain background,
  // deliberately unlike both the trials and the break screens.
  catch: {
    lead:        'Attention check',
    instruction: 'Press the {KEYNAME} arrow key',
    key_up:      'UP',
    key_down:    'DOWN',
  },

  // --- Practice ---------------------------------------------------------
  practice: {
    title: 'The task',
    body:
      '<p>Earlier you took part in an interview about your experiences.</p>' +
      '<p>On each trial you will see two pictures of the same place, side ' +
      'by side. The two pictures have been adjusted in different ways.</p>' +
      '<p>Choose the one that looks more like how your surroundings looked ' +
      'to you <b>during an episode of depersonalization or ' +
      'derealization</b>.</p>' +
      '<p>There is no right or wrong answer, and we are not testing your ' +
      'memory. Go with your first impression.</p>' +
      '<p>Use the <b>&#8592;</b> and <b>&#8594;</b> arrow keys to choose the ' +
      'picture on the left or on the right.</p>' +
      '<p>We will begin with a few practice trials.</p>',
    continue_hint: 'Press <b>SPACE</b> to begin the practice.',

    // Shown once, after the first practice response only. Deliberately says
    // nothing about WHY the participant chose what they chose — confirming
    // a reason would invite consistency-seeking on later trials.
    feedback_first:
      'You chose this one. There is no right or wrong answer &mdash; just ' +
      'go with your impression.',

    end_title: 'End of practice',
    end_body:
      '<p>That is the end of the practice.</p>' +
      '<p>The main part works the same way. It has about 140 trials and ' +
      'takes roughly 15 minutes. There are short breaks along the way.</p>' +
      '<p><b>Occasionally a screen will appear with no pictures</b>, asking ' +
      'you to press a particular arrow key. These check that you are still ' +
      'reading the screen. Take your time on them &mdash; there is no time ' +
      'limit, and you only get one press.</p>',
    end_hint: 'Press <b>SPACE</b> to begin.',
  },

  // --- Breaks -----------------------------------------------------------
  brk: {
    title: 'Short break',
    body: '<p>You are {DONE} trials into {TOTAL}.</p>' +
          '<p>Take a moment if you would like. Please stay in full screen.</p>',
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
      '<p>If this keeps happening, please contact the researcher.</p>' +
      '</div>',
  },

  // --- Errors -----------------------------------------------------------
  error: {
    title: 'Something went wrong',
    body:
      '<p>The study could not start. Please reload the page.</p>' +
      '<p>If the problem continues, please contact the researcher.</p>',
  },
};
