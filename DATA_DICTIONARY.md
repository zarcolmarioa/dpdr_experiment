# Output data: what a full session saves

What a session CSV from the derealization grid experiment contains, in the
order the participant produces it, and how to get from the raw file to an
analysable table.

Experiment: two-alternative forced choice, chroma × haze, uploaded via
DataPipe (experiment `yZIXKcYy54Uw`) to OSF component `qsv56`.

---

## 1. One file per session

Each completed session uploads one CSV, named:

```
<participant_id>_<stimulus_set>_<timestamp>.csv
e.g. R_9rJJWk01c767jE8_lum_p05_2026-09-17T05-10-40.csv
```

The timestamp is UTC in ISO 8601 format, with `:` and `.` replaced by `-`,
taken at the moment of upload. The stimulus set is in the filename as well
as in the data, so you can sort the OSF component by set without opening
any files.

A full session produces roughly **445 rows and about 80 columns**. The
exact row count shifts by one or two, depending on whether the
small-screen warning appeared and how many attempts ID entry took.

**Nothing is saved until the very end.** The upload happens after the last
trial. A participant who closes the tab before then leaves no file. If the
upload itself fails (network problem, or "Enable data collection" switched
off on DataPipe), the final screen offers the participant a button to
download the CSV and email it to you, so that session is not lost.

Name and email, if given, are **not** in this file. They go to a separate
file on a separate OSF component — see §12.

---

## 2. The single most important thing

**One row is one SCREEN, not one experimental trial.**

jsPsych writes a row for every screen it shows: fixations, blanks,
instructions, calibration, breaks, the image download step. Only 143 of
the ~445 rows are image-pair trials, and **120** of those enter the
analysis.

Always filter first:

```python
import pandas as pd
d = pd.read_csv(path)
trials   = d[d.block == 'pairs']                # 143 rows
analysed = trials[trials.analysed == True]      # 120 rows
```

Never analyse the raw file without filtering. Averaging `rt` across all
rows, for example, mixes in fixation crosses and instruction pages.

---

## 3. What happens in a full session, and what each step writes

Steps are listed in the order the participant sees them. The `block`
column is how you find each step's rows.

| # | step | `block` | rows | what it saves |
|---|---|---|---|---|
| 1 | Participant ID | `participant_id` | 1 (more if a typed ID was rejected) | how the ID arrived. Session-level identity columns are stamped here — see §5 |
| 1b | Contact details (optional) | `contact` | 1, or 0 if name and email are both switched off | only **whether** a name / email was given. The values themselves are never in this file — see §12 |
| 2 | Fullscreen | `fullscreen` | 1 | — |
| 3 | Viewport check | *(empty)* + `screen_warning` | 1 + 0 or 1 | display measurements in fullscreen (§5). The warning row appears **only** if the screen was too small |
| 4 | Size check | `size_check` | 1 | `panel_rendered_w`, `panel_rendered_h` — the measured panel size |
| 5 | Brightness | `calibration_brightness` | 1 | `brightness_confirmed` (session-level) |
| 6 | Gamma match | *(empty)* | 3 | `gamma_*` (session-level, §5) |
| 7 | Word instructions | `word_instructions` | 1 | — |
| 8 | Word ratings | `word_ratings` + `word_grid` | 2 | the ten ratings (§6). `rating_foggy` and `rating_lifeless` are stamped session-level |
| 9 | Image download | `preload` | 1 | `success`, `failed_images` |
| 10 | Practice | `practice_intro`, `pairs`, `practice_feedback`, `practice_end`, `fixation`, `blank` | 1 + 6 + 2 + 1 + 6 + 6 | practice responses. `analysed = False` |
| 11 | Main block | `pairs`, `fixation`, `blank`, `catch_lockout`, `break` | 137 + 131 + 131 + 6 + 3 | **the data** (§7) |
| 12 | Save | *(empty)* | 1 | end-of-session stamps (§5) |

Rows with an empty `block` are internal steps: recording session
properties, starting the background image download, and the gamma screens.
Everything they measure is copied into the session-level columns, so you
never need those rows directly.

The gamma screens came from the earlier noise-estimation experiment
unchanged and have no `block` label. If you need to find them, they are
the three rows between `calibration_brightness` and `word_instructions`.

`fixation` and `blank` total 137 rather than 143 because the six catch
trials have neither. They show no images. A catch trial appears as a
`catch_lockout` row (the first 750 ms, keys disabled) followed by a
`pairs` row that holds the response.

---

