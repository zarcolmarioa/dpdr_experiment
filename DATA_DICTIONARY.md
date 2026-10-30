# Output data: what a full session saves

What a session CSV from the derealization experiment contains, in the order
the participant produces it, and how to get from the raw file to an
analysable table.

Experiment: two-alternative forced choice between two edits of the same
photograph (local contrast and/or colour saturation), plus two descriptive
grid blocks, word ratings and state items. Stimulus set **v4** (frozen,
preregistered). Uploaded via DataPipe (experiment `yZIXKcYy54Uw`) to OSF
component `qsv56`.

---

## 1. One file per session

Each completed session uploads one CSV, named:

```
<participant_id>_<stimulus_set>_<timestamp>.csv
e.g. R_9rJJWk01c767jE8_v4_2026-11-03T05-10-40.csv
```

The timestamp is UTC in ISO 8601 format, with `:` and `.` replaced by `-`,
taken at the moment of upload.

A full session produces **660 rows and about 123 columns** (one or two more
rows if ID entry needed a retry).

**Nothing is saved until the very end.** The upload happens after the last
screen. A participant who closes the tab before then leaves no file. Two
early exits also leave no file, by design:

- **"I do not agree"** on the consent screen ends the session at once;
- the **window check** stops a session whose full-screen window cannot show
  the trial layout whole. It runs before the ID screen, so not even a
  name or email has been uploaded.

If the upload itself fails (network problem, or "Enable data collection"
switched off on DataPipe), the final screen offers the participant a button
to download the CSV and email it to you, so that session is not lost.

Name and email, if given, are **not** in this file. They go to a separate
file on a separate OSF component, uploaded as soon as they are entered —
see §13.

**`null` in the file.** jsPsych writes a missing value as the literal text
`null`. `pandas.read_csv` treats it as missing by default; other tools may
not.

---

## 2. The single most important thing

**One row is one SCREEN, not one experimental trial.**

jsPsych writes a row for every screen it shows: fixations, blanks,
instructions, calibration, breaks, the image download steps. Only 211 of
the 660 rows are image-pair trials, and **180** of those enter the
registered analysis.

Always filter first:

```python
import pandas as pd
d = pd.read_csv(path)
trials   = d[d.block == 'pairs']                     # 211 rows (6 practice + 205)
analysed = trials[trials.analysed == True]           # 180 rows
grid     = d[d.block.isin(['episode', 'normal'])]    # 8 rows
```

Never analyse the raw file without filtering. Averaging `rt` across all
rows, for example, mixes in fixation crosses and instruction pages.

---

## 3. What happens in a session, and what each step writes

The session is **the same for both groups**; only the wording of four
screens differs (§5, `group`). Steps are listed in the order the
participant sees them. The `block` column is how you find each step's rows.

| # | step | `block` | rows | what it saves |
|---|---|---|---|---|
| — | session stamps | *(empty)* | 1 | experiment, `group`, `interview_date`, `set_code`, display (§5) |
| 1 | Consent | `consent` | 1 | `consent_given` (also stamped on every row). Declining ends the session; no file |
| 2 | Full screen | `fullscreen` | 1 | — |
| 3 | Window check | `window_check` | 1 | `viewport_*_fs`, `viewport_ok`, `images_fit` (session-level). A window that is too small stops the session here (`screen_stop`, never saved) |
| 4 | Size check | `size_check` | 0 | **developer screen, off for participants** (dev preset only) |
| 5 | Participant details (ID + optional name and email) | `participant_id` | 1 | the ID, how it arrived, and only **whether** a name / email was given (§13) |
| — | ID stamp, background download start | *(empty)* | 2 | — |
| 6 | Brightness (+ viewing-conditions note) | `calibration_brightness` | 1 | `brightness_confirmed` (session-level). The note about night mode / colour filters is not confirmed or recorded |
| 7 | Gamma match | *(empty)* | 3 | `gamma_*` (session-level, §5) |
| 8 | Anchoring | `anchoring` | 1 | `episode_*` answers (participants, §6) |
| 9 | Image download gate | `preload` | 1 | `success`, `failed_images` |
| 10 | Practice | `practice_intro`, `pairs`, `fixation`, `blank`, `practice_feedback`, `practice_end` | 1 + 6 + 6 + 6 + 2 + 1 | practice responses, `analysed = False` |
| 11 | Pair trials | `pairs`, `fixation`, `blank`, `catch_lockout`, `break` | 205 + 195 + 195 + 10 + 4 | **the data** (§7) |
| 12 | Episode grid block | `grid_preload_episode`, `grid_instructions_episode`, `episode` | 1 + 1 + 4 | one row per screen (§8) |
| 13 | Word ratings | `word_instructions`, `word_ratings` | 1 + 1 | the ten ratings (§9); `rating_foggy`, `rating_faded` session-level |
| 14 | Normal-appearance grid block | `grid_preload_normal`, `grid_instructions_normal`, `normal` | 1 + 1 + 4 | one row per screen (§8) |
| 15 | State items | `state` | 1 | `state_q02` … `state_q29` (§10) |
| 16 | Save | *(empty)* | 1 | end-of-session stamps (§5) |

