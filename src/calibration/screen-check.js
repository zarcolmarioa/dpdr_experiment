/* =========================================================================
 * screen-check.js — full screen, window check, and stimulus size check.
 *
 * Runs right after the consent screen and BEFORE the participant ID
 * screen, so a participant who is stopped here has had nothing uploaded —
 * not even an optional name or email.
 *
 * Three nodes, in order:
 *
 *   1. Full screen. Required: it fixes the viewport for the whole session
 *      so the stimuli never change size mid-experiment, and it removes
 *      browser chrome that would otherwise eat the vertical space two
 *      512 px panels need.
 *
 *   2. Window check — a HARD STOP. The real trial layout is drawn
 *      invisibly for a moment: the question in the participant's language
 *      and group (both from the link), above two panels at exactly
 *      display.image_px. Every part of it is measured against the window.
 *      The practice-feedback line, which replaces the question on the
 *      first practice trial, is measured too. If anything would be cut
 *      off, by width or by height, the session stops with a message asking
 *      the participant to enlarge the window (or reset the browser zoom),
 *      or to use a larger screen, and to reopen the link. There is no
 *      "continue anyway". Nothing is saved for a stopped session.
 *
 *      When the layout fits, the session continues with no message. The
 *      full-screen viewport, viewport_ok (the RECOMMENDED minimum,
 *      display.min_width x min_height) and images_fit are stamped on every
 *      row.
 *
 *      The grid blocks need less room than this (six columns at the 100 px
 *      floor fit in 842 x 502), so a window that passes here fits them too.
 *
 *   3. Size check. Developer screen (CONFIG.blocks.size_check, off for
 *      participants): renders two panels at the configured size and
 *      reports the measured on-screen dimensions.
 *
 * FIREFOX NOTE
 * ------------
 * Entering fullscreen in Firefox can leave keyboard focus on the element
 * that was clicked rather than on the document, so the first keypress of
 * the next trial is swallowed. _restoreFocus() puts focus back on the
 * jsPsych display element after the transition.
 * ========================================================================= */