## 4. Two columns called "trial type"

| column | written by | contains |
|---|---|---|
| `trial_type` | jsPsych, automatically | the **plugin** name: `html-keyboard-response`, `survey-text`, `fullscreen`, `call-function`, … |
| `pair_type` | this experiment | the **design** label: `sat_only`, `fog_only`, `together`, `conflict`, `consistency`, `catch`, `practice` |

`trial_type` exists because DataPipe's validation requires it. It tells you
nothing about the design. **Use `pair_type` for analysis.**

The design label is renamed on output because jsPsych would otherwise
overwrite it without warning.

---

## 5. Session-level columns

These repeat identically on every row after they are set, so read them
from any analysed row with `.iloc[0]`.

### Identity and exclusion flags

| column | example | notes |
|---|---|---|
| `participant_id` | `R_9rJJWk01c767jE8` | links to the CDS-29 record. Case-sensitive |
| `is_test` | `False` | `True` when the superuser ID `Z_21121989` was used |
| `is_dev` | `False` | `True` when the session started from `dev.html`, or ran with a trial limit |
| `id_source` | `url` / `typed` | on the `participant_id` row only |
| `id_entered`, `id_valid` | | on the `participant_id` row only, when the ID was typed |
| `contact_name_given`, `contact_email_given` | `True` / `False` | whether the participant filled in the optional field. Empty if that field was switched off |
| `contact_saved` | `True` / `False` / empty | whether the separate contact file uploaded. Empty if nothing was given |

**Exclude any session where `is_test` or `is_dev` is `True`.** A dev
session run with a trial limit is missing catch trials, consistency trials
and most of the predictor spread, so it cannot be analysed even partially.

### Experiment

| column | example |
|---|---|
| `experiment_name` | `derealization_grid` |
| `experiment_version` | `0.1.0-smoketest` |
| `stimulus_set` | `lum_p05` / `contrast_local` |
| `platform` | `github` / `pavlovia` / `local` |
| `language` | `en` / `ja` |
| `session_start_time`, `session_end_time` | ISO 8601, UTC |

### Stimulus set

| set | selection feature |
|---|---|
| `lum_p05` | 5th-percentile luminance |
| `contrast_local` | local contrast |

Each set has its own trial list and images. **Trial numbers and image paths
are only comparable within a set.** Always split on `stimulus_set` before
comparing sessions.

### Display

The manipulations are saturation and shadow lifting, so the screen is part
of the measurement.

| column | meaning |
|---|---|
| `screen_width`, `screen_height` | the physical screen, in device pixels |
| `viewport_width`, `viewport_height` | usable area **before** fullscreen |
| `viewport_width_fs`, `viewport_height_fs` | usable area **in** fullscreen — the one that matters |
| `viewport_width_end`, `viewport_height_end` | usable area at the end. Differs from `_fs` if they left fullscreen |
| `device_pixel_ratio` | 1 on a standard display, 2 on Retina/HiDPI. At 2, each 512 px image is upscaled 2×. Both images in a pair are scaled equally, so the differences are unaffected |
| `viewport_ok` | whether the fullscreen area met the recommended minimum (1120 × 680) |
| `images_fit` | whether both 512 px images fit side by side without being cut off |
| `allow_scaling` | `False`: images were a fixed 512 px for everyone |
| `user_agent` | browser and operating system |

**If `images_fit` is `False`, that participant saw partial images.** The
`screen_warning` row then also carries `continued_on_small_screen`.

### Calibration

| column | meaning |
|---|---|
| `brightness_confirmed` | ticked "brightness at maximum". Always `True` for a completed session, since they could not continue otherwise |
| `gamma_estimate` | **the one to use**: the median of the three matches |
| `gamma_estimate_1` … `_3` | the estimate from each match |
| `gamma_grey_match_1` … `_3` | the grey level (0–255) chosen in each match |
| `gamma_density_1` … `_3` | checkerboard density. Always `0.5` |
| `gamma_arrangement_used` | `split_field` or `centre_surround` |

Typical displays fall roughly between 1.8 and 2.6. A value far outside that
range, or three matches that disagree widely, usually means the task was
not done carefully rather than an unusual screen. Gamma cannot be used to
correct the images. Use it as a covariate, or to explain a participant
whose results look odd.

### Target word ratings

| column | meaning |
|---|---|
| `rating_foggy` | 0–6 rating of *foggy* |
| `rating_lifeless` | 0–6 rating of *lifeless* |

These are copied to every row after the word task, so you can model each
participant without joining in another table.