Each step has its own switch in `config.js` (`CONFIG.blocks`,
`CONFIG.calibration`). A step switched off writes no rows.

Rows with an empty `block` are internal steps: recording session
properties, starting the background image download, and the gamma screens.
Everything they measure is copied into the session-level columns, so you
never need those rows directly. The three gamma rows are the ones with a
`calibration_step` value, between `calibration_brightness` and `anchoring`.

`fixation` and `blank` number 201 (6 + 195) rather than 211 because the ten
catch trials have neither: they show no images. A catch trial appears as a
`catch_lockout` row (the first 750 ms, keys disabled) followed by a `pairs`
row that holds the response.

The four `break` rows come after main trials 41, 82, 123 and 164
(`CONFIG.timing.break_every = 41`), splitting the 205 into five equal
parts.

---

## 4. Two columns called "trial type"

| column | written by | contains |
|---|---|---|
| `trial_type` | jsPsych, automatically | the **plugin** name: `html-keyboard-response`, `call-function`, `fullscreen`, … |
| `pair_type` | this experiment | the **design** label: `sat_only`, `fog_only`, `together`, `conflict`, `consistency`, `catch`, `practice` |

`trial_type` exists because DataPipe's validation requires it. It tells you
nothing about the design. **Use `pair_type` for analysis.**

---

## 5. Session-level columns

These repeat identically on every row, so read them from any row with
`.iloc[0]`.

### Identity, link and exclusion flags

| column | example | notes |
|---|---|---|
| `participant_id` | `R_9rJJWk01c767jE8` | links to the CDS-29 record. Case-sensitive. **`NOID_DRCHAIN26_…`** (prefix + 8 random characters) when the participant gave a name and email but no ID — see below |
| `group` | `participant` / `control` | from `?group=` in the link. A link without a valid group does not start, so this is never empty in a saved file |
| `interview_date` | `2026-11-03` | from `?idate=YYYY-MM-DD` in the link. **Empty** if the link had none, or an invalid date |
| `consent_given` | `True` | always `True` in a saved file (declining saves nothing). Empty only for dev sessions run with the consent screen off |
| `is_test` | `False` | `True` when a test ID was used: `Z_21121989` (yours) or `CHAIN_2026` (colleagues) |
| `is_dev` | `False` | `True` when the session started from `dev.html`, or ran with a trial limit |
| `id_source` | `url` / `typed` / `no_id` | on the `participant_id` row only. `url` = came from the link unchanged; `no_id` = no ID given, name and email instead |
| `id_entered`, `id_valid` | | on the `participant_id` row only |
| `contact_name_given`, `contact_email_given` | `True` / `False` | whether the participant filled in the optional field |
| `contact_saved` | `True` / `False` / empty | whether DataPipe received the separate contact file. Empty if nothing was given |

**Exclude any session where `is_test` or `is_dev` is `True`.**

**Sessions without an ID.** When the link carried no valid ID, the
participant had to give either an ID or both a name and an email address.
Those who gave only a name and email have `participant_id` =
`NOID_DRCHAIN26_` + 8 random characters (unique per session) and
`id_source = no_id`. They are real sessions (`is_test = False`). The same
`participant_id` is in the contact file (§15), which is the **only** way
to tell who they are — so check `contact_saved` on these sessions. To find
them: `d.participant_id.str.startswith('NOID_')`.

### Experiment

| column | example |
|---|---|
| `experiment_name` | `derealization_grid` |
| `experiment_version` | `0.9.0-v4` (development); `1.0.0` from launch |
| `stimulus_set` | `v4` |
| `set_code` | `0` / `1` — the grid set swap, drawn once per session (§8) |
| `platform` | `github` / `pavlovia` / `local` |
| `language` | `en` / `ja` |
| `session_start_time`, `session_end_time` | ISO 8601, UTC. Start = when the consent screen was shown |

