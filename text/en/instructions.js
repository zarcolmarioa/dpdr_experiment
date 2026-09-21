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

  // --- Full screen and screen size --------------------------------------
  // {W} {H} = the participant's window, {MW} {MH} = the recommended minimum.
  screen: {
    fs_title:   'Full screen',
    fs_body:
      '<p>This study runs in full screen, so that the pictures are shown at ' +
      'the same size throughout.</p>' +
      '<p>Please stay in full screen until the study ends.</p>',
    fs_button:  'Enter full screen',

    small_title: 'Your screen is smaller than this study needs',
    small_intro:
      '<p>This study shows two pictures side by side at a fixed size, so ' +
      'that every participant sees them in the same way.</p>',
    small_cut:    '<p><b>On this screen, part of each picture would be cut off.</b></p>',
    small_scaled: '<p>On this screen the pictures will be shown smaller than intended.</p>',
    small_size:
      'Your display area is {W} &times; {H} pixels. At least {MW} &times; ' +
      '{MH} is recommended.',
    small_hopeless:
      '<p>This screen is too small for the study. Please use a larger ' +
      'computer or an external monitor.</p>',
    small_continue:
      '<p>If you can use a larger screen, please close this page and start ' +
      'again there.</p>',
    small_hint: 'To continue on this screen anyway, press <b>SPACE</b>.',
  },

  // --- Calibration ------------------------------------------------------
  // Shown before the task. These screens exist because the manipulations
  // are saturation and shadow lifting, so the display is part of the
  // measurement — see the module headers in src/calibration/.
  calibration: {
    button_continue: 'Continue',

    brightness_title: 'Screen brightness',
    brightness_intro:
      '<p>Some of the pictures in this study differ only in their darker ' +
      'areas. If your screen is dimmed, those differences disappear.</p>' +
      '<p>Please turn your screen brightness up to its <strong>highest ' +
      'setting</strong> now, and leave it there for the whole session.</p>',
    brightness_checkbox:
      'My screen brightness is set to maximum.',

    gamma_title: 'Screen calibration',
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
      'Adjust the square on the right until both squares look the same ' +
      'shade of grey, then click <b>Confirm match</b>.',
    gamma_confirm_button: 'Confirm match',
    gamma_progress:       'Match {N} of {TOTAL}',
    gamma_hint:           'Drag the slider, or use the &larr; &rarr; keys.',
    gamma_label_fixed:    'Reference',
    gamma_label_adjust:   'Adjust this one',
  },

  // --- Participant details: ONE screen with ID, name and email ------------
  // Only the fields switched on in CONFIG.participant are shown.
  id: {
    title:          'Before we begin',
    body:           '<p>Please enter your participant ID from your invitation ' +
                    'email. If you opened this page from the link in the ' +
                    'email, it is already filled in.</p>',
    id_label:       'Participant ID',
    id_hint:        '<code>R_</code> followed by 15 letters and numbers. ' +
                    'Capital and small letters matter.',
    // Plain text: shown by the browser in a small bubble if the ID is wrong.
    invalid:        'This ID was not recognised. Please check your invitation ' +
                    'email — capital and small letters matter.',
    optional_note:  '<p>Your <b>name</b> and <b>email address</b> are ' +
                    '<b>optional</b>. If you give them, they are stored ' +
                    'separately from your answers and used only to contact ' +
                    'you about this study.</p>',
    name_label:     'Name (optional)',
    email_label:    'Email address (optional)',
    button:         'Continue',

    missing_title:  'Missing participant ID',
    missing_body:   '<p>This link is incomplete. Please use the full link from ' +
                    'your invitation email, or contact the researcher.</p>',

    retry_title:    'That ID was not recognised',
    retry_body:     '<p>Please check your invitation email and try again.</p>',
    retry_hint:     'Press <b>SPACE</b> to re-enter it.',
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

  // --- Grid block -------------------------------------------------------
  // Shown after the pair trials, only for sets that have a grid. Same
  // framing rules as above: the change is acknowledged, never named.
  grid: {
    title:        'One more task',
    instructions:
      '<p>On the next four screens you will see several scenes, each shown ' +
      'at different levels of a visual change. Each <b>column</b> shows one ' +
      'level.</p>' +
      '<p>Choose the column that looks most like how your surroundings ' +
      'looked to you during an episode. Click anywhere in a column to ' +
      'choose it.</p>' +
      '<p>If none of the columns resembles it, choose <b>None of these</b>.</p>' +
      '<p>You can change your choice before pressing Continue. There is no ' +
      'time limit.</p>',
    button_begin:    'Begin',
    question:        'Which column looks most like how your surroundings looked to you during an episode?',
    none:            'None of these',
    button_continue: 'Continue',
    progress:        'Screen {DONE} of {TOTAL}',
    // Only used if CONFIG.blocks.grid_none_text is switched on.
    none_text_prompt:
      'You chose &ldquo;None of these&rdquo; at least once. In your own words, ' +
      'how did your surroundings look different? (optional)',
    none_text_button: 'Continue',
  },

  // --- Breaks -----------------------------------------------------------
  brk: {
    title: 'Short break',
    body: '<p>You have completed {DONE} of {TOTAL} trials.</p>' +
          '<p>Take a moment to rest if you like. Please stay in full screen.</p>',
    hint: 'Press <b>SPACE</b> when you are ready to continue.',
  },

  // --- Preloading -------------------------------------------------------
  preload: {
    message:
      '<div class="card">' +
      '<h2>Loading images</h2>' +
      '<p>The study is downloading the pictures it needs. On a slow ' +
      'connection this may take a minute.</p>' +
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