---

## 6. The word ratings (`block == 'word_ratings'`)

One row, holding all ten ratings.

| column | meaning |
|---|---|
| `word_foggy`, `word_lifeless` | **the two targets**, 0–6 |
| `word_crowded`, `word_echoing`, `word_still`, `word_jagged`, `word_heavy`, `word_warm`, `word_rushed`, `word_cluttered` | fillers, 0–6 |
| `word_order` | the order the words appeared on screen (shuffled per participant) |
| `word_range` | highest rating minus lowest |
| `word_mean` | mean of all ten |
| `rt` | ms from the grid appearing to pressing Continue |

**Why the fillers matter.** A participant who rates every word 5 or 6 is not
describing an experience, and their target ratings mean nothing. A
`word_range` of 0 or 1 is the sign to look for. The fillers were chosen to
have nothing to do with colour or clarity, so high filler ratings can't be
explained as real sensitivity to the manipulated features.

The `word_grid` row after it is the screen itself. It holds no responses.

Scale: 0 = not at all, 6 = exactly.

---

## 7. The image-pair trials (`block == 'pairs'`)

143 rows: 6 practice + 137 main.

| `pair_type` | n | analysed | what differs between the two images |
|---|---|---|---|
| `practice` | 6 | no | — |
| `sat_only` | 40 | **yes** | colour only; haze is identical |
| `fog_only` | 40 | **yes** | haze only; measured saturation is matched |
| `together` | 20 | **yes** | foggier *and* duller vs. clearer *and* more colourful |
| `conflict` | 20 | **yes** | foggier but *more* colourful vs. clearer but duller |
| `consistency` | 11 | no | an earlier pair repeated, sides swapped |
| `catch` | 6 | no | no images; an attention check |

### Identifying the trial

| column | meaning |
|---|---|
| `trial_index_list` | the trial's number in that set's `trial_list.json` (1–143) |
| `pair_type` | design label, above |
| `analysed` | `True` for the 120 trials in the model |
| `scene_id` | e.g. `bathroom_00002923`. Both images are always the same scene |
| `category` | scene category, e.g. `bathroom` |

### The stimuli

| column | meaning |
|---|---|
| `left_path`, `right_path` | image files as shown, e.g. `stimuli/bathroom_00002923_c080_h060.png` |
| `a_is_left` | **essential**: whether image A appeared on the left |

The filename gives the grid position: `c080` = chroma 0.80, `h060` = haze
0.60.

### The predictors

Copied from `trial_list.json` into every row, so the file needs no join.

| column | meaning |
|---|---|
| `d_sat` | saturation difference, image A − image B |
| `d_fog` | haze difference (`lum_p05`), A − B |
| `z_sat`, `z_fog` | the same differences, each divided by that scene's range — **the regression predictors** |
| `mag_bin` | size of the difference, 1 (small) to 3 (large), for dose–response plots |

### The response

| column | meaning |
|---|---|
| `response` | the key as jsPsych recorded it, **lowercased**: `arrowleft`, `arrowright` |
| `response_key` | the same value, stored separately |
| `response_side` | **`left` or `right`** — the dependent variable |
| `rt` | ms from image onset to keypress. No time limit |
| `no_response` | should always be `False`. If `True`, key handling failed and the row needs checking |

**`response_side` records the key, not the choice.** Converting it to
"chose image A" happens in analysis, where you can check it (§8).

### Display verification

| column | meaning |
|---|---|
| `display_px` | configured image size (512) |
| `panel_rendered_px` | measured on-screen size, e.g. `512x512`. Should match |

### Catch trials only

| column | meaning |
|---|---|
| `catch_key` | the target: `ArrowUp` or `ArrowDown` |
| `catch_pass` | whether their single keypress matched |
| `catch_pressed_side` | `True` if they pressed ← or → instead |
| `correct_response` | **legacy — ignore.** Holds `right` on every catch trial and is not used for scoring |

**How someone fails is informative.** Pressing ← or → means they answered
as if it were an image trial, without reading. Pressing some other key
suggests they weren't paying attention at all.

### Consistency trials only

| column | meaning |
|---|---|
| `repeat_of` | the earlier trial this repeats (stored as a float, e.g. `8.0`) |

The repeat shows the **same pair with the sides swapped**, at least 25
trials later. Choosing the same *image* therefore means pressing the
**opposite side**.

---

## 8. Getting to an analysable table