### Display

| column | meaning |
|---|---|
| `screen_width`, `screen_height` | the physical screen, in device pixels |
| `viewport_width`, `viewport_height` | usable area **before** full screen |
| `viewport_width_fs`, `viewport_height_fs` | usable area **in** full screen — the one that matters |
| `viewport_width_end`, `viewport_height_end` | usable area at the end. Differs from `_fs` if they left full screen |
| `device_pixel_ratio` | 1 on a standard display, 2 on Retina/HiDPI |
| `viewport_ok` | whether the full-screen area met the *recommended* minimum (1120 × 680) |
| `images_fit` | whether the real trial layout (the question + two 512 px images) fitted the window whole. Always `True` in a saved file: a window where it did not fit was stopped |
| `allow_scaling` | `False`: images were a fixed 512 px for everyone |
| `user_agent` | browser and operating system |

### Calibration

| column | meaning |
|---|---|
| `brightness_confirmed` | ticked "brightness at maximum". Always `True` for a completed session |
| `gamma_estimate` | **the one to use**: the median of the three matches |
| `gamma_estimate_1` … `_3` | the estimate from each match |
| `gamma_grey_match_1` … `_3` | the grey level (0–255) chosen in each match |
| `gamma_density_1` … `_3` | checkerboard density. Always `0.5` |
| `gamma_arrangement_used` | `split_field` or `centre_surround` |

### Target word ratings

| column | meaning |
|---|---|
| `rating_foggy` | 0–6 rating of *foggy* (= `word_foggy`) |
| `rating_faded` | 0–6 rating of *faded* (= `word_faded`) |

Copied to every row (including the pair-trial rows recorded before the
ratings), so a participant can be modelled without joining in another table.

---

## 6. The anchoring screen (`block == 'anchoring'`)

One row. The wording is one of the four group-dependent texts:
participants bring to mind their **most recent episode that they remember
clearly** and answer about it throughout; controls read what
derealization is and imagine how the surroundings might look to someone
experiencing it.

Participants then see up to four questions about that episode, each
switchable in `config.js` (`CONFIG.anchoring.questions`). **None is
required.** Controls see no questions; all these columns are empty for
them. On this row only.

| column | question on screen | values |
|---|---|---|
| `episode_when` | When was it? (hint: *e.g. last week, about two months ago*) | the typed text, trimmed; empty = left blank / switched off |
| `episode_duration` | How long did it last? (hint: *e.g. a few seconds, about an hour*) | the typed text; empty |
| `episode_where` | Where were you? (hint: *e.g. at home, on a train, in a shop*) | the typed text; empty |
| `episode_clarity` | How clearly do you remember it? | `0` (not at all clearly) … `6` (very clearly), `prefer_not`; empty |

The first three are short free-text answers (up to 200 characters), in the
participant's own words and language, so they need coding before
analysis. They are stored **with the responses**; the consent text asks
participants not to include names or other identifying details, but check
them before any data are shared.

---

## 7. The image-pair trials (`block == 'pairs'`)

211 rows: 6 practice + 205 main, in the frozen order of `trial_list.json`.

| `pair_type` | n | analysed | what differs between the two images |
|---|---|---|---|
| `practice` | 6 | no | — |
| `sat_only` | 60 | **yes** | colour saturation only |
| `fog_only` | 60 | **yes** | local contrast ("fog") only |
| `together` | 30 | **yes** | both, in the same direction |
| `conflict` | 30 | **yes** | both, in opposite directions |
| `consistency` | 15 | no | an earlier pair repeated, sides swapped |
| `catch` | 10 | no | no images; an attention check |

The trial prompt is group-dependent (`group`): participants are asked which
looks more like how their surroundings looked during *that episode*;
controls, which looks more like how the surroundings might look to someone
experiencing derealization.

### Identifying the trial

| column | meaning |
|---|---|
| `trial_index_list` | the trial's number in `trial_list.json` (1–211) |
| `pair_type` | design label, above |
| `analysed` | `True` for the 180 trials in the model |
| `scene_id` | e.g. `waiting_room_00002953`. Both images are always the same scene |
| `category` | scene category, e.g. `waiting_room` |

### The stimuli

| column | meaning |
|---|---|
| `left_path`, `right_path` | image files as shown, e.g. `stimuli/waiting_room_00002953__cp05__fp05.png` |
| `a_is_left` | **essential**: whether image A appeared on the left |

### The predictors

