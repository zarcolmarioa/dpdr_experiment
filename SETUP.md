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

## 1. First commit, without the stimuli

The images are ~63 MB and take a while to push. Commit the code first and
confirm the upload path works before adding them — if something is wrong with
the DataPipe configuration, you want to find out now rather than after a slow
push.

```bash
cd ~/path/to/derealization_experiment

git init
git branch -M main
git add .
git commit -m "Experiment scaffold: config, save path, smoke test"
```

Create an empty repository on GitHub (no README, no .gitignore — the repo
already has both), then:

```bash
git remote add origin git@github.com:<username>/<repo-name>.git
git push -u origin main
```

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

## 4. Run the smoke test

Open, replacing the values with your own:

```
https://<username>.github.io/<repo-name>/?pid=Z_21121989
```

`Z_21121989` is the superuser ID. Every row it produces carries
`is_test = true`, so test sessions can always be filtered out.

The session is six placeholder trials answered with the arrow keys, then a
completion screen. With `CONFIG.debug` on, that screen states whether the
upload succeeded and shows the raw DataPipe response.

Then confirm the file arrived in OSF component `qsv56`. The DataPipe
dashboard session counter should also increment.

### If the upload fails

| Symptom | Cause |
|---|---|
| Completion screen says FAILURE | "Enable data collection" is off |
| No upload attempted | `CONFIG.platform` is not `'github'` |
| Console: `jsPsychPipe is not defined` | unpkg blocked or offline |
| File arrives but is empty | check the console for an error thrown before the save node |

### Testing without uploading

Set `platform: 'local'` in `config.js` and open `index.html` directly. The
CSV downloads to your Downloads folder and nothing is sent anywhere. Useful
for checking the output columns without adding junk to OSF.

---

## 5. Commit the stimuli

Once the upload path is confirmed, add the images as their own commit:

```bash
cp -r /path/to/package/stimuli data/stimuli
git add data/stimuli
git commit -m "Add 227 stimulus images"
git push
```

The first push takes a few minutes. Subsequent pushes are fast because
unchanged files are stored by reference.

**One caution.** Git keeps every version of every file permanently, and PNGs
do not delta-compress — each version is stored in full. Committing a
regenerated stimulus set adds another ~63 MB to history that cannot be
removed without rewriting it. One or two rounds is fine; if you expect many,
switch the package to JPEG q95 (~18 MB) instead.

Do **not** use Git LFS. GitHub Pages does not serve LFS files — it serves the
pointer instead, so every image would fail to load while the site itself
deploys normally. That is a difficult failure to diagnose.

---

## 6. Participant links

Each participant gets their own link:

```
https://<username>.github.io/<repo-name>/?pid=R_9rJJWk01c767jE8
```

The `?pid=` part never reaches the server. It sits in the address bar and is
read by JavaScript, which is why this works on static hosting with no backend.

Put the ID in the email body as well as the link:

> Here is your link: https://.../?pid=R_9rJJWk01c767jE8
>
> If the link does not work, go to https://.../ and enter this ID when
> asked: **R_9rJJWk01c767jE8**

The IDs are **case-sensitive**. `R_4EWNe48BIB50mVI` and `R_4ewne48bib50mvi`
are different identifiers, and the experiment will reject the wrong case.

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

- [ ] Data collection enabled on DataPipe
- [ ] A test session with `Z_21121989` appears in OSF component `qsv56`
- [ ] `CONFIG.debug` set to `false`
- [ ] `CONFIG.platform` matches where the experiment is hosted
- [ ] All 227 images load (no grey boxes, no console 404s)
- [ ] Participant links generated with the correct IDs
- [ ] A full session run start to finish on a small laptop screen
