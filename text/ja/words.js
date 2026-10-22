/* =========================================================================
 * text/ja/words.js — the ten words rated in the word-rating task, Japanese.
 *
 * ⚠️  DRAFT TRANSLATION — NOT REVIEWED BY A NATIVE SPEAKER  ⚠️
 * (the ten word labels are the registered Japanese; the instruction and
 * question are drafts, listed in text/ja/STRINGS_TO_CHECK.md)
 *
 * The ratings are taken after the pair trials and the episode grid block,
 * about the same episode (participants) or the imagined experience
 * (controls). The two TARGETS are foggy (霞がかった) and faded (色あせた),
 * promoted to rating_foggy and rating_faded on every row.
 *
 * `id` values must match text/en/words.js exactly — they are the output
 * column names, and validate.js checks both lists against the registered
 * ten. Only `label` is participant-facing.
 *
 * GROUP-DEPENDENT STRINGS: `instruction` and `question_short`.
 * ========================================================================= */

var WORDS_JA = {

  title: '言葉の評価',
  instruction: {
    participant:
      '<p>次の画面に言葉のリストが表示されます。</p>' +
      '<p><b>そのエピソード中、それぞれの言葉は、あなたの周囲の風景の' +
      '見え方をどの程度よく表していますか。</b></p>' +
      '<p>すべての言葉について、0（まったく当てはまらない）から6（非常に' +
      'よく当てはまる）で評価してください。まったく当てはまらない言葉も' +
      'あります。それで構いませんので、すべての言葉について回答して' +
      'ください。</p>',
    control:
      '<p>次の画面に言葉のリストが表示されます。</p>' +
      '<p><b>それぞれの言葉は、現実感喪失を体験している人にとっての周囲の' +
      '風景の見え方を、どの程度よく表していると思いますか。</b></p>' +
      '<p>すべての言葉について、0（まったく当てはまらない）から6（非常に' +
      'よく当てはまる）で評価してください。まったく当てはまらない言葉も' +
      'あります。それで構いませんので、すべての言葉について回答して' +
      'ください。</p>',
  },

  question_short: {
    participant: 'そのエピソード中、それぞれの言葉は、あなたの周囲の風景の' +
                 '見え方をどの程度よく表していますか。',
    control:     'それぞれの言葉は、現実感喪失を体験している人にとっての' +
                 '周囲の風景の見え方を、どの程度よく表していると思いますか。',
  },

  button_begin:    '次へ',
  button_submit:   '次へ',
  progress:        '{TOTAL} 語中 {DONE} 語を評価済み',

  anchor_low:  'まったく当てはまらない',
  anchor_high: '非常によく当てはまる',

  items: [
    { id: 'foggy',          label: '霞がかった' },            // TARGET
    { id: 'faded',          label: '色あせた' },              // TARGET
    { id: 'veiled',         label: 'ベールがかかったような' },
    { id: 'lifeless',       label: '生気のない' },
    { id: 'unreal',         label: '現実味のない' },
    { id: 'dreamlike',      label: '夢のような' },
    { id: 'distant',        label: '遠く感じる' },
    { id: 'like_a_picture', label: '絵のような' },
    { id: 'oppressive',     label: '重苦しい' },
    { id: 'threatening',    label: '不穏な' },
  ],
};
