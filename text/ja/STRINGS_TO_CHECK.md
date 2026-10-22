# Japanese strings to check

Every participant-facing string that is **new or changed** for the v4 design, with its English, for a native speaker to check. Copied from `text/en/*.js` and `text/ja/*.js` when this list was made, so it matches what the experiment showed then (HTML tags stripped, **bold** kept). If the text files change, check them, not this list.

How to use: correct the Japanese **in `text/ja/instructions.js` or `text/ja/words.js`** (the key is given for each string), not in this file. Tick the box when a string is approved.

General rules that apply to every string (see the header of `text/en/instructions.js`):

- never describe the experience with visual words (no equivalents of foggy, blurred, faded, dull, colourless, unreal, dreamlike, flat, veiled, as if behind glass);
- never mention an interview;
- refer to the **surroundings** (周囲の風景), not to the self;
- acknowledge that the pictures are adjusted, without saying how;
- the participant and control versions of a string should differ only where the English differs.

**Not listed here:** the ten rated words, which are the registered Japanese (霞がかった, 色あせた, ベールがかかったような, 生気のない, 現実味のない, 夢のような, 遠く感じる, 絵のような, 重苦しい, 不穏な), and the four state items, which are paste-in placeholders for the published wording.

## Consent screen — PLACEHOLDER (to be replaced by the approved text)

- [ ] **1. instructions.js → `consent.title`**

  English:

  > Consent to take part

  日本語（下書き）:

  > 研究参加への同意

- [ ] **2. instructions.js → `consent.body`**  
  _Placeholder structure; keep the [bracketed gaps] until the approved text arrives. Check that the paragraphs on what is saved when are accurate._

  English:

  > You are invited to take part in a research study about how people perceive their surroundings. It is run by [researcher names] at [institution].
  > 
  > **What you will do:** look at pairs of photographs and choose between them, then answer a few short questions. It takes about [25] minutes.
  > 
  > **Risks:** we do not expect any risks beyond those of everyday computer use. Some questions ask about unusual experiences; you may stop at any time.
  > 
  > **Benefits:** there is no direct benefit to you. [Compensation, if any.]
  > 
  > **Your data:** your responses are stored under a study ID, without your name. Results are reported only for groups or without identifying information. [Storage period and who has access.] [Whether anonymised data may be shared publicly, e.g. on OSF.]
  > 
  > You may be asked to note, in a few words, which experience you are thinking of. This note is optional and is stored with your responses, so please do not include names or other details that could identify you or anyone else.
  > 
  > **Voluntary participation:** taking part is voluntary. You may stop at any time by closing this page. Your responses are saved only at the end of the study, so if you close the page before then, none of them are saved. The exception is your name and email address: they are optional, and if you give them they are saved straight away, separately from your responses, even if you do not finish. [How to withdraw data after submission.]
  > 
  > **Contact:** [researcher email]. For questions about your rights as a participant: [ethics committee contact]. [Ethics approval number.]

  日本語（下書き）:

  > 人が周囲をどのように知覚するかについての研究へのご協力をお願いしています。本研究は[所属機関]の[研究者名]が実施しています。
  > 
  > **参加内容：**2枚1組の写真を見てどちらかを選び、その後いくつかの短い質問にお答えいただきます。所要時間は約[25]分です。
  > 
  > **リスク：**日常的なコンピュータの使用を超えるリスクは想定していません。一部の質問では、普段とは異なる体験についてお尋ねします。いつでも参加を中止できます。
  > 
  > **利益：**参加による直接の利益はありません。[謝礼がある場合はその内容]
  > 
  > **データの扱い：**回答はお名前ではなく研究用IDのもとで保存されます。結果は集団としてまとめるか、個人が特定できない形でのみ報告します。[保存期間とアクセスできる者][匿名化したデータを公開する可能性（例：OSF）]
  > 
  > 思い浮かべている体験がどのようなものかを、短く書いていただく欄がある場合があります。この記入は任意で、回答とともに保存されます。ご自身や他の人の名前など、個人を特定できる情報は書かないでください。
  > 
  > **自由意思による参加：**参加は自由意思によるものです。このページを閉じることで、いつでも中止できます。回答は研究の最後にまとめて保存されるため、それより前にページを閉じた場合、回答は保存されません。ただし、お名前とメールアドレス（いずれも任意）を入力された場合は、最後まで終えなかったときでも、入力した時点で回答とは別に保存されます。[提出後のデータ撤回の方法]
  > 
  > **連絡先：**[研究者のメールアドレス]。参加者としての権利に関するご質問：[倫理委員会の連絡先]。[倫理審査承認番号]

