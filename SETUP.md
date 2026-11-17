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
  experiment_id: 'VoYGtg5yKGr2',
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
| No upload attempted | the page is not on `*.github.io` (`platform: 'auto'`), or `platform` is set to `'local'` |
| Console: `jsPsychPipe is not defined` | unpkg blocked or offline |
| File arrives but is empty | check the console for an error thrown before the save node |

### Testing without uploading

Serve the folder over HTTP on your computer (`python3 -m http.server 8000`,
then open `http://localhost:8000/?pid=Z_21121989&group=participant`). With
`platform: 'auto'` this is `local`: the CSV downloads to your Downloads
folder and nothing is sent anywhere — except the separate contact file, if
you type a name or email (see `DATA_DICTIONARY.md` §15). Useful for checking
the output columns without adding junk to OSF. Or use `dev.html` → "Full
session (local)".

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
| `pid` | recommended. Without it (and with `allow_manual_id` on) the participant must type a valid ID **or** give a name and email address | the participant ID, case-sensitive |
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

A link without `group` does not start, so any fallback link must carry the
group. A link with the group but no ID (`https://.../?group=participant`)
does start: the participant then types their ID, or — if they do not have
it — gives their name and email address instead (a unique `NOID_DRCHAIN26_…`
ID is generated, and the contact file is what links the session to them).
Giving all three is best, and the screen says so.

The IDs are **case-sensitive**. `R_4EWNe48BIB50mVI` and `R_4ewne48bib50mvi`
are different identifiers, and the experiment will reject the wrong case.
Before sending, open one participant link and one control link yourself and
check the anchoring screen shows the right wording.

---

## 7. Pavlovia

The same files run on GitHub Pages and on Pavlovia. With `platform: 'auto'`
(the default in `config.js`) the experiment sees where it is served from
and saves accordingly:

| Served from | `platform` | Responses saved to | Name and email (if given) |
|---|---|---|---|
| `*.github.io` | `github` | DataPipe → OSF `qsv56` | separate file, DataPipe → OSF `qt9x8`, straight away |
| `run.pavlovia.org` | `pavlovia` | the Pavlovia project's `data/` folder | in the response file (`contact_name`, `contact_email`), at the end |
| your computer | `local` | downloaded CSV | separate DataPipe file, as on GitHub |

The name/email rule is `participant.contact_storage: 'auto'`. On Pavlovia
the consent and ID screens use their `*_results_file` wording, which says
the name and email are stored with the responses (see
`text/*/instructions.js`; replace `consent.body_results_file` with the
approved wording too). Nothing is sent to DataPipe from Pavlovia.

Libraries: `libraries: 'bundled'` (default) loads our copy of jsPsych
7.1.2, its plugins and jQuery 2.2.0 from `vendor/` — byte-identical to the
official releases. `libraries: 'pavlovia'` loads the copy Pavlovia serves
itself under `lib/vendors/` instead, as in the earlier Pavlovia experiment;
it exists only on Pavlovia (anywhere else `vendor/` is used). The Pavlovia
plugin `jspsych-7-pavlovia-2021.12.js` is always our copy, in the top
folder. Every row records `platform`, `libraries` and `contact_storage`.

### Two folders, never mixed

Pavlovia stores each result file **as a commit in the project's GitLab
repository** (`data/` folder). The GitHub repository is public. So:

- **Folder A** — this GitHub repository. You edit and commit here.
- **Folder B** — a separate clone of the Pavlovia project. You never edit
  it by hand, never add GitHub as a remote, and never copy anything from
  it back into A. Results stay in B (and on Pavlovia).

`tools/sync_to_pavlovia.sh` copies a committed version of A into B.

### First time

1. On pavlovia.org: **Dashboard → Experiments → New** (or create the
   project on gitlab.pavlovia.org). Set its visibility to **Private**.
   Its default branch is `master`.
2. Clone it next to (not inside) folder A. Pavlovia's GitLab asks for your
   Pavlovia user name and password (or an access token):

   ```bash
   mkdir -p ~/pavlovia && cd ~/pavlovia
   git clone https://gitlab.pavlovia.org/<user>/<project>.git
   ```

3. From folder A, copy the committed experiment across, then commit and
   push in folder B (the script prints the two commands):

   ```bash
   cd ~/<path-to>/dpdr_experiment            # folder A
   tools/sync_to_pavlovia.sh ~/pavlovia/<project>
   cd ~/pavlovia/<project>
   git commit -m "Deploy <commit>"
   git push
   ```

   The first push is ~150 MB (the v4 images). If it fails part-way, run
   `git config http.postBuffer 524288000` in folder B and push again.
   The old stimulus sets `lum_p05` and `contrast_local` are not copied.

4. On the Pavlovia experiment page: keep the saving format **CSV** (if
   the page offers a choice), leave **Save incomplete results OFF** (an
   abandoned session must leave nothing behind — the consent text says
   so), and assign credits or a licence. Pavlovia opens `index.html`.

### Piloting, then Running

- **Piloting**: open the experiment with the **Pilot** button. Each pilot
  run counts as a session, but the CSV is **downloaded to your computer**,
  not stored on Pavlovia. With `debug: true` the last screen says
  "PILOTING — file downloaded to this computer".
- **Running**: results go to the project's `data/` folder, one file per
  session, named

  ```
  <project>_<participant_id>_v4_<Japan-time stamp>_SESSION_<date>.csv
  ```

  The middle part is the same as the GitHub file name
  (`<participant_id>_v4_<Japan-time stamp>`). Download them from the
  experiment page (**Download results**) or with `git pull` in folder B.

The Pavlovia session is opened only after the consent screen and the window
check, so a participant who declines or whose window is too small never
opens one (and never sees the browser's "leave this page?" warning).

### Links

```
https://run.pavlovia.org/<user>/<project>/?pid=R_xxxxxxxxxxxxxxx&group=participant&idate=2026-11-03
https://run.pavlovia.org/<user>/<project>/?pid=R_xxxxxxxxxxxxxxx&group=control
```

The same parameters as on GitHub (§6). `dev.html` works there too:
`https://run.pavlovia.org/<user>/<project>/dev.html?group=participant`; its
"Upload test" saves to Pavlovia.

### Updating

Commit in folder A, then run `tools/sync_to_pavlovia.sh` and push from B
again. The script pulls B first (Pavlovia's result commits), never touches
`data/*.csv`, `config.json` or `lib/`, and writes `DEPLOYED_COMMIT.txt`
— the commit that is live — for the launch checklist. To deploy another
branch: `tools/sync_to_pavlovia.sh ~/pavlovia/<project> v4-study-design`.

### If saving fails on Pavlovia

| Symptom (debug box on the last screen) | Cause |
|---|---|
| Pavlovia session: NOT opened | experiment not activated (no `config.json`), set to Inactive, or no credits/licence |
| Saving to Pavlovia FAILED | as above, or the network dropped at the end; the participant gets the download-and-email screen |
| PILOTING — file downloaded | you used the Pilot button, or the experiment is not Running |
| Page blank, console `initJsPsych is not defined` | `libraries: 'pavlovia'` but Pavlovia did not serve `lib/vendors/`; use `'bundled'` |

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
