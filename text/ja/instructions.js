/* =========================================================================
 * text/ja/instructions.js — every participant-facing string, Japanese.
 *
 * ⚠️  DRAFT TRANSLATION — NOT YET REVIEWED  ⚠️
 *
 * These strings were drafted as a working placeholder so the Japanese path
 * can be tested end to end. They have NOT been checked by a native speaker.
 *
 * Two of them are load-bearing for the science and must be reviewed with
 * Keisuke before any participant sees them:
 *
 *   prompt.main      — the question the whole study turns on. "how the world
 *                      LOOKED" (visual appearance) must not drift into "how
 *                      the world FELT" (emotional quality), and the
 *                      derealization framing has to match the wording used
 *                      in the CDS-29 screening the participants completed.
 *
 *   practice.body    — establishes what the participant thinks they are
 *                      judging, and therefore what the responses mean.
 *
 * The key structure must stay identical to text/en/instructions.js.
 * validate.js compares the two and refuses to start if they diverge.
 * ========================================================================= */

var TEXT_JA = {

  lang_name: '日本語',

  // --- Prompts shown above the image pair -------------------------------
  prompt: {
    main: 'どちらの画像が、あなたに見えていた世界の見え方に近いですか？',

    catch: '{ARROW} の矢印キーを押してください',

    side_left:  '左',
    side_right: '右',
  },

  // --- Practice ---------------------------------------------------------
  practice: {
    title: '練習',
    body:
      '<p>同じ場所を写した2枚の画像が並んで表示されます。2枚は加工の' +
      'しかたが異なります。</p>' +
      '<p><b>世界が非現実的に、あるいは見慣れないものに感じられたとき</b>の' +
      '見え方に、より近いと思うほうを選んでください。</p>' +
      '<p>正解・不正解はありません。最初の印象で選んでください。</p>' +
      '<p><b>&#8592;</b> と <b>&#8594;</b> の矢印キーで、左右どちらかの画像を' +
      '選びます。</p>' +
      '<p>まず練習から始めます。</p>',
    continue_hint: '<b>スペースキー</b>を押すと練習が始まります。',

    end_title: '練習は終了です',
    end_body:
      '<p>練習はこれで終わりです。</p>' +
      '<p>本番も同じ方法で進みます。約140試行、15分程度かかります。</p>' +
      '<p>ときどき、選択ではなく特定のキーを押すよう指示される試行があります。' +
      'これは注意が持続しているかを確認するためのものです。画面の指示に' +
      '従ってください。</p>',
    end_hint: '<b>スペースキー</b>を押すと本番が始まります。',
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