- [ ] **3. instructions.js → `consent.checkbox`**

  English:

  > I have read the information above, I am at least 18 years old, and I agree to take part.

  日本語（下書き）:

  > 上記の説明を読みました。18歳以上であり、本研究への参加に同意します。

- [ ] **4. instructions.js → `consent.button_agree`**

  English:

  > I agree, continue

  日本語（下書き）:

  > 同意して次へ

- [ ] **5. instructions.js → `consent.button_decline`**

  English:

  > I do not agree

  日本語（下書き）:

  > 同意しない

- [ ] **6. instructions.js → `consent.declined_title`**

  English:

  > Thank you

  日本語（下書き）:

  > ありがとうございました

- [ ] **7. instructions.js → `consent.declined_body`**

  English:

  > You have chosen not to take part. Nothing has been saved.
  > 
  > You may now close this page.

  日本語（下書き）:

  > 参加しないことを選択されました。何も保存されていません。
  > 
  > このページを閉じていただいて構いません。

## Incomplete link (no group in the link)

- [ ] **8. instructions.js → `link.missing_title`**

  English:

  > Incomplete link

  日本語（下書き）:

  > リンクが不完全です

- [ ] **9. instructions.js → `link.missing_body`**

  English:

  > This link is incomplete. Please use the full link from your invitation email, or contact the researcher.

  日本語（下書き）:

  > このリンクは不完全です。案内メールに記載されたリンクをそのまま使用するか、実験者にご連絡ください。

## Full screen and window check (hard stop)

- [ ] **10. instructions.js → `screen.small_title`**

  English:

  > This window is too small for the study

  日本語（下書き）:

  > このウィンドウはこの実験には小さすぎます

- [ ] **11. instructions.js → `screen.small_body`**

  English:

  > This study shows two pictures side by side at a fixed size, so that everyone sees them in the same way. In this window, part of the pictures or of the question would be cut off.
  > 
  > Please make your browser window larger, or use a computer with a larger screen, and then open the link from your invitation again.
  > 
  > If your browser is zoomed in, setting the zoom back to 100% (Ctrl + 0, or ⌘ + 0 on a Mac) may be enough.

  日本語（下書き）:

  > この実験では、すべての参加者に同じように見えるよう、2枚の画像を決まった大きさで並べて表示します。このウィンドウでは、画像または質問の一部が切れてしまいます。
  > 
  > ブラウザのウィンドウを大きくするか、より大きな画面のコンピュータを使用して、案内メールのリンクをもう一度開いてください。
  > 
  > ブラウザが拡大表示になっている場合は、表示倍率を100%に戻す（Ctrl + 0、Macでは ⌘ + 0）だけで解決することがあります。

- [ ] **12. instructions.js → `screen.small_size`**  
  _Unchanged; listed for context._

  English:

  > Your display area is {W} × {H} pixels. At least {MW} × {MH} is recommended.

  日本語（下書き）:

  > 現在の表示領域は {W} × {H} ピクセルです。{MW} × {MH} ピクセル以上を推奨します。

## Brightness screen — viewing-conditions note

