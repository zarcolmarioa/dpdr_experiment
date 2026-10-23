/* =========================================================================
 * text/en/instructions.js — every participant-facing string, English.
 *
 * Nothing displayed to a participant is written anywhere else in the code.
 * text/ja/instructions.js holds the same keys in Japanese; CONFIG.language
 * (or ?lang=) selects between them, and validate.js checks the two key sets
 * match so a missing translation is caught before anyone runs the study.
 *
 * GROUP-DEPENDENT STRINGS
 * -----------------------
 * The two groups (?group=participant / ?group=control) see the same study;
 * only four things are worded differently:
 *   anchoring.body, prompt.main, grid.question_episode, and the word-rating
 *   instruction and question (text/en/words.js).
 * Each of these is an object with one entry per group. Everything else is
 * the same for both groups, so it must not presume either one — the
 * practice and grid instructions describe the task mechanically and point
 * to the question shown on screen.
 *
 * FRAMING RULES — these wordings are deliberate, not incidental:
 *
 *  - The experience is never DESCRIBED with visual words: foggy, blurred,
 *    faded, dull, colourless, unreal, dreamlike, flat, veiled, as if behind
 *    glass. Those name perceptual qualities, and those qualities are
 *    exactly what the word ratings and the image manipulations measure.
 *    Using them would prime both. validate.js warns if one appears in an
 *    English instruction. (The rated words and the questionnaire items are
 *    exempt: their wording is the measure.)
 *
 *  - No interview is mentioned anywhere.
 *
 *  - The judgment is anchored on SURROUNDINGS, not on the self. Every
 *    stimulus is a scene, so the instruction has to point at the world.
 *
 *  - The manipulation is ACKNOWLEDGED but UNSPECIFIED. Both images in a
 *    pair are the same scene, so participants will notice something was
 *    done. Saying "adjusted in different ways" closes the question without
 *    hinting at colour or contrast.
 *
 *  - Nothing may suggest this is a DETECTION task. "Which looks more
 *    edited/distorted/altered" would convert a judgment about resemblance
 *    into a discrimination task, which measures something else entirely.
 *
 * PLACEHOLDERS — to be replaced before recruiting
 * -----------------------------------------------
 *  - consent.*      the whole consent text (PLACEHOLDER, see below)
 *  - state.items    the four questionnaire items (paste the exact wording)
 * Bracketed gaps like [researcher names] are detected by validate.js: a
 * warning in debug mode, an error on index.html with debug off.
 * ========================================================================= */

