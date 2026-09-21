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

  // --- Calibration ------------------------------------------------------
  // Shown before the task. These screens exist because the manipulations
  // are saturation and shadow lifting, so the display is part of the
  // measurement — see the module headers in src/calibration/.
  calibration: {
    button_continue: 'Continue',

    brightness_title: 'Before we begin &mdash; screen brightness',
    brightness_intro:
      '<p>Some of the pictures in this study differ only in their darker ' +
      'areas. If your screen is dimmed, those differences disappear.</p>' +
      '<p>Please turn your screen brightness up to its <strong>highest ' +
      'setting</strong> now, and leave it there for the whole session.</p>',
    brightness_checkbox:
      'Please confirm that your screen brightness is set to maximum.',

    gamma_intro:
      '<p>Next we will measure a property of your screen that affects how ' +
      'brightness is displayed. You will do a short matching task ' +
      '<strong>three times</strong>.</p>' +
      '<p>Each time, you will see two patterns side by side. Adjust the ' +
      'right one until the two look like the same shade of grey.</p>' +
      '<p>Sitting back slightly, or squinting, can make the match easier ' +
      'to judge.</p>',
    gamma_button: 'Begin',
    gamma_prompt:
      'Adjust the RIGHT square until both squares look the same shade of ' +
      'grey. Click Confirm when they match.',
    gamma_confirm_button: 'Confirm match',
  },

  // --- Participant ID -----------------------------------------------------
  id: {
    confirm_title: 'Before we begin',
    confirm_body:  '<p>Your participant ID is:</p>',
    confirm_hint:  'If this is correct, press <b>SPACE</b> to continue.<br>' +
                   'If not, please close this page and contact the researcher.',

    missing_title: 'Missing participant ID',
    missing_body:  '<p>This link is incomplete. Please use the full link from ' +
                   'your invitation email, or contact the researcher.</p>',

    entry_title:   'Participant ID',
    entry_body:    '<p>Please enter the participant ID from your invitation ' +
                   'email.</p>',
    entry_hint:    'It looks like <code>R_</code> followed by 15 letters and ' +
                   'numbers. Capital and small letters matter.',
    entry_label:   'Participant ID',

    retry_title:   'That ID was not recognised',
    retry_body:    '<p>Please check your invitation email and try again.</p>',
    retry_hint:    'Press <b>SPACE</b> to re-enter it.',
  },

  // --- Contact details (optional) ------------------------------------------
  // Only the fields switched on in CONFIG.participant are shown.
  contact: {
    title:       'Contact details (optional)',
    body:        '<p>If you are happy for us to contact you about this study, ' +
                 'you can leave your name and email address below.</p>' +
                 '<p>This is <b>optional</b>. Your contact details are stored ' +
                 'separately from your answers.</p>',
    name_label:  'Name',
    email_label: 'Email address',
    button:      'Continue',
  },

  // --- End of session ------------------------------------------------------
  // {CONTACT} is replaced with CONFIG.researcher_contact.
  end: {
    // Shown by the DataPipe plugin while the file uploads.
    saving:       '<div class="card"><h2>Saving your responses</h2>' +
                  '<p>This usually takes a few seconds.</p>' +
                  '<p><b>Please do not close this page.</b></p></div>',

    title:        'Thank you',
    body:         '<p>Your responses have been saved.</p>' +
                  '<p>Thank you very much for taking part in this study. ' +
                  'You may now close this page.</p>',
    contact_line: 'If you have any questions about the study, please contact ' +
                  '{CONTACT}.',

    fail_title:   'Your responses could not be saved automatically',
    fail_body:    '<p>This is usually caused by a network problem.</p>' +
                  '<p>Please download your responses with the button below and ' +
                  'send the file by email to {CONTACT}.</p>' +
                  '<p><b>Please do not close this page until the file has ' +
                  'downloaded.</b></p>',
    fail_button:  'Download my responses',
    fail_done:    'The file has been downloaded. Thank you — once you have ' +
                  'emailed it, you may close this page.',
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