- [ ] **13. instructions.js → `calibration.brightness_filters`**  
  _Check the usual Japanese names of these settings on phones/PCs (ナイトモード, ナイトシフト, ブルーライトカット, カラーフィルター)._

  English:

  > If you can, please also switch off night mode, blue-light filters or colour filters on this device. If you do not know whether these are on, or how to switch them off, do not worry and simply continue.

  日本語（下書き）:

  > 可能であれば、この端末のナイトモード、ブルーライトカット、カラーフィルターなどの機能もオフにしてください。これらがオンになっているかわからない場合や、オフにする方法がわからない場合は、気にせずそのまま進んでください。

## Anchoring screen

- [ ] **14. instructions.js → `anchoring.title`**

  English:

  > Before you begin

  日本語（下書き）:

  > 課題の前に

- [ ] **15. instructions.js → `anchoring.body.participant`**  
  _LOAD-BEARING. Fixes the episode every later judgment refers to._

  English:

  > Please bring to mind one specific episode in which your surroundings felt different from usual, ideally a recent one that you remember clearly.
  > 
  > Throughout this study, please answer about that episode.

  日本語（下書き）:

  > 周囲がいつもと違って感じられた、具体的なエピソードを一つ思い浮かべてください。できれば、はっきりと覚えている最近のものを選んでください。
  > 
  > この研究では、最後までそのエピソードについてお答えください。

- [ ] **16. instructions.js → `anchoring.body.control`**  
  _LOAD-BEARING. 現実感喪失 should match the term in the Japanese CDS-29. Must not use visual words._

  English:

  > Derealization is an experience in which one’s surroundings feel strange or detached, as if one were cut off from the world.
  > 
  > In this study, please imagine how the surroundings might look to someone experiencing derealization.

  日本語（下書き）:

  > 現実感喪失とは、周囲が奇妙に、あるいはよそよそしく感じられ、まるで自分が世界から切り離されているかのように感じられる体験です。
  > 
  > この研究では、現実感喪失を体験している人には周囲がどのように見えるかを想像してお答えください。

- [ ] **17. instructions.js → `anchoring.note_label`**

  English:

  > In a few words, which episode is it? (for example, where you were)

  日本語（下書き）:

  > どのエピソードか、簡単にお書きください（例：どこにいたか）

- [ ] **18. instructions.js → `anchoring.note_hint`**

  English:

  > Optional. Please do not include names or other details that could identify you or anyone else.

  日本語（下書き）:

  > 任意です。ご自身や他の人の名前など、個人を特定できる情報は書かないでください。

- [ ] **19. instructions.js → `anchoring.button`**

  English:

  > Continue

  日本語（下書き）:

  > 次へ

## Trial prompt (shown on every image trial)

- [ ] **20. instructions.js → `prompt.main.participant`**  
  _LOAD-BEARING. その…エピソード must clearly refer back to the anchoring episode._

  English:

  > Which looks more like how your surroundings looked during that episode?

  日本語（下書き）:

  > そのエピソード中の周囲の風景の見え方に、より近いのはどちらですか？

- [ ] **21. instructions.js → `prompt.main.control`**  
  _LOAD-BEARING. Must fit on one line above the pictures if possible._

  English:

  > Which looks more like how the surroundings might look to someone experiencing derealization?

  日本語（下書き）:

  > 現実感喪失を体験している人にとっての周囲の風景の見え方に、より近いと思うのはどちらですか？

## Practice (now the same for both groups; the interview is no longer mentioned)

- [ ] **22. instructions.js → `practice.body`**

  English:

  > On each trial you will see two pictures of the same place, side by side. The two pictures have been adjusted in different ways.
  > 
  > A question is shown above the pictures. Choose the picture that fits the question better.
  > 
  > There is no right or wrong answer. Go with your first impression.
  > 
  > Use the **←** and **→** arrow keys to choose the picture on the left or on the right.
  > 
  > We will begin with a few practice trials.

  日本語（下書き）:

  > 各試行では、同じ場所を写した2枚の画像が並んで表示されます。2枚は異なる方法で加工されています。
  > 
  > 画像の上に質問が表示されます。その質問により当てはまるほうの画像を選んでください。
  > 
  > 正解・不正解はありません。最初の印象で選んでください。
  > 
  > **←** と **→** の矢印キーで、左または右の画像を選びます。
  > 
  > まず練習から始めます。