var ScreenCheck = (function () {

  var _measured = { width: null, height: null };
  var _fits     = null;    // result of the window check

  // -----------------------------------------------------------------------
  // Put keyboard focus back on the document after a fullscreen transition.
  // -----------------------------------------------------------------------
  function _restoreFocus() {
    setTimeout(function () {
      var el = document.querySelector('.jspsych-display-element') || document.body;
      if (el) {
        el.setAttribute('tabindex', '-1');
        el.focus();
      }
      if (document.activeElement && document.activeElement.blur &&
          document.activeElement.tagName === 'BUTTON') {
        document.activeElement.blur();
      }
    }, 100);
  }

  function _viewportOK() {
    return window.innerWidth  >= CONFIG.display.min_width &&
           window.innerHeight >= CONFIG.display.min_height;
  }

  // Is this element entirely inside the window? Half a pixel of slack for
  // sub-pixel rounding.
  function _inside(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    var eps = 0.5;
    return r.left >= -eps && r.top >= -eps &&
           r.right  <= window.innerWidth  + eps &&
           r.bottom <= window.innerHeight + eps;
  }

  // Everything that must be visible: the question line and both panels.
  function _layoutFits(probe) {
    var parts = probe.querySelectorAll('.stim-prompt, .stim-panel');
    if (parts.length < 3) return false;
    for (var i = 0; i < parts.length; i++) {
      if (!_inside(parts[i])) return false;
    }
    return true;
  }

  // -----------------------------------------------------------------------
  // Panel markup used by the size check. Matches the real stimulus layout,
  // so what is measured here is what the images will get.
  // -----------------------------------------------------------------------
  function _panel(label) {
    return (
      '<div class="stim-panel size-check-panel" style="' +
      'width:'  + CONFIG.display.image_px + 'px;' +
      'height:' + CONFIG.display.image_px + 'px;">' +
      '<span class="mock-label">' + label + '</span></div>'
    );
  }

  function _card(title, body) {
    return '<div class="card"><h2>' + title + '</h2>' + body + '</div>';
  }

  function buildNodes(jsPsych) {
    var nodes = [];

    // --- 1. Fullscreen --------------------------------------------------
    if (CONFIG.calibration.fullscreen) {
      nodes.push({
        type: jsPsychFullscreen,
        fullscreen_mode: true,
        message:
          '<div class="card"><h2>' + Loader.text().screen.fs_title + '</h2>' +
          Loader.text().screen.fs_body + '</div>',
        button_label: Loader.text().screen.fs_button,
        data: { block: 'fullscreen' },
        on_finish: function () { _restoreFocus(); },
      });
    }

    // --- 2. Window check ------------------------------------------------
    if (CONFIG.calibration.screen_check) {

      // The real trial layout, invisible, measured as soon as it is drawn.
      nodes.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function () {
          var T = Loader.text();
          return '<div class="fit-probe" aria-hidden="true">' +
                 PairsPhase.trialHTML(Loader.byGroup(T.prompt.main), null, null) +
                 '</div>';
        },
        choices: 'NO_KEYS',
        trial_duration: 60,
        data: { block: 'window_check' },
        on_load: function () {
          var probe  = document.querySelector('.fit-probe');
          var prompt = probe ? probe.querySelector('.stim-prompt') : null;
          var fits   = !!probe && _layoutFits(probe);

          // The first practice trial shows a feedback line in place of the
          // question; it must fit too.
          if (fits && prompt) {
            prompt.innerHTML = Loader.text().practice.feedback_first;
            fits = _layoutFits(probe);
          }
          _fits = fits;

          jsPsych.data.addProperties({
            viewport_width_fs:  window.innerWidth,
            viewport_height_fs: window.innerHeight,
            viewport_ok:        _viewportOK(),
            allow_scaling:      CONFIG.display.allow_scaling,
            // Both panels and the question shown whole, without scrolling.
            images_fit:         fits,
          });
          if (CONFIG.debug) {
            console.log('[Screen] window ' + window.innerWidth + 'x' +
                        window.innerHeight + ' — trial layout ' +
                        (fits ? 'fits' : 'DOES NOT FIT: session stops'));
          }
        },
      });

      // The stop. Waits for the page to be closed: no key or button moves
      // on, so the session never reaches the ID screen or the save step.
      nodes.push({
        timeline: [{
          type: jsPsychHtmlKeyboardResponse,
          stimulus: function () {
            var S = Loader.text().screen;
            return _card(S.small_title,
              S.small_body +
              '<p class="hint">' +
              S.small_size.replace('{W}', window.innerWidth)
                          .replace('{H}', window.innerHeight)
                          .replace('{MW}', CONFIG.display.min_width)
                          .replace('{MH}', CONFIG.display.min_height) +
              '</p>');
          },
          choices: 'NO_KEYS',
          data: { block: 'screen_stop' },
          on_load: function () {
            // Leave full screen so the participant can resize or close.
            if (document.fullscreenElement && document.exitFullscreen) {
              document.exitFullscreen().catch(function () {});
            }
          },
        }],
        conditional_function: function () { return _fits === false; },
      });
    }

    // --- 3. Stimulus size check -----------------------------------------
    // Confirms the panels render at the configured size. Its own block flag
    // so it can be run on its own from dev.html, or switched off for a real
    // session without turning off debug everywhere else.
    if (CONFIG.blocks.size_check) {
      nodes.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus:
          '<div class="stim-prompt">Stimulus size check &mdash; ' +
          'this screen is not part of the study</div>' +
          '<div class="stim-row" style="gap:' + CONFIG.display.gap_px + 'px;">' +
          _panel('LEFT') + _panel('RIGHT') + '</div>' +
          '<div class="stim-prompt" id="size-readout">measuring&hellip;</div>',
        choices: [' '],
        data: { block: 'size_check' },
        on_load: function () {
          var el = document.querySelector('.size-check-panel');
          var readout = document.getElementById('size-readout');
          if (!el || !readout) return;
          var r = el.getBoundingClientRect();
          _measured.width  = Math.round(r.width);
          _measured.height = Math.round(r.height);

          var target = CONFIG.display.image_px;
          var exact  = (_measured.width === target && _measured.height === target);

          readout.innerHTML =
            'Each panel is rendering at <b>' + _measured.width + ' &times; ' +
            _measured.height + '</b> CSS pixels (target ' + target + ').<br>' +
            (exact
              ? '<span style="color:#b8f0c0">Exact &mdash; fixed size, ' +
                'no scaling.</span>'
              : (CONFIG.display.allow_scaling
                  ? '<span style="color:#ffd48a">Scaled to fit. Both panels ' +
                    'scale identically, so the difference between them is ' +
                    'preserved, but display size varies between ' +
                    'participants.</span>'
                  : '<span style="color:#ffb3ac">Does not match the target. ' +
                    'With allow_scaling off this means the panels are being ' +
                    'cut off by the viewport.</span>')) +
            '<br>Window check: ' + (_fits === null ? 'not run' :
                                    (_fits ? 'layout fits' : 'layout cut off')) +
            '<br>Device pixel ratio: ' + window.devicePixelRatio +
            ' &nbsp;|&nbsp; viewport: ' + window.innerWidth + ' &times; ' +
            window.innerHeight +
            '<br><br>Press <b>SPACE</b> to continue.';
        },
        on_finish: function (data) {
          data.panel_rendered_w = _measured.width;
          data.panel_rendered_h = _measured.height;
        },
      });
    }

    return nodes;
  }

  function measured() { return _measured; }
  function fits()     { return _fits; }

  return {
    buildNodes:   buildNodes,
    measured:     measured,
    fits:         fits,
    restoreFocus: _restoreFocus,
  };
})();
