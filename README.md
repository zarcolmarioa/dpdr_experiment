# Derealization grid experiment

A two-alternative forced-choice study asking which of two images looks more
like how the world appeared during derealization. Both images in a trial are
the same photograph at two points on a 5 × 5 grid of chroma × haze, so
content is held constant and only the two manipulated dimensions differ.

The analysis fits, per participant,

```
P(choose A) ~ b_sat · d_sat + b_fog · d_fog
```

and asks whether each person's word ratings predict which weight is larger.

See `SETUP.md` for deployment.

---

## Current state: smoke test

This repository currently contains **only the plumbing**: participant
identification, the output schema, and the save path. The trials are six
coloured placeholders, not the real stimuli.

The purpose is to confirm, before anything else is built, that data written
in the final format reaches OSF. Once that is verified, the real phases are
added and `src/phases/mock.js` is deleted.

---

## Layout

```
index.html              production entry; every script loaded exactly once
config.js               ALL settings — the only file you normally edit
jspsych-7-pavlovia-2021.12.js
css/experiment.css      layout; mid-grey background (see note below)
lib/vendors/            jsPsych 7.1.2 + jQuery 2.2.0, pinned
data/
  trial_list.json       143 trials (not yet used by the smoke test)
  preload.json          227 image paths (not yet used by the smoke test)
src/
  main.js               timeline assembly + platform-dependent saving
  record.js             output row construction
  participant-id.js     ?pid= with typed fallback
  phases/mock.js        placeholder trials — DELETE once pairs.js exists
```

Still to be written: `validate.js`, `loader.js`, `dev.html` with a block
jumper, the calibration modules, the text files for English and Japanese,
and the real phases (consent, word ratings, preload, pairs, grid, final).

---

## Three things worth knowing

**`pair_type`, not `trial_type`.** jsPsych writes its own `trial_type` column
holding the plugin name. The design label from `trial_list.json` is renamed
to `pair_type` on output so the two do not collide. Analyse on `pair_type`.

**Only the side is recorded.** Each row stores `response_side` as `left` or
`right`. Mapping that to "chose A" via `a_is_left` happens in the analysis
script, not in the browser, so the conversion can be inspected.

**The background is mid-grey.** The manipulations are saturation and shadow
lifting. A white surround would shift the participant's adaptation state
toward the bright end and compress exactly the differences under study.

---

## Participant IDs

Format `R_` followed by 15 alphanumeric characters, **case-sensitive**.
Normally arrives as `?pid=...` in the URL, with typed entry as a fallback.

`Z_21121989` is a superuser ID for testing. Sessions using it are flagged
`is_test = true` on every row.

---

## Settings you are most likely to change

In `config.js`:

| Setting | Purpose |
|---|---|
| `platform` | `'local'` / `'github'` / `'pavlovia'` |
| `debug` | shows the upload result on the completion screen |
| `display.image_px` | on-screen size; 512 is 1:1 with the source images |
| `keys` | response keys, arrows by default |
| `participant.allow_manual_id` | set false to require the URL parameter |