- [ ] **23. instructions.js → `practice.end_body`**  
  _New trial count (205) and duration (~10 minutes)._

  English:

  > That is the end of the practice.
  > 
  > The main part works the same way. It has 205 trials and takes about 10 minutes. There are short breaks along the way.
  > 
  > **Occasionally a screen will appear with no pictures**, asking you to press a particular arrow key. These check that you are still reading the screen. Take your time on them — there is no time limit, and you only get one press.

  日本語（下書き）:

  > 練習はこれで終わりです。
  > 
  > 本番も同じ方法で進みます。205試行で、約10分かかります。途中に短い休憩があります。
  > 
  > **ときどき、画像のない画面が表示され**、特定の矢印キーを押すよう指示されます。これは画面を読んでいるかを確認するためのものです。制限時間はありませんので、ゆっくり読んでください。押せるのは一度だけです。

## Episode grid block

- [ ] **24. instructions.js → `grid.episode.title`**

  English:

  > Choosing a column

  日本語（下書き）:

  > 列を選ぶ課題

- [ ] **25. instructions.js → `grid.episode.instructions`**

  English:

  > On the next four screens you will see three scenes, one in each row. Each scene is shown several times across the screen, adjusted to a different degree each time. Each **column** shows one degree of adjustment.
  > 
  > Answer the question at the top of each screen by choosing a column. Click anywhere in a column to choose it.
  > 
  > If no column fits, choose **None of these**.
  > 
  > You can change your choice before pressing Continue. There is no time limit.

  日本語（下書き）:

  > 次の4つの画面では、3つの風景が1行に1つずつ表示されます。それぞれの風景は横に並んで何度か表示され、表示ごとに加工の度合いが異なります。それぞれの**列**が一つの加工の度合いを示しています。
  > 
  > 各画面の上に表示される質問に、列を選んでお答えください。列の中のどこをクリックしても選択できます。
  > 
  > 当てはまる列がない場合は、**「どれも当てはまらない」**を選んでください。
  > 
  > 「次へ」を押すまでは選択を変更できます。時間制限はありません。

- [ ] **26. instructions.js → `grid.question_episode.participant`**  
  _LOAD-BEARING._

  English:

  > Which column looks most like how your surroundings looked during that episode?

  日本語（下書き）:

  > そのエピソード中の周囲の風景の見え方に、最も近いのはどの列ですか？

- [ ] **27. instructions.js → `grid.question_episode.control`**  
  _LOAD-BEARING._

  English:

  > Which column looks most like how the surroundings might look to someone experiencing derealization?

  日本語（下書き）:

  > 現実感喪失を体験している人にとっての周囲の風景の見え方に、最も近いと思うのはどの列ですか？

- [ ] **28. instructions.js → `grid.none`**  
  _Unchanged; listed for context._

  English:

  > None of these

  日本語（下書き）:

  > どれも当てはまらない

- [ ] **29. instructions.js → `grid.none_text_prompt`**  
  _Shown right after a screen answered “None of these”._

  English:

  > In your own words, what would have fitted better? (optional)

  日本語（下書き）:

  > どのようなものであればより当てはまったか、ご自身の言葉でお書きください（任意）。

## Word ratings

- [ ] **30. words.js → `title`**

  English:

  > Rating words

  日本語（下書き）:

  > 言葉の評価

- [ ] **31. words.js → `instruction.participant`**

  English:

  > On the next screen you will see a list of words.
  > 
  > **During that episode, how well does each word describe how your surroundings looked?**
  > 
  > Rate every word from 0 (not at all) to 6 (exactly). Some words will not apply at all. That is expected — please rate every word anyway.

  日本語（下書き）:

  > 次の画面に言葉のリストが表示されます。
  > 
  > **そのエピソード中、それぞれの言葉は、あなたの周囲の風景の見え方をどの程度よく表していますか。**
  > 
  > すべての言葉について、0（まったく当てはまらない）から6（非常によく当てはまる）で評価してください。まったく当てはまらない言葉もあります。それで構いませんので、すべての言葉について回答してください。