```python
import pandas as pd, numpy as np

d = pd.read_csv(path)

# Exclude test and dev sessions
s = d.iloc[0]
if s.is_test or s.get('is_dev', False):
    raise ValueError('test or dev session')

trials   = d[d.block == 'pairs'].copy()
analysed = trials[trials.analysed == True].copy()     # 120 rows

# Which IMAGE was chosen, not which side.
analysed['chose_A'] = np.where(
    analysed.a_is_left,
    analysed.response_side == 'left',
    analysed.response_side == 'right',
)
```

`chose_A` is the outcome. The model, fitted **per participant**:

```
P(chose_A) ~ b_sat * z_sat + b_fog * z_fog
```

The between-participant question is whether `rating_foggy` predicts
`b_fog` and `rating_lifeless` predicts `b_sat`. Both ratings are already
on every row:

```python
rating_foggy    = analysed.rating_foggy.iloc[0]
rating_lifeless = analysed.rating_lifeless.iloc[0]
```

### Attention and quality checks

```python
# Catch trials
catch = trials[trials.pair_type == 'catch']
n_failed    = (~catch.catch_pass.astype(bool)).sum()          # of 6
habituation = catch.catch_pressed_side.astype(bool).sum()

# Consistency: sides are swapped, so the same choice = the opposite side
cons  = trials[trials.pair_type == 'consistency']
agree = 0
for _, r in cons.iterrows():
    orig = trials[trials.trial_index_list == r.repeat_of].iloc[0]
    agree += (r.response_side != orig.response_side)
consistency_rate = agree / len(cons)                          # of 11

# Side bias (left/right is balanced 50/50 by design)
side_bias = (analysed.response_side == 'left').mean()         # ~0.50

# Word-rating range
word_range = d.loc[d.block == 'word_ratings', 'word_range'].iloc[0]
```

A participant pressing arrows at random has a 1/4 chance on each catch
trial, so passing 4 or more of 6 by luck happens about 4% of the time.
Someone pressing only ← or → fails every one.

---

## 9. Combining sessions

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

by_set = all_trials.groupby('stimulus_set')
```

Group by `participant_id`, and **split by `stimulus_set` before comparing
anything**. `trial_index_list` and `repeat_of` point to different trials in
each set, so pooling the sets without splitting silently matches trials to
the wrong originals.

---

## 10. Quick integrity check

For a complete, usable session:

| check | expected |
|---|---|
| `is_test`, `is_dev` | both `False` |
| rows where `block == 'pairs'` | 143 |
| rows where `analysed == True` | 120 |
| `pair_type` counts | 40 sat_only, 40 fog_only, 20 together, 20 conflict, 11 consistency, 6 catch, 6 practice |
| a `word_ratings` row | present, all ten `word_*` filled |
| `rating_foggy`, `rating_lifeless` | not empty |
| `gamma_estimate` | not empty |
| `response_side` missing | 0 |
| `no_response` true | 0 |
| `panel_rendered_px` | all `512x512` |
| `images_fit` | `True` |
| `failed_images` (on the `preload` row) | `[]` |
| `stimulus_set` | `lum_p05` or `contrast_local` |

---

## 11. Columns you can ignore

These are written by jsPsych or its plugins rather than by the experiment:

`trial_index` (row counter), `internal_node_id` (timeline address),
`time_elapsed` (ms since the session started), `stimulus` (the screen's raw
HTML), `value`, `success` and `timeout` (download step), `failed_audio`,
`failed_video`.

`failed_images` is the exception. Glance at it on the `preload` row:
anything other than `[]` means some images did not load for that
participant.

---

## 12. The separate contact file

If a participant gives a name or email on the optional contact screen,
those values are uploaded **straight away**, as a separate one-row CSV, to
a separate DataPipe experiment (`T2jZJusQxUGv`) and OSF component
(`qt9x8`). They are removed from the response data before anything else
happens, so the response files on `qsv56` stay pseudonymised.

```
contact_<participant_id>_<timestamp>.csv
```

| column | meaning |
|---|---|
| `participant_id` | the link to the response file and to the CDS-29 record |
| `name`, `email` | as typed. Either may be empty |
| `is_test`, `is_dev` | same meaning as in the response data |
| `stimulus_set`, `language` | for convenience |
| `saved_at` | UTC time of upload |

It is uploaded at the contact screen rather than at the end, so contact
details survive even if the participant abandons the session.

No file is written if both fields were left blank, or in local/dev mode.
Restrict access to component `qt9x8`, and delete it when your ethics
approval requires, independently of the response data.
