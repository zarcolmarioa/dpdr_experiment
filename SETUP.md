# Setup and deployment

Everything here assumes Ubuntu and a terminal. Commands are given in full.

---

## 0. Prerequisites

Check `git` is installed:

```bash
git --version
```

If not:

```bash
sudo apt update && sudo apt install git
```

Check you can reach GitHub over SSH:

```bash
ssh -T git@github.com
```

A message beginning `Hi <username>! You've successfully authenticated` means
you are set. If you get `Permission denied (publickey)`, create a key and add
it to GitHub:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
```

Copy the printed line into GitHub → Settings → SSH and GPG keys → New SSH key.

---

## 1. Get the repository

The repository already exists on GitHub and already contains the frozen v4
stimuli (~150 MB, see §5), so the first clone takes a little while:

```bash
git clone git@github.com:<username>/<repo-name>.git
cd <repo-name>
```

Work on a branch and merge to `main` only after testing: GitHub Pages
serves `main` (§2), so whatever is on `main` is what participants get.

---

## 2. Enable GitHub Pages

On GitHub: **Settings → Pages → Source → Deploy from a branch**, branch
`main`, folder `/ (root)`, then **Save**.

After a minute or two the site is live at:

```
https://<username>.github.io/<repo-name>/
```

Check it is serving:

```bash
curl -I https://<username>.github.io/<repo-name>/
```

`HTTP/2 200` means it is up. `404` means Pages has not finished deploying, or
the branch or folder is wrong.

---

## 3. DataPipe

The values are already in `config.js`:

```js
datapipe: {
  experiment_id: 'yZIXKcYy54Uw',
  osf_project:   'tx5h2',
  osf_component: 'qsv56',
}
```

**Before every test round, on the DataPipe dashboard:**

1. Set **Enable data collection** to ON. This is the single most common
   reason an upload fails silently. The experiment reports the failure on
   the completion screen, but only when `CONFIG.debug` is `true`.
2. Leave **Enable base64 data collection** OFF (that is for binary uploads).
3. Leave **Enable condition assignment** OFF (we do our own assignment).
4. Leave **Enable session limit** OFF until recruitment starts. Then set it
   to your target as a guard against runaway sessions.
5. Under **Validation**, keep **Allow CSV** checked. The required field
   `trial_type` is supplied automatically by jsPsych on every row, so it is
   satisfied without any work on our side.

### A name collision worth knowing about

jsPsych writes its own `trial_type` column containing the *plugin* name.
`trial_list.json` also has a `trial_type` column, containing the *design*
label (`sat_only`, `conflict`, `catch`). Two different things, same name.

The experiment renames the design label to **`pair_type`** on output.
`trial_list.json` is never modified. When analysing, use `pair_type`, and
ignore `trial_type` — it only tells you which plugin drew the screen.

---

## 4. Run a test session

Open, replacing the values with your own:

```
https://<username>.github.io/<repo-name>/?pid=Z_21121989&group=participant
```

`Z_21121989` is the superuser ID. Every row it produces carries
`is_test = true`, so test sessions can always be filtered out. The `group`
parameter is **required**: without it the study shows "This link is
incomplete" and does not start. Repeat with `group=control`.

The session runs in this order (both groups):

1. consent → 2. full screen and window check → 3. ID screen →
4. brightness → 5. gamma matching → 6. anchoring → 7. practice →
8. 205 pair trials → 9. episode grid block → 10. word ratings →
11. normal-appearance grid block → 12. state items → 13. save →
14. completion screen.

With `CONFIG.debug` on, the completion screen states whether the upload
succeeded and shows the raw DataPipe response.

Then confirm the file arrived in OSF component `qsv56`. The DataPipe
dashboard session counter should also increment.

For quick checks of one block, use `dev.html` instead (choose a group
first): every preset except "Upload test" saves locally.

### If the upload fails

| Symptom | Cause |
|---|---|
| Completion screen says FAILURE | "Enable data collection" is off |
| No upload attempted | `CONFIG.platform` is not `'github'` |
| Console: `jsPsychPipe is not defined` | unpkg blocked or offline |
| File arrives but is empty | check the console for an error thrown before the save node |

### Testing without uploading

Set `platform: 'local'` in `config.js` and serve the folder over HTTP
(`python3 -m http.server 8000`, then open
`http://localhost:8000/?pid=Z_21121989&group=participant`). The CSV
downloads to your Downloads folder and nothing is sent anywhere — except
the separate contact file, if you type a name or email (see
`DATA_DICTIONARY.md` §15). Useful for checking the output columns without
adding junk to OSF. Or use `dev.html` → "Full session (local)".

---

## 5. The stimulus packages (frozen)

