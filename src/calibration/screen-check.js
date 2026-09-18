/* =========================================================================
 * screen-check.js — fullscreen, viewport gate, and stimulus size check.
 *
 * Three nodes, in order:
 *
 *   1. Fullscreen. Required: it fixes the viewport for the whole session so
 *      the stimuli never change size mid-experiment, and it removes browser
 *      chrome that would otherwise eat the vertical space two 512 px panels
 *      need.
 *
 *   2. Viewport gate. A SOFT gate: below the minimum, the participant is
 *      told the study wants a larger screen but may continue anyway. The
 *      viewport is recorded either way, so sessions run on small screens can
 *      be identified, excluded, or used with display size as a covariate.
 *      Below display.hard_min_width the layout genuinely breaks and no
 *      override is offered.
 *
 *   3. Size check. Renders two panels at the configured size and reports
 *      the measured on-screen dimensions. This is how you confirm the
 *      stimuli are displaying at 512 x 512 rather than being scaled.
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

  function _viewportHopeless() {
    return window.innerWidth < CONFIG.display.hard_min_width;
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

  function buildNodes(jsPsych) {
    var nodes = [];

    // --- 1. Fullscreen --------------------------------------------------
    if (CONFIG.calibration.fullscreen) {
      nodes.push({
        type: jsPsychFullscreen,
        fullscreen_mode: true,
        message:
          '<div class="card">' +
          '<h2>Full screen required</h2>' +
          '<p>This study must run in full screen, so that the images are ' +
          'shown at the same size throughout.</p>' +
          '<p>Please do not leave full screen until the study ends.</p>' +
          '</div>',
        button_label: 'Enter full screen',
        data: { block: 'fullscreen' },
        on_finish: function () { _restoreFocus(); },
      });
    }

    // --- 2. Viewport gate -----------------------------------------------
    if (CONFIG.calibration.screen_check) {

      // Record the post-fullscreen viewport on every session.
      nodes.push({
        type: jsPsychCallFunction,
        func: function () {
          jsPsych.data.addProperties({
            viewport_width_fs:  window.innerWidth,
            viewport_height_fs: window.innerHeight,
            viewport_ok:        _viewportOK(),
            allow_scaling:      CONFIG.display.allow_scaling,
            // Whether two panels plus the gap fit without being cut off.
            images_fit:         (window.innerWidth >=
                                 CONFIG.display.image_px * 2 +
                                 CONFIG.display.gap_px),
          });
        },
      });

      // Warning + override, shown only when the viewport is too small.
      nodes.push({
        timeline: [{
          type: jsPsychHtmlKeyboardResponse,
          stimulus: function () {
            var hopeless = _viewportHopeless();
            var scaling = CONFIG.display.allow_scaling;
            var html =
              '<div class="card">' +
              '<h2>Your screen is smaller than this study needs</h2>' +
              '<p>This study shows two images side by side at a fixed size, ' +
              'so that every participant sees them identically.</p>' +
              (scaling
                ? '<p>On this screen they will be shown smaller than ' +
                  'intended.</p>'
                : '<p><b>On this screen, part of each image would be cut ' +
                  'off.</b></p>') +
              '<p class="hint">Your display area is ' +
              window.innerWidth + ' &times; ' + window.innerHeight +
              ' pixels. We recommend at least ' +
              CONFIG.display.min_width + ' &times; ' +
              CONFIG.display.min_height + '.</p>';

            if (hopeless) {
              html += '<p>This screen is too small to run the study. Please ' +
                      'use a larger computer or an external monitor.</p>' +
                      '</div>';
            } else {
              html += '<p>If you can use a larger screen, please close this ' +
                      'page and start again there.</p>' +
                      '<p>To continue on this screen anyway, press ' +
                      '<b>SPACE</b>.</p></div>';
            }
            return html;
          },
          choices: function () {
            return _viewportHopeless() ? 'NO_KEYS' : [' '];
          },
          data: { block: 'screen_warning' },
          on_finish: function (data) {
            data.continued_on_small_screen = !_viewportHopeless();
          },
        }],
        conditional_function: function () { return !_viewportOK(); },
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

  return {
    buildNodes:   buildNodes,
    measured:     measured,
    restoreFocus: _restoreFocus,
  };
})();
