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
  > You may be asked a few short questions about the experience you are thinking of, such as when and where it happened. These questions are optional. Your answers, including anything you type under “Other”, are stored with your responses, so please do not include names or other details that could identify you or anyone else.
  > 
  > **Voluntary participation:** taking part is voluntary. You may stop at any time by closing this page. Your responses are saved only at the end of the study, so if you close the page before then, none of them are saved. The exception is your name and email address: they are optional, and if you give them they are saved straight away, separately from your responses, even if you do not finish. If you take part without a participant ID, your name and email address are what links your responses to you. [How to withdraw data after submission.]
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
  > 思い浮かべている体験について、いつ・どこで起きたかなど、いくつかの短い質問をする場合があります。これらの質問への回答は任意です。回答（「その他」に記入した内容を含む）は回答データとともに保存されますので、ご自身や他の人の名前など、個人を特定できる情報は書かないでください。
  > 
  > **自由意思による参加：**参加は自由意思によるものです。このページを閉じることで、いつでも中止できます。回答は研究の最後にまとめて保存されるため、それより前にページを閉じた場合、回答は保存されません。ただし、お名前とメールアドレス（いずれも任意）を入力された場合は、最後まで終えなかったときでも、入力した時点で回答とは別に保存されます。参加者IDなしで参加された場合は、お名前とメールアドレスによって回答とあなたを照合します。[提出後のデータ撤回の方法]
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

## ID screen — link without a participant ID (ID, or name and email)

- [ ] **8. instructions.js → `id.body_no_pid`**

  English:

  > Please enter your participant ID from your invitation email.
  > 
  > If you do not have it, enter your **name** and **email address** instead. Giving all three is best.
  > 
  > Your name and email address are stored separately from your answers. They are used only to contact you about this study and, if you give no ID, to link your answers to you.

  日本語（下書き）:

  > 案内メールに記載された参加者IDを入力してください。
  > 
  > IDがわからない場合は、代わりに**お名前**と**メールアドレス**を入力してください。3つすべてを入力していただくのが最善です。
  > 
  > お名前とメールアドレスは回答データとは別に保存され、本研究に関するご連絡と、IDがない場合にあなたの回答を照合するためにのみ使用します。

- [ ] **9. instructions.js → `id.name_label_plain`**

  English:

  > Name

  日本語（下書き）:

  > お名前

- [ ] **10. instructions.js → `id.email_label_plain`**

  English:

  > Email address

  日本語（下書き）:

  > メールアドレス

- [ ] **11. instructions.js → `id.need_id_or_contact`**  
  _Shown by the browser in a small bubble next to the ID field._

  English:

  > Please enter your participant ID, or your name and email address.

  日本語（下書き）:

  > 参加者ID、またはお名前とメールアドレスを入力してください。

## Incomplete link (no group in the link)

- [ ] **12. instructions.js → `link.missing_title`**

  English:

  > Incomplete link

  日本語（下書き）:

  > リンクが不完全です

- [ ] **13. instructions.js → `link.missing_body`**

  English:

  > This link is incomplete. Please use the full link from your invitation email, or contact the researcher.

  日本語（下書き）:

  > このリンクは不完全です。案内メールに記載されたリンクをそのまま使用するか、実験者にご連絡ください。

## Full screen and window check (hard stop)

- [ ] **14. instructions.js → `screen.small_title`**

  English:

  > This window is too small for the study

  日本語（下書き）:

  > このウィンドウはこの実験には小さすぎます

- [ ] **15. instructions.js → `screen.small_body`**

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

- [ ] **16. instructions.js → `screen.small_size`**  
  _Unchanged; listed for context._

  English:

  > Your display area is {W} × {H} pixels. At least {MW} × {MH} is recommended.

  日本語（下書き）:

  > 現在の表示領域は {W} × {H} ピクセルです。{MW} × {MH} ピクセル以上を推奨します。

## Brightness screen — viewing-conditions note

- [ ] **17. instructions.js → `calibration.brightness_filters`**  
  _Check the usual Japanese names of these settings on phones/PCs (ナイトモード, ナイトシフト, ブルーライトカット, カラーフィルター)._

  English:

  > If you can, please also switch off night mode, blue-light filters or colour filters on this device. If you do not know whether these are on, or how to switch them off, do not worry and simply continue.

  日本語（下書き）:

  > 可能であれば、この端末のナイトモード、ブルーライトカット、カラーフィルターなどの機能もオフにしてください。これらがオンになっているかわからない場合や、オフにする方法がわからない場合は、気にせずそのまま進んでください。

## Anchoring screen

- [ ] **18. instructions.js → `anchoring.title`**

  English:

  > Before you begin

  日本語（下書き）:

  > 課題の前に