Copied unchanged from `trial_list.json` into every row, so the file needs
no join. See `data/sets/v4/README.txt` for their definitions.

| column | meaning |
|---|---|
| `pred_sat`, `pred_fog` | **the registered model's predictors**, in corpus-SD units. **Positive = image A is the predicted choice** (A less colourful, or A foggier) |
| `d_sat`, `d_fog` | raw signed differences, A − B, in feature units (for reference) |
| `z_sat`, `z_fog` | normalised differences (for reference) |
| `mag_bin` | magnitude bin, for dose–response plots |
| `catch_mode` | `no_images` on catch rows, empty elsewhere |
| `repeat_of` | consistency rows only: the earlier trial repeated |

There is **no `correct_response` column**: the v4 list has none, and catch
targets come from the experiment (below).

### The response

| column | meaning |
|---|---|
| `response` | the key as jsPsych recorded it, **lowercased**: `arrowleft`, `arrowright` |
| `response_key` | the same value, stored separately |
| `response_side` | **`left` or `right`** — the dependent variable |
| `rt` | ms from image onset to keypress. No time limit |
| `no_response` | should always be `False`. If `True`, key handling failed and the row needs checking |

**`response_side` records the key, not the choice.** Converting it to
"chose image A" happens in analysis (§11).

### Display verification

| column | meaning |
|---|---|
| `display_px` | configured image size (512) |
| `panel_rendered_px` | measured on-screen size, e.g. `512x512`. Should match |

### Catch trials only

| column | meaning |
|---|---|
| `catch_key` | the target: `ArrowUp` or `ArrowDown`, from `CONFIG.catch_trials.sequence` (5 up, 5 down, fixed order: ↑↓↓↑↓↑↑↓↑↓) |
| `catch_pass` | whether their single keypress matched |
| `catch_pressed_side` | `True` if they pressed ← or → instead |

Pressing ← or → means they answered as if it were an image trial, without
reading. Pressing some other key suggests they weren't paying attention at
all.

### Consistency trials only

The repeat shows the **same pair with the sides swapped**. Choosing the same
*image* therefore means pressing the **opposite side**.

---

## 8. The grid blocks (`block == 'episode'` / `'normal'`)

**Descriptive only** — nothing here enters a registered test. Eight rows,
one per screen: four in the episode block (after the pair trials), four in
the normal block (after the word ratings). Each screen shows three scenes
(rows) at six levels of one change (columns); the participant clicked one
column, or — episode block only — "None of these". Screens and column order
are fixed by `grid_trials.json`; nothing is randomised except the set swap.

**The set swap.** `set_code` is drawn once per session (p = .5):
`0` → episode block shows scene set A, normal block shows B; `1` → the
reverse. No photograph appears in both blocks. The split is binomial, not
exact — check it with `set_code`.

