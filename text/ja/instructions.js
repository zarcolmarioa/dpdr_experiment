/* =========================================================================
 * text/ja/instructions.js — every participant-facing string, Japanese.
 *
 * ⚠️  DRAFT TRANSLATION — NOT REVIEWED BY A NATIVE SPEAKER  ⚠️
 *
 * Written so the Japanese path can be tested end to end. Three strings are
 * load-bearing for the science and must be checked with Keisuke before any
 * participant sees them:
 *
 *   prompt.main     — the question the study turns on.
 *   practice.body   — establishes what the participant thinks they judge.
 *   catch.instruction — must be unmistakable; a confusing translation here
 *                       produces false exclusions.
 *
 * The framing rules in text/en/instructions.js apply equally here:
 *   - NAME the condition (離人感・現実感喪失), never describe its qualities.
 *     No equivalents of "unreal", "dreamlike", "as if behind glass".
 *   - Anchor on SURROUNDINGS (周囲の風景), not on the self.
 *   - Acknowledge the adjustment without specifying colour or haze.
 *   - Nothing suggesting a detection task ("which looks more edited").
 *
 * The clinical term should match the wording used in the CDS-29 the
 * participants already completed — worth checking against that instrument
 * rather than choosing a translation independently.
 *
 * Key structure must stay identical to the English file. validate.js
 * compares the two and refuses to start if they diverge.
 * ========================================================================= */