var TEXT_EN = {

  lang_name: 'English',

  // --- Incomplete link: no valid ?group= -----------------------------------
  // Same kind of message as a missing participant ID.
  link: {
    missing_title: 'Incomplete link',
    missing_body:  '<p>This link is incomplete. Please use the full link from ' +
                   'your invitation email, or contact the researcher.</p>',
  },

  // --- Consent (the first screen) -------------------------------------------
  // >>> PLACEHOLDER — NOT THE APPROVED WORDING. <<<
  // Replace title/body/checkbox with the ethics-approved text, in this file
  // and in text/ja/instructions.js, and nowhere else. Every [bracketed gap]
  // must be filled: validate.js refuses a production session while any
  // remain.
  //
  // Facts the approved text must keep true to how the code behaves:
  //  - an optional name and email are uploaded AS SOON AS THEY ARE ENTERED
  //    (ID screen), separately from the responses, even if the session is
  //    not finished;
  //  - everything else is uploaded only at the very end; closing the page
  //    earlier saves nothing else;
  //  - the optional answers about the episode (participants only),
  //    including anything typed under "Other", are stored WITH the
  //    responses;
  //  - without a participant ID, the name and email are what link the
  //    responses to the person.
  consent: {
    title: 'Consent to take part',
    body:
      '<p>You are invited to take part in a research study about how people ' +
      'perceive their surroundings. It is run by [researcher names] at ' +
      '[institution].</p>' +
      '<p><b>What you will do:</b> look at pairs of photographs and choose ' +
      'between them, then answer a few short questions. It takes about ' +
      '[25] minutes.</p>' +
      '<p><b>Risks:</b> we do not expect any risks beyond those of everyday ' +
      'computer use. Some questions ask about unusual experiences; you may ' +
      'stop at any time.</p>' +
      '<p><b>Benefits:</b> there is no direct benefit to you. ' +
      '[Compensation, if any.]</p>' +
      '<p><b>Your data:</b> your responses are stored under a study ID, ' +
      'without your name. Results are reported only for groups or without ' +
      'identifying information. [Storage period and who has access.] ' +
      '[Whether anonymised data may be shared publicly, e.g. on OSF.]</p>' +
      '<p>You may be asked a few short questions about the experience you are ' +
      'thinking of, such as when and where it happened. These questions are ' +
      'optional. Your answers, including anything you type under ' +
      '&ldquo;Other&rdquo;, are stored with your responses, so please do not ' +
      'include names or other details that could identify you or anyone ' +
      'else.</p>' +
      '<p><b>Voluntary participation:</b> taking part is voluntary. You may ' +
      'stop at any time by closing this page. Your responses are saved only ' +
      'at the end of the study, so if you close the page before then, none of ' +
      'them are saved. The exception is your name and email address: they are ' +
      'optional, and if you give them they are saved straight away, ' +
      'separately from your responses, even if you do not finish. If you take ' +
      'part without a participant ID, your name and email address are what ' +
      'links your responses to you. ' +
      '[How to withdraw data after submission.]</p>' +
      '<p><b>Contact:</b> [researcher email]. For questions about your rights ' +
      'as a participant: [ethics committee contact]. [Ethics approval ' +
      'number.]</p>',
    checkbox:
      'I have read the information above, I am at least 18 years old, and I ' +
      'agree to take part.',
    button_agree:   'I agree, continue',
    button_decline: 'I do not agree',

    // Shown after "I do not agree". Nothing has been saved at that point.
    declined_title: 'Thank you',
    declined_body:
      '<p>You have chosen not to take part. Nothing has been saved.</p>' +
      '<p>You may now close this page.</p>',
  },

  // --- Prompts shown above the image pair -------------------------------
  // GROUP-DEPENDENT. Shown on every image trial, practice included.
  prompt: {
    main: {
      participant: 'Which looks more like how your surroundings looked during that episode?',
      control:     'Which looks more like how the surroundings might look to someone experiencing derealization?',
    },
  },

  // --- Anchoring (just before the practice) -----------------------------
  // body is GROUP-DEPENDENT. The questions are shown to participants only
  // (each can be switched off in CONFIG.anchoring.questions), and none is
  // required. They ask when, how long, where and how clearly — never how
  // it felt or looked. Option codes are what is recorded: keep them, and
  // keep them identical in text/ja.
  anchoring: {
    title: 'Before you begin',
    body: {
      participant:
        '<p>Please bring to mind your most recent episode that you remember ' +
        'clearly, in which your surroundings felt different from usual.</p>' +
        '<p>Throughout this study, please answer about that episode.</p>',
      control:
        '<p>Derealization is an experience in which one&rsquo;s surroundings ' +
        'feel strange or detached, as if one were cut off from the world.</p>' +
        '<p>In this study, please imagine how the surroundings might look to ' +
        'someone experiencing derealization.</p>',
    },
    // Shown above the questions, only when at least one is switched on.
    questions_intro: 'A few optional questions about that episode:',
    questions: {
      when: {
        label: 'When was it?',
        options: [
          { code: 'past_week',   label: 'Within the past week' },
          { code: 'past_month',  label: 'Within the past month' },
          { code: '1_6_months',  label: '1&ndash;6 months ago' },
          { code: '6_12_months', label: '6&ndash;12 months ago' },
          { code: 'over_year',   label: 'More than a year ago' },
        ],
      },
      duration: {
        label: 'How long did it last?',
        options: [
          { code: 'seconds',       label: 'Seconds' },
          { code: 'minutes',       label: 'A few minutes' },
          { code: 'up_to_hour',    label: 'Up to an hour' },
          { code: 'hours',         label: 'Several hours' },
          { code: 'day_or_longer', label: 'A day or longer' },
        ],
      },
      where: {
        label: 'Where were you?',
        options: [
          { code: 'home',         label: 'At home' },
          { code: 'work_school',  label: 'At work or school' },
          { code: 'indoor_other', label: 'Another indoor place' },
          { code: 'outdoors',     label: 'Outdoors' },
          { code: 'travelling',   label: 'Travelling' },
        ],
      },
      clarity: {
        label:       'How clearly do you remember it?',
        anchor_low:  'not at all clearly',
        anchor_high: 'very clearly',
      },
    },
    other:      'Other:',
    prefer_not: 'Prefer not to say',
    button:     'Continue',
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
  // The same for both groups: the task is described mechanically, and the
  // question itself is the group-dependent prompt above the pictures.
  practice: {
    title: 'The task',
    body:
      '<p>On each trial you will see two pictures of the same place, side ' +
      'by side. The two pictures have been adjusted in different ways.</p>' +
      '<p>A question is shown above the pictures. Choose the picture that ' +
      'fits the question better.</p>' +
      '<p>There is no right or wrong answer. Go with your first ' +
      'impression.</p>' +
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
      '<p>The main part works the same way. It has 205 trials and takes ' +
      'about 10 minutes. There are short breaks along the way.</p>' +
      '<p><b>Occasionally a screen will appear with no pictures</b>, asking ' +
      'you to press a particular arrow key. These check that you are still ' +
      'reading the screen. Take your time on them &mdash; there is no time ' +
      'limit, and you only get one press.</p>',
    end_hint: 'Press <b>SPACE</b> to begin.',
  },

  // --- Full screen and the window check ---------------------------------
  // The window check is a HARD STOP: there is no "continue anyway".
  // {W} {H} = the participant's window, {MW} {MH} = the recommended minimum.
  screen: {
    fs_title:   'Full screen',
    fs_body:
      '<p>This study runs in full screen, so that the pictures are shown at ' +
      'the same size throughout.</p>' +
      '<p>Please stay in full screen until the study ends.</p>',
    fs_button:  'Enter full screen',

    small_title: 'This window is too small for the study',
    small_body:
      '<p>This study shows two pictures side by side at a fixed size, so ' +
      'that everyone sees them in the same way. In this window, part of the ' +
      'pictures or of the question would be cut off.</p>' +
      '<p>Please make your browser window larger, or use a computer with a ' +
      'larger screen, and then open the link from your invitation again.</p>' +
      '<p>If your browser is zoomed in, setting the zoom back to 100% ' +
      '(Ctrl + 0, or &#8984; + 0 on a Mac) may be enough.</p>',
    small_size:
      'Your display area is {W} &times; {H} pixels. At least {MW} &times; ' +
      '{MH} is recommended.',
  },

  // --- Calibration ------------------------------------------------------
  // Shown before the task. These screens exist because the manipulations
  // are colour and local contrast, so the display is part of the
  // measurement — see the module headers in src/calibration/.
  calibration: {
    button_continue: 'Continue',

    brightness_title: 'Screen brightness',
    brightness_intro:
      '<p>Some of the pictures in this study differ only in their darker ' +
      'areas. If your screen is dimmed, those differences disappear.</p>' +
      '<p>Please turn your screen brightness up to its <strong>highest ' +
      'setting</strong> now, and leave it there for the whole session.</p>',
    // Viewing-conditions note. Not confirmed, not recorded.
    brightness_filters:
      '<p>If you can, please also switch off night mode, blue-light filters ' +
      'or colour filters on this device. If you do not know whether these ' +
      'are on, or how to switch them off, do not worry and simply ' +
      'continue.</p>',
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

    // When the link carries no participant ID: an ID, or a name AND an
    // email address, are needed to continue.
    body_no_pid:    '<p>Please enter your participant ID from your invitation ' +
                    'email.</p>' +
                    '<p>If you do not have it, enter your <b>name</b> and ' +
                    '<b>email address</b> instead. Giving all three is best.</p>' +
                    '<p>Your name and email address are stored separately from ' +
                    'your answers. They are used only to contact you about this ' +
                    'study and, if you give no ID, to link your answers to ' +
                    'you.</p>',
    name_label_plain:  'Name',
    email_label_plain: 'Email address',
    // Plain text: shown by the browser in a small bubble.
    need_id_or_contact: 'Please enter your participant ID, or your name and ' +
                        'email address.',

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

  // --- Grid blocks ------------------------------------------------------
  // Two blocks: `episode` after the pair trials, `normal` after the word
  // ratings. Each has its own short instruction screen. The episode
  // instructions are the same for both groups and point to the question
  // on screen; question_episode is GROUP-DEPENDENT. The normal block's
  // question is the same for both groups.
  grid: {
    episode: {
      title: 'Choosing a column',
      instructions:
        '<p>On the next four screens you will see three scenes, one in each ' +
        'row. Each scene is shown several times across the screen, adjusted to ' +
        'a different degree each time. Each <b>column</b> shows one degree of ' +
        'adjustment.</p>' +
        '<p>Answer the question at the top of each screen by choosing a ' +
        'column. Click anywhere in a column to choose it.</p>' +
        '<p>If no column fits, choose <b>None of these</b>.</p>' +
        '<p>You can change your choice before pressing Continue. There is no ' +
        'time limit.</p>',
    },
    normal: {
      title: 'One more set of screens',
      instructions:
        '<p>The next four screens work the same way, with different ' +
        'scenes.</p>' +
        '<p>This time, choose the column that looks most like how your ' +
        'surroundings <b>normally</b> look.</p>' +
        '<p>Click anywhere in a column to choose it. You can change your ' +
        'choice before pressing Continue. There is no time limit.</p>',
    },
    button_begin:    'Begin',
    question_episode: {
      participant: 'Which column looks most like how your surroundings looked during that episode?',
      control:     'Which column looks most like how the surroundings might look to someone experiencing derealization?',
    },
    question_normal: 'Which column looks most like how your surroundings normally look?',
    none:            'None of these',
    button_continue: 'Continue',
    progress:        'Screen {DONE} of {TOTAL}',
    // Shown right after a screen answered "None of these" (episode block,
    // CONFIG.blocks.grid_none_followup), under the shrunk grid. Not
    // required; recorded on that screen's row as none_detail. The options
    // point to POSITIONS, never to visual qualities. Keep the codes, and
    // keep them identical in text/ja.
    none_followup: {
      question: 'You chose &ldquo;None of these&rdquo;. Which comes closest?',
      options: [
        { code: 'beyond_left',  label: 'Further than the column at the far left' },
        { code: 'beyond_right', label: 'Further than the column at the far right' },
        { code: 'between',      label: 'Somewhere between two of the columns' },
        { code: 'other_way',    label: 'Different in a way these pictures don&rsquo;t show' },
        { code: 'cant_say',     label: 'I can&rsquo;t say' },
      ],
      button: 'Continue',
    },
  },

  // --- State items (optional block at the end) --------------------------
  // >>> PLACEHOLDERS: paste the exact published English wording of items
  // 2, 13, 19 and 29 into `label`. Keep the ids and the order. <<<
  // Same 0-6 scale as the word ratings; every item must be answered.
  state: {
    lead_in:     'Right now, at this moment:',
    anchor_low:  'not at all',
    anchor_high: 'completely',
    items: [
      { id: 'q02', label: '[CDS item 2: paste wording]' },
      { id: 'q13', label: '[CDS item 13: paste wording]' },
      { id: 'q19', label: '[CDS item 19: paste wording]' },
      { id: 'q29', label: '[CDS item 29: paste wording]' },
    ],
    button_submit: 'Continue',
    progress:      '{DONE} of {TOTAL} answered',
  },

  // --- Breaks -----------------------------------------------------------
  // {DONE} and {TOTAL} are filled in from the trial list (205 main trials,
  // a break after every 41).
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