- [ ] **19. instructions.js → `anchoring.body.participant`**  
  _LOAD-BEARING. Fixes the episode every later judgment refers to: the most recent one remembered clearly._

  English:

  > Please bring to mind your most recent episode that you remember clearly, in which your surroundings felt different from usual.
  > 
  > Throughout this study, please answer about that episode.

  日本語（下書き）:

  > 周囲がいつもと違って感じられたエピソードのうち、はっきりと覚えている中で最も最近のものを一つ思い浮かべてください。
  > 
  > この研究では、最後までそのエピソードについてお答えください。

- [ ] **20. instructions.js → `anchoring.body.control`**  
  _LOAD-BEARING. 現実感喪失 should match the term in the Japanese CDS-29. Must not use visual words._

  English:

  > Derealization is an experience in which one’s surroundings feel strange or detached, as if one were cut off from the world.
  > 
  > In this study, please imagine how the surroundings might look to someone experiencing derealization.

  日本語（下書き）:

  > 現実感喪失とは、周囲が奇妙に、あるいはよそよそしく感じられ、まるで自分が世界から切り離されているかのように感じられる体験です。
  > 
  > この研究では、現実感喪失を体験している人には周囲がどのように見えるかを想像してお答えください。

- [ ] **21. instructions.js → `anchoring.questions_intro`**

  English:

  > A few optional questions about that episode:

  日本語（下書き）:

  > そのエピソードについてのいくつかの質問です（いずれも任意）：

- [ ] **22. instructions.js → `anchoring.questions.when.label`**

  English:

  > When was it?

  日本語（下書き）:

  > それはいつでしたか？

- [ ] **23. instructions.js → `anchoring.questions.when.options`**

  English:

  > - Within the past week  (`past_week`)
  > - Within the past month  (`past_month`)
  > - 1–6 months ago  (`1_6_months`)
  > - 6–12 months ago  (`6_12_months`)
  > - More than a year ago  (`over_year`)

  日本語（下書き）:

  > - 1週間以内  (`past_week`)
  > - 1か月以内  (`past_month`)
  > - 1～6か月前  (`1_6_months`)
  > - 6～12か月前  (`6_12_months`)
  > - 1年以上前  (`over_year`)

- [ ] **24. instructions.js → `anchoring.questions.duration.label`**

  English:

  > How long did it last?

  日本語（下書き）:

  > どのくらい続きましたか？

- [ ] **25. instructions.js → `anchoring.questions.duration.options`**

  English:

  > - Seconds  (`seconds`)
  > - A few minutes  (`minutes`)
  > - Up to an hour  (`up_to_hour`)
  > - Several hours  (`hours`)
  > - A day or longer  (`day_or_longer`)

  日本語（下書き）:

  > - 数秒  (`seconds`)
  > - 数分  (`minutes`)
  > - 1時間以内  (`up_to_hour`)
  > - 数時間  (`hours`)
  > - 1日以上  (`day_or_longer`)

- [ ] **26. instructions.js → `anchoring.questions.where.label`**

  English:

  > Where were you?

  日本語（下書き）:

  > どこにいましたか？

- [ ] **27. instructions.js → `anchoring.questions.where.options`**

  English:

  > - At home  (`home`)
  > - At work or school  (`work_school`)
  > - Another indoor place  (`indoor_other`)
  > - Outdoors  (`outdoors`)
  > - Travelling  (`travelling`)

  日本語（下書き）:

  > - 自宅  (`home`)
  > - 職場・学校  (`work_school`)
  > - その他の屋内  (`indoor_other`)
  > - 屋外  (`outdoors`)
  > - 移動中  (`travelling`)

- [ ] **28. instructions.js → `anchoring.questions.clarity.label`**

  English:

  > How clearly do you remember it?

  日本語（下書き）:

  > そのエピソードをどのくらいはっきり覚えていますか？

- [ ] **29. instructions.js → `anchoring.questions.clarity.anchor_low`**

  English:

  > not at all clearly

  日本語（下書き）:

  > まったくはっきりしない

- [ ] **30. instructions.js → `anchoring.questions.clarity.anchor_high`**

  English:

  > very clearly

  日本語（下書き）:

  > とてもはっきり覚えている

- [ ] **31. instructions.js → `anchoring.other`**  
  _Followed by a short text field._

  English:

  > Other:

  日本語（下書き）:

  > その他：

- [ ] **32. instructions.js → `anchoring.prefer_not`**

  English:

  > Prefer not to say

  日本語（下書き）:

  > 回答しない

- [ ] **33. instructions.js → `anchoring.button`**

  English:

  > Continue

  日本語（下書き）:

  > 次へ

## Trial prompt (shown on every image trial)

- [ ] **34. instructions.js → `prompt.main.participant`**  
  _LOAD-BEARING. その…エピソード must clearly refer back to the anchoring episode._

  English:

  > Which looks more like how your surroundings looked during that episode?

  日本語（下書き）:

  > そのエピソード中の周囲の風景の見え方に、より近いのはどちらですか？

- [ ] **35. instructions.js → `prompt.main.control`**  
  _LOAD-BEARING. Must fit on one line above the pictures if possible._

  English:

  > Which looks more like how the surroundings might look to someone experiencing derealization?

  日本語（下書き）:

  > 現実感喪失を体験している人にとっての周囲の風景の見え方に、より近いと思うのはどちらですか？