var TEXT_JA = {

  lang_name: '日本語',

  // --- Prompts shown above the image pair -------------------------------
  prompt: {
    main: 'エピソード中のあなたの周囲の風景の見え方に、より近いのはどちらですか？',
  },

  // --- Catch trials -----------------------------------------------------
  catch: {
    lead:        '確認',
    instruction: '{KEYNAME}の矢印キーを押してください',
    key_up:      '上',
    key_down:    '下',
  },

  // --- Practice ---------------------------------------------------------
  practice: {
    title: '課題について',
    body:
      '<p>先日、ご経験についてのインタビューにご協力いただきました。</p>' +
      '<p>各試行では、同じ場所を写した2枚の画像が並んで表示されます。' +
      '2枚は異なる方法で加工されています。</p>' +
      '<p><b>離人感・現実感喪失のエピソード中</b>に、あなたの周囲の風景が' +
      'どのように見えていたか、それにより近いほうを選んでください。</p>' +
      '<p>正解・不正解はありません。記憶力を調べるものでもありません。' +
      '最初の印象で選んでください。</p>' +
      '<p><b>&#8592;</b> と <b>&#8594;</b> の矢印キーで、左または右の画像を' +
      '選びます。</p>' +
      '<p>まず練習から始めます。</p>',
    continue_hint: '<b>スペースキー</b>を押すと練習が始まります。',

    feedback_first:
      'こちらを選びました。正解・不正解はありません。印象のままで結構です。',

    end_title: '練習は終了です',
    end_body:
      '<p>練習はこれで終わりです。</p>' +
      '<p>本番も同じ方法で進みます。約140試行、15分程度かかります。' +
      '途中に短い休憩があります。</p>' +
      '<p><b>ときどき、画像のない画面が表示され</b>、特定の矢印キーを押すよう' +
      '指示されます。これは画面を読んでいるかを確認するためのものです。' +
      '制限時間はありませんので、ゆっくり読んでください。押せるのは一度' +
      'だけです。</p>',
    end_hint: '<b>スペースキー</b>を押すと本番が始まります。',
  },

  // --- Calibration ------------------------------------------------------
  calibration: {
    button_continue: '次へ',

    brightness_title: 'はじめる前に — 画面の明るさ',
    brightness_intro:
      '<p>この実験で使用する画像の中には、暗い部分だけが異なるものがあります。' +
      '画面が暗いと、その違いが見えなくなってしまいます。</p>' +
      '<p>画面の明るさを<strong>最大</strong>にして、実験中はそのままに' +
      'してください。</p>',
    brightness_checkbox:
      '画面の明るさを最大に設定したことを確認してください。',

    gamma_intro:
      '<p>次に、明るさの表示のしかたに関わる画面の特性を測定します。' +
      '短いマッチング課題を<strong>3回</strong>行います。</p>' +
      '<p>2つのパターンが並んで表示されます。右側を調整して、' +
      '2つが同じ灰色に見えるようにしてください。</p>' +
      '<p>少し離れて見たり、目を細めたりすると判断しやすくなります。</p>',
    gamma_button: '開始',
    gamma_prompt:
      '2つの四角が同じ灰色に見えるまで、右の四角を調整してください。' +
      '一致したら「確定」を押してください。',
    gamma_confirm_button: '確定',
  },

  // --- Participant details: ONE screen with ID, name and email ------------
  id: {
    title:          'はじめる前に',
    body:           '<p>案内メールに記載された参加者IDを入力してください。' +
                    'メール内のリンクからこのページを開いた場合は、' +
                    'すでに入力されています。</p>',
    id_label:       '参加者ID',
    id_hint:        '<code>R_</code> に続いて英数字15文字です。' +
                    '大文字と小文字は区別されます。',
    invalid:        'このIDを確認できませんでした。案内メールをご確認ください' +
                    '（大文字と小文字は区別されます）。',
    optional_note:  '<p><b>お名前</b>と<b>メールアドレス</b>の入力は' +
                    '<b>任意</b>です。入力された場合は回答データとは別に' +
                    '保存され、本研究に関するご連絡にのみ使用します。</p>',
    name_label:     'お名前（任意）',
    email_label:    'メールアドレス（任意）',
    button:         '次へ',

    missing_title:  '参加者IDがありません',
    missing_body:   '<p>このリンクは不完全です。案内メールに記載された' +
                    'リンクをそのまま使用するか、実験者にご連絡ください。</p>',

    retry_title:    'IDを確認できませんでした',
    retry_body:     '<p>案内メールを確認して、もう一度入力してください。</p>',
    retry_hint:     '<b>スペースキー</b>を押すと再入力できます。',
  },

  // --- End of session ------------------------------------------------------
  end: {
    saving:       '<div class="card"><h2>回答を保存しています</h2>' +
                  '<p>通常は数秒で完了します。</p>' +
                  '<p><b>このページを閉じないでください。</b></p></div>',

    title:        'ありがとうございました',
    body:         '<p>回答は保存されました。</p>' +
                  '<p>本研究にご参加いただき、誠にありがとうございました。' +
                  'このページを閉じていただいて構いません。</p>',
    contact_line: '本研究についてご質問がある場合は、{CONTACT} まで' +
                  'ご連絡ください。',

    fail_title:   '回答を自動で保存できませんでした',
    fail_body:    '<p>通信環境の問題が原因であることが多いです。</p>' +
                  '<p>下のボタンから回答をダウンロードし、そのファイルを ' +
                  '{CONTACT} までメールでお送りください。</p>' +
                  '<p><b>ダウンロードが完了するまで、このページを閉じないで' +
                  'ください。</b></p>',
    fail_button:  '回答をダウンロード',
    fail_done:    'ダウンロードが完了しました。メールでお送りいただいた後、' +
                  'このページを閉じていただいて構いません。',
  },

  // --- Breaks -----------------------------------------------------------
  brk: {
    title: '休憩',
    body: '<p>{TOTAL} 試行のうち {DONE} 試行が終わりました。</p>' +
          '<p>必要であれば少し休んでください。全画面表示のままにしてください。</p>',
    hint: '準備ができたら<b>スペースキー</b>を押してください。',
  },

  // --- Preloading -------------------------------------------------------
  preload: {
    message:
      '<div class="card">' +
      '<h2>画像を読み込んでいます</h2>' +
      '<p>実験に必要な画像をダウンロードしています。最初に一度だけ行われ、' +
      '通信環境によっては1分ほどかかることがあります。</p>' +
      '<p>このページを閉じないでください。</p>' +
      '</div>',
    error:
      '<div class="card">' +
      '<h2>画像を読み込めませんでした</h2>' +
      '<p>インターネット接続を確認して、ページを再読み込みしてください。</p>' +
      '<p>解決しない場合は実験者にご連絡ください。</p>' +
      '</div>',
  },

  // --- Errors -----------------------------------------------------------
  error: {
    title: 'エラーが発生しました',
    body:
      '<p>実験を開始できませんでした。ページを再読み込みしてください。</p>' +
      '<p>問題が続く場合は実験者にご連絡ください。</p>',
  },
};
