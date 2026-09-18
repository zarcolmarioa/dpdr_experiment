/* =========================================================================
 * text/ja/words.js — the descriptors rated before the image task, Japanese.
 *
 * ⚠️  DRAFT TRANSLATION — NOT REVIEWED BY A NATIVE SPEAKER  ⚠️
 *
 * This file needs more care than the others. The word ratings are the
 * PREDICTOR in the analysis, so a translation that shifts a word's meaning
 * shifts what the predictor measures.
 *
 * The two targets matter most:
 *
 *   foggy    — must be about VISUAL haze or mistiness, not mental fogginess
 *              or confusion. Several natural Japanese renderings drift
 *              toward "頭がぼんやりする" (mentally hazy), which would make
 *              the word predict something other than the image dimension.
 *
 *   lifeless — must be about the WORLD looking drained or inanimate, not
 *              about the participant feeling lifeless. The whole design
 *              depends on the judgment being about surroundings rather than
 *              the self.
 *
 * The fillers only need to be plausible, unrelated to colour or clarity,
 * and spread across visual and non-visual qualities.
 *
 * `id` values must match text/en/words.js exactly — they are the output
 * column names and validate.js checks the two lists agree.
 * ========================================================================= */

var WORDS_JA = {

  instruction:
    '<p>本番の課題の前に、ご自身の経験をどのように表現されるかを' +
    'お聞きします。</p>' +
    '<p>次の画面に言葉のリストが表示されます。<b>離人感・現実感喪失の' +
    'エピソード</b>を思い浮かべ、それぞれの言葉が、あなたの周囲の風景の' +
    '<b>見え方</b>をどの程度よく表しているか評価してください。</p>' +
    '<p>まったく当てはまらない言葉もあります。それで構いませんので、' +
    'すべての言葉について回答してください。</p>',

  question_short:
    'エピソード中、それぞれの言葉は周囲の風景の<b>見え方</b>を' +
    'どの程度よく表していますか。',

  button_begin:    '次へ',
  button_submit:   '次へ',
  progress:        '{TOTAL} 語中 {DONE} 語を評価済み',

  anchor_low:  'まったく当てはまらない',
  anchor_high: '非常によく当てはまる',

  items: [
    { id: 'foggy',      label: '霞がかった' },      // TARGET — visual haze
    { id: 'lifeless',   label: '生気のない' },      // TARGET — world drained
    { id: 'crowded',    label: '混み合った' },
    { id: 'echoing',    label: '反響するような' },
    { id: 'still',      label: '静止した' },
    { id: 'jagged',     label: 'ぎざぎざした' },
    { id: 'heavy',      label: '重い' },
    { id: 'warm',       label: '暖かい' },
    { id: 'rushed',     label: 'せわしない' },
    { id: 'cluttered',  label: '雑然とした' },
  ],
};