## Practice (now the same for both groups; the interview is no longer mentioned)

- [ ] **36. instructions.js → `practice.body`**

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

- [ ] **37. instructions.js → `practice.end_body`**  
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

- [ ] **38. instructions.js → `grid.episode.title`**

  English:

  > Choosing a column

  日本語（下書き）:

  > 列を選ぶ課題

- [ ] **39. instructions.js → `grid.episode.instructions`**

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

- [ ] **40. instructions.js → `grid.question_episode.participant`**  
  _LOAD-BEARING._

  English:

  > Which column looks most like how your surroundings looked during that episode?

  日本語（下書き）:

  > そのエピソード中の周囲の風景の見え方に、最も近いのはどの列ですか？

- [ ] **41. instructions.js → `grid.question_episode.control`**  
  _LOAD-BEARING._

  English:

  > Which column looks most like how the surroundings might look to someone experiencing derealization?

  日本語（下書き）:

  > 現実感喪失を体験している人にとっての周囲の風景の見え方に、最も近いと思うのはどの列ですか？

- [ ] **42. instructions.js → `grid.none`**  
  _Unchanged; listed for context._

  English:

  > None of these

  日本語（下書き）:

  > どれも当てはまらない

- [ ] **43. instructions.js → `grid.none_followup.question`**  
  _Shown under the shrunk grid after “None of these”. The options name positions on the screen only — keep them free of visual words._

  English:

  > You chose “None of these”. Which comes closest?

  日本語（下書き）:

  > 「どれも当てはまらない」を選びました。最も近いのはどれですか？

- [ ] **44. instructions.js → `grid.none_followup.options`**

  English:

  > - Further than the column at the far left  (`beyond_left`)
  > - Further than the column at the far right  (`beyond_right`)
  > - Somewhere between two of the columns  (`between`)
  > - Different in a way these pictures don’t show  (`other_way`)
  > - I can’t say  (`cant_say`)

  日本語（下書き）:

  > - いちばん左の列よりも、さらに先  (`beyond_left`)
  > - いちばん右の列よりも、さらに先  (`beyond_right`)
  > - 2つの列のあいだのどこか  (`between`)
  > - これらの画像には表れていない違い  (`other_way`)
  > - わからない  (`cant_say`)

- [ ] **45. instructions.js → `grid.none_followup.button`**

  English:

  > Continue

  日本語（下書き）:

  > 次へ

## Word ratings

- [ ] **46. words.js → `title`**

  English:

  > Rating words

  日本語（下書き）:

  > 言葉の評価

- [ ] **47. words.js → `instruction.participant`**

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

- [ ] **48. words.js → `instruction.control`**

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

- [ ] **49. words.js → `question_short.participant`**

  English:

  > During that episode, how well does each word describe how your surroundings looked?

  日本語（下書き）:

  > そのエピソード中、それぞれの言葉は、あなたの周囲の風景の見え方をどの程度よく表していますか。

- [ ] **50. words.js → `question_short.control`**

  English:

  > How well does each word describe how the surroundings might look to someone experiencing derealization?

  日本語（下書き）:

  > それぞれの言葉は、現実感喪失を体験している人にとっての周囲の風景の見え方を、どの程度よく表していると思いますか。

## Normal-appearance grid block

- [ ] **51. instructions.js → `grid.normal.title`**

  English:

  > One more set of screens

  日本語（下書き）:

  > もう一度、列を選ぶ課題

- [ ] **52. instructions.js → `grid.normal.instructions`**

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

- [ ] **53. instructions.js → `grid.question_normal`**

  English:

  > Which column looks most like how your surroundings normally look?

  日本語（下書き）:

  > ふだんのあなたの周囲の風景の見え方に、最も近いのはどの列ですか？

## State items (optional block at the end)

- [ ] **54. instructions.js → `state.lead_in`**  
  _Drafted. If the published Japanese version of the questionnaire has its own lead-in for the state form, use that instead._

  English:

  > Right now, at this moment:

  日本語（下書き）:

  > 今、この瞬間：

- [ ] **55. instructions.js → `state.anchor_low`**  
  _Same Japanese as the word-rating anchor, as requested (the English differs: “not at all”)._

  English:

  > not at all

  日本語（下書き）:

  > まったく当てはまらない

- [ ] **56. instructions.js → `state.anchor_high`**  
  _Same Japanese as the word-rating anchor, as requested (the English differs: “completely” vs the word ratings’ “exactly”)._

  English:

  > completely

  日本語（下書き）:

  > 非常によく当てはまる

- [ ] **57. instructions.js → `state.progress`**

  English:

  > {DONE} of {TOTAL} answered

  日本語（下書き）:

  > {TOTAL} 項目中 {DONE} 項目に回答済み

- [ ] **58. instructions.js → `state.button_submit`**

  English:

  > Continue

  日本語（下書き）:

  > 次へ