| column | meaning |
|---|---|
| `block` | `episode` or `normal` |
| `set_code` | the session's set swap (same as the session-level column) |
| `scene_set` | `A` or `B`, the set shown on this screen |
| `screen` | screen number from the file (1–4), shown in this order |
| `feature` | `fog` or `colour` |
| `column_order` | `forward` or `reversed`, as shipped |
| `scene_ids` | the three scenes, top to bottom, separated by `;` |
| `chosen_display_column` | 1-based position of the chosen column **as displayed**. Empty for "none". Do not analyse this directly |
| `chosen_level_index` | **the level chosen**: the column's `level_index` — 0 is the scene's own original, negative is more than normal, positive is less. Same meaning on forward and reversed screens. Empty for "none" |
| `chose_none` | `True` when "None of these" was used (episode block only; always `False` in the normal block) |
| `none_detail` | the answer to the optional follow-up after "None of these", "Which comes closest?": `beyond_left` (further than the column at the far left), `beyond_right` (further than the far right), `between` (somewhere between two columns), `other_way` (different in a way these pictures don't show), `cant_say`; empty if unanswered, if "None" was not chosen, or with the follow-up switched off (`CONFIG.blocks.grid_none_followup`) |
| `rt_ms` | ms from screen onset to the confirming click on Continue |
| `cell_px` | the cell size the layout computed for this block |
| `inner_w`, `inner_h` | the window size when the screen was shown |

The episode question is group-dependent (as for the pair trials); the
normal-block question ("…how your surroundings normally look?") is the
same for both groups.

**How the follow-up looks.** The grid stays in view, shrunk. The two
"Further than…" options sit just outside the first and the last column,
level with "Somewhere between two of the columns" in the middle; "Different
in a way these pictures don't show" and "I can't say" are below it.

**Reading `none_detail`.** "Left" and "right" are positions **as
displayed**, so their meaning depends on `column_order`: on a `forward`
screen the far-left column is the lowest `level_index` and the far right
the highest; on a `reversed` screen the other way round. So
`beyond_right` on a forward screen, and `beyond_left` on a reversed one,
both mean "beyond the strongest level shown"; the opposite pair means
"beyond the weakest end" (on fog screens: clearer than the original, which
the grid cannot show). The options name positions only, never visual
qualities, so nothing is primed before the word ratings. (This replaces
the free text of `interface_spec.md`; the package is unchanged.)

**Not in the data on purpose:** the level parameters (chroma, haze) and the
measured features. They are in `data/sets/v4/grid/grid_trials.csv`, keyed
by set, screen, row and column, and `sd_from_original` there is what the
normal-to-episode shift is computed in.

**Cell size is not fixed.** Unlike the pair panels (always 512 px), six
columns of 512 px fit no laptop, so the cell is computed once per block
from the window, for the widest screen in the package:
`max(100, floor(min((W − 48 − 5·22)/6 − 14, (H − 190 − 2·6)/3, 240)))` —
187 px at 1366 × 768, and the 240 px cap at 1920 × 1080. Treat `cell_px` as a
covariate.

**The fog axis is censored at the original.** The fog screens have no
column clearer than the photograph as taken, so a fog answer with
`chosen_level_index == 0` is a lower bound. Report the count of those per
block (see `interface_spec.md`).

```python
g = d[d.block.isin(['episode', 'normal'])]
g[['block', 'scene_set', 'screen', 'feature', 'column_order',
   'chose_none', 'chosen_level_index', 'none_detail']]

# Censored fog answers, per block
g[(g.feature == 'fog') & (g.chosen_level_index == 0)].groupby('block').size()
```

---

## 9. The word ratings (`block == 'word_ratings'`)

One row, holding all ten ratings, 0 = not at all … 6 = exactly. Taken after
the pair trials and the episode grid block, about the same episode
(participants) or the imagined experience (controls).

| column | meaning |
|---|---|
| `word_foggy`, `word_faded` | **the two targets**, 0–6 (also session-level as `rating_foggy`, `rating_faded`) |
| `word_veiled`, `word_lifeless`, `word_unreal`, `word_dreamlike`, `word_distant`, `word_like_a_picture`, `word_oppressive`, `word_threatening` | the other eight, 0–6 |
| `word_order` | the order the words appeared on screen (shuffled per participant) |
| `word_range` | highest rating minus lowest |
| `word_mean` | mean of all ten |
| `rt` | ms from the grid appearing to pressing Continue |

A `word_range` of 0 or 1 (every word rated the same) suggests the
participant was not discriminating between the words.

The `word_instructions` row before it is the instruction screen. It holds
no responses.

---

## 10. The state items (`block == 'state'`)

One row, at the end of the session (optional block, `CONFIG.blocks.state`).
"Right now, at this moment:" followed by four items from a published
questionnaire (items 2, 13, 19 and 29), fixed order, each 0 = not at all …
6 = completely; all four must be answered.

| column | meaning |
|---|---|
| `state_q02`, `state_q13`, `state_q19`, `state_q29` | 0–6 |
| `rt` | ms from the screen appearing to pressing Continue |

---

## 11. Getting to an analysable table

```python
import pandas as pd, numpy as np

d = pd.read_csv(path)

# Exclude test and dev sessions
s = d.iloc[0]
if s.is_test or s.get('is_dev', False):
    raise ValueError('test or dev session')

group = s.group                                      # 'participant' / 'control'

trials   = d[d.block == 'pairs'].copy()
analysed = trials[trials.analysed == True].copy()     # 180 rows

# Which IMAGE was chosen, not which side.
analysed['chose_A'] = np.where(
    analysed.a_is_left,
    analysed.response_side == 'left',
    analysed.response_side == 'right',
)
```

`chose_A` is the outcome; `pred_sat` and `pred_fog` are the registered
predictors (positive = A is the predicted choice), fitted **per
participant** as preregistered:

```
P(chose_A) ~ b_sat * pred_sat + b_fog * pred_fog
```

### Attention and quality checks

```python
# Catch trials
catch = trials[trials.pair_type == 'catch']
n_failed    = (~catch.catch_pass.astype(bool)).sum()          # of 10
habituation = catch.catch_pressed_side.astype(bool).sum()

# Consistency: sides are swapped, so the same choice = the opposite side
cons  = trials[trials.pair_type == 'consistency']
agree = 0
for _, r in cons.iterrows():
    orig = trials[trials.trial_index_list == r.repeat_of].iloc[0]
    agree += (r.response_side != orig.response_side)
consistency_rate = agree / len(cons)                          # of 15

# Side bias
side_bias = (analysed.response_side == 'left').mean()         # ~0.50

# Word-rating range
word_range = d.loc[d.block == 'word_ratings', 'word_range'].iloc[0]
```

A participant pressing arrows at random has a 1/4 chance on each catch
trial, so passing 7 or more of 10 by luck happens well under 1% of the
time. Someone pressing only ← or → fails every one.

---

## 12. Combining sessions

```python
import glob
frames = []
for f in glob.glob('data/*.csv'):
    d = pd.read_csv(f)
    s = d.iloc[0]
    if s.is_test or s.get('is_dev', False):
        continue
    frames.append(d[d.block == 'pairs'])
all_trials = pd.concat(frames, ignore_index=True)

by_group = all_trials.groupby('group')
```

Group by `participant_id`, and **split by `group`** before comparing
participants with controls. Check `stimulus_set == 'v4'` and
`experiment_version` on every file: sessions from older sets are not
comparable (different trial lists, different images).

---

## 13. Quick integrity check

For a complete, usable session:

| check | expected |
|---|---|
| `is_test`, `is_dev` | both `False` |
| `participant_id` | a real ID, or `NOID_…` with `contact_saved = True` |
| `group` | `participant` or `control` |
| `consent_given` | `True` |
| `stimulus_set` | `v4` |
| rows where `block == 'pairs'` | 211 |
| rows where `analysed == True` | 180 |
| `pair_type` counts | 60 sat_only, 60 fog_only, 30 together, 30 conflict, 15 consistency, 10 catch, 6 practice |
| `break` rows | 4 |
| rows where `block` is `episode` / `normal` | 4 / 4 |
| `set_code` | 0 or 1; `scene_set` A/B in the episode block and the other in the normal block, as in §8 |
| a `word_ratings` row | present, all ten `word_*` filled |
| `rating_foggy`, `rating_faded` | not empty |
| a `state` row | present, all four `state_q*` filled (if the block was on) |
| `gamma_estimate` | not empty |
| `response_side` missing (image trials) | 0 |
| `no_response` true | 0 |
| `panel_rendered_px` | all `512x512` |
| `images_fit` | `True` |
| `failed_images` (on the `preload` and `grid_preload_*` rows) | `[]` |

---

## 14. Columns you can ignore

These are written by jsPsych or its plugins rather than by the experiment:

`trial_index` (row counter), `internal_node_id` (timeline address),
`time_elapsed` (ms since the session started), `stimulus` (the screen's raw
HTML), `value`, `success` and `timeout` (download step), `failed_audio`,
`failed_video`, `calibration_step`, `gamma_matches`, `gamma_arrangement`.

`failed_images` is the exception. Glance at it on the `preload` row and on
the two `grid_preload_*` rows: anything other than `[]` means some images
did not load for that participant.

---

## 15. The separate contact file

If a participant gives a name or email on the ID screen, those values are
uploaded **straight away**, as a separate one-row CSV, to a separate
DataPipe experiment (`T2jZJusQxUGv`) and OSF component (`qt9x8`) — even if
the session is never finished. They are removed from the response data
before anything else happens, so the response files on `qsv56` stay
pseudonymised. (The consent text tells participants this.)

```
contact_<participant_id>_<timestamp>.csv
```

| column | meaning |
|---|---|
| `participant_id` | the link to the response file and to the CDS-29 record. For a participant who gave no ID, the generated `NOID_DRCHAIN26_…` ID — the same as in their response file, and the only link between the two |
| `name`, `email` | as typed. Either may be empty |
| `is_test`, `is_dev` | same meaning as in the response data |
| `stimulus_set`, `language` | for convenience |
| `saved_at` | UTC time of upload |

No file is written if both fields were left blank, and none for a session
that was declined at consent or stopped by the window check (both come
before the ID screen). It **is** written in local and dev runs, so the
upload can be tested quickly; those rows carry `is_test` / `is_dev` =
`true` and should be deleted or ignored. Restrict access to component
`qt9x8`, and delete it when your ethics approval requires, independently of
the response data.