The v4 stimuli are already committed:

```
data/sets/v4/        pair package: trial_list.json, preload.json, stimuli/ (349 images)
data/sets/v4/grid/   grid package: grid_trials.json, preload.json, stimuli/ (144 images)
```

They are exact copies of the frozen originals archived in
`drl2drv_updated/data_trials/` (`frozen_trial_list_v4/package/` and
`grid_block_v4/package/`). **Never edit, re-encode, resize or rename
anything in these folders.** The experiment reads them as they are; the
validator refuses to start if their counts or structure differ from the
registered design.

To re-verify them (for example before launch, on the deployed commit), with
both repositories checked out side by side:

```bash
ARCHIVE=../drl2drv_updated/data_trials

# Pair package: all 354 checksums must pass.
grep '  package/' $ARCHIVE/frozen_trial_list_v4/checksums.sha256 \
  | sed 's#  package/#  #' > /tmp/pair.sha256
(cd data/sets/v4 && sha256sum -c --quiet /tmp/pair.sha256) && echo "pair package OK"

# Grid package: byte-identical, ignoring the archive's previews/.
diff -r --exclude=previews $ARCHIVE/grid_block_v4/package data/sets/v4/grid \
  && echo "grid package OK"
```

The older sets (`data/sets/lum_p05/`, `data/sets/contrast_local/`) are kept
on disk for reference but are not in `CONFIG.data.available_sets` and
cannot be selected.

**One caution.** Git keeps every version of every file permanently, and PNGs
do not delta-compress. That is one more reason never to touch the package
files: any change adds its full size to history permanently.

Do **not** use Git LFS. GitHub Pages does not serve LFS files — it serves the
pointer instead, so every image would fail to load while the site itself
deploys normally. That is a difficult failure to diagnose.

---

## 6. Participant links

Each participant gets their own link, carrying their ID, their group and,
for participants, the date of their interview:

```
https://<username>.github.io/<repo-name>/?pid=R_9rJJWk01c767jE8&group=participant&idate=2026-11-03
https://<username>.github.io/<repo-name>/?pid=R_4EWNe48BIB50mVI&group=control
```

| parameter | required | value |
|---|---|---|
| `pid` | yes (typed entry is the fallback if `allow_manual_id` is on) | the participant ID, case-sensitive |
| `group` | **yes** | `participant` or `control`, exactly. Without it the study does not start |
| `idate` | no | the interview date, `YYYY-MM-DD`. Added by the researcher who schedules the interviews; never asked on screen. An invalid date is recorded empty |
| `lang` | no | `ja` for Japanese; English otherwise |

Join parameters with `&`. The query string never reaches the server. It
sits in the address bar and is read by JavaScript, which is why this works
on static hosting with no backend. `README.md` has a short Python function
that builds the links from a table.

Put the ID in the email body as well as the link:

> Here is your link: https://.../?pid=R_9rJJWk01c767jE8&group=participant&idate=2026-11-03
>
> If the link does not work, please reply to this email.

Note that the fallback "go to https://.../ and enter this ID" no longer
works on its own: a link without `group` does not start. If you want a
typed-ID fallback, give a link that carries the group but not the ID
(`https://.../?group=participant`), and the ID in the email.

The IDs are **case-sensitive**. `R_4EWNe48BIB50mVI` and `R_4ewne48bib50mvi`
are different identifiers, and the experiment will reject the wrong case.
Before sending, open one participant link and one control link yourself and
check the anchoring screen shows the right wording.

---

## 7. Switching to Pavlovia

Change one line in `config.js`:

```js
platform: 'pavlovia',
```

Then push to the Pavlovia GitLab remote:

```bash
git remote add pavlovia https://gitlab.pavlovia.org/<username>/<repo-name>.git
git push pavlovia main
```

On the Pavlovia dashboard, set the experiment to **Piloting** to test, then
**Running** to collect data. Data is saved by Pavlovia, not DataPipe.

Both sets of scripts are present in `index.html` at all times. Whichever set
is not relevant to the current host simply 404s and is unused, so no manual
commenting out is needed.

---

## 8. Checklist before recruiting

The launch checklist is in `README.md` ("Launch checklist — do not recruit
unless every item passes"). It is a list of hard gates: do not send a single
invitation while any item fails. In addition, for deployment:

- [ ] A test session per group with `Z_21121989` appears in OSF component `qsv56`
- [ ] All images load (no grey boxes, no console 404s; `failed_images` is
      `[]` on the `preload` and both `grid_preload_*` rows)
- [ ] Participant links generated with the correct IDs, groups and
      interview dates
- [ ] A full session run start to finish on a small laptop screen (and the
      window check tried on a window that is too small: it must stop)