- [ ] **32. words.js → `instruction.control`**

  English:

  > On the next screen you will see a list of words.
  > 
  > **How well does each word describe how the surroundings might look to someone experiencing derealization?**
  > 
  > Rate every word from 0 (not at all) to 6 (exactly). Some words will not apply at all. That is expected — please rate every word anyway.

  日本語（下書き）:

  > 次の画面に言葉のリストが表示されます。
  > 
  > **それぞれの言葉は、現実感喪失を体験している人にとっての周囲の風景の見え方を、どの程度よく表していると思いますか。**
  > 
  > すべての言葉について、0（まったく当てはまらない）から6（非常によく当てはまる）で評価してください。まったく当てはまらない言葉もあります。それで構いませんので、すべての言葉について回答してください。

- [ ] **33. words.js → `question_short.participant`**

  English:

  > During that episode, how well does each word describe how your surroundings looked?

  日本語（下書き）:

  > そのエピソード中、それぞれの言葉は、あなたの周囲の風景の見え方をどの程度よく表していますか。

- [ ] **34. words.js → `question_short.control`**

  English:

  > How well does each word describe how the surroundings might look to someone experiencing derealization?

  日本語（下書き）:

  > それぞれの言葉は、現実感喪失を体験している人にとっての周囲の風景の見え方を、どの程度よく表していると思いますか。

## Normal-appearance grid block

- [ ] **35. instructions.js → `grid.normal.title`**

  English:

  > One more set of screens

  日本語（下書き）:

  > もう一度、列を選ぶ課題

- [ ] **36. instructions.js → `grid.normal.instructions`**

  English:

  > The next four screens work the same way, with different scenes.
  > 
  > This time, choose the column that looks most like how your surroundings **normally** look.
  > 
  > Click anywhere in a column to choose it. You can change your choice before pressing Continue. There is no time limit.

  日本語（下書き）:

  > 次の4つの画面も同じ方法で進みますが、表示される風景は異なります。
  > 
  > 今回は、**ふだん**のあなたの周囲の風景の見え方に最も近い列を選んでください。
  > 
  > 列の中のどこをクリックしても選択できます。「次へ」を押すまでは選択を変更できます。時間制限はありません。

- [ ] **37. instructions.js → `grid.question_normal`**

  English:

  > Which column looks most like how your surroundings normally look?

  日本語（下書き）:

  > ふだんのあなたの周囲の風景の見え方に、最も近いのはどの列ですか？

## State items (optional block at the end)

- [ ] **38. instructions.js → `state.lead_in`**  
  _Drafted. If the published Japanese version of the questionnaire has its own lead-in for the state form, use that instead._

  English:

  > Right now, at this moment:

  日本語（下書き）:

  > 今、この瞬間：

- [ ] **39. instructions.js → `state.anchor_low`**  
  _Same Japanese as the word-rating anchor, as requested (the English differs: “not at all”)._

  English:

  > not at all

  日本語（下書き）:

  > まったく当てはまらない

- [ ] **40. instructions.js → `state.anchor_high`**  
  _Same Japanese as the word-rating anchor, as requested (the English differs: “completely” vs the word ratings’ “exactly”)._

  English:

  > completely

  日本語（下書き）:

  > 非常によく当てはまる

- [ ] **41. instructions.js → `state.progress`**

  English:

  > {DONE} of {TOTAL} answered

  日本語（下書き）:

  > {TOTAL} 項目中 {DONE} 項目に回答済み

- [ ] **42. instructions.js → `state.button_submit`**

  English:

  > Continue

  日本語（下書き）:

  > 次へ

