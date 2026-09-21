// =============================================================================
// src/calibration/gamma.js
//
// PORTED from the noise-estimation experiment, where it was tested on
// Pavlovia. The drawing, interaction and gamma computation are unchanged.
// What changed on the port:
//   - INSTRUCTIONS.* replaced by Loader.text().calibration.*, so the strings
//     live in text/en and text/ja like everything else participants see
//   - guarded by CONFIG.calibration.gamma
//
// WHY IT MATTERS FOR THIS EXPERIMENT
// ----------------------------------
// Gamma determines how pixel values map to emitted light. A display at
// gamma 2.8 renders mid-tones far darker than one at 1.8, which compresses
// or expands the perceived spacing between adjacent haze levels, and shifts
// perceived saturation too — chroma was scaled in CIELAB, which assumes
// lightness is perceptually uniform.
//
// This does NOT let you correct anything. It gives you a covariate: if a
// participant's weights look odd, you can check whether their display was
// unusual.
//
// Three repetitions of the standard 50% split-field luminance match.
// Roca-Vila et al. (2013) validated this method for online use.
// The median of three matches reduces noise from a single measurement.
//
// Starting grey is randomised per match ([90,200]) so the patch is
// immediately visible against the #808080 background and reduces
// anchoring bias across participants.
//
// ARRANGEMENTS (set via CONFIG.calibration.gamma_arrangement):
//   'split_field' (default): Left half checkerboard | Right half grey
//   'centre_surround': Centre disc vs surrounding ring
//
// INTERACTION:
//   A plain grey range slider adjusts the grey patch in real time.
//   Arrow keys adjust the slider natively; Confirm button submits.
//   The slider track is uniformly grey with no fill progression.
//
// OUTPUT:
//   window._estimatedGamma   -- median gamma (float or null)
//   jsPsych data: gamma_estimate, gamma_grey_match_1/2/3,
//                 gamma_density_1/2/3, gamma_estimate_1/2/3,
//                 gamma_arrangement_used
// =============================================================================

var GammaCalibration = (function () {

  const PATCH_SIZE_CSS  = 220;  // CSS px: size of each patch square
  const N_MATCHES       = 3;    // number of repetitions

  // Centre-surround geometry
  // Outer radius = half of PATCH_SIZE_CSS; inner (disc) radius = 40% of that
  const CS_OUTER_R_CSS  = PATCH_SIZE_CSS / 2;
  const CS_INNER_R_CSS  = Math.round(CS_OUTER_R_CSS * 0.45);

  // ============================================================
  // DRAWING: SPLIT-FIELD
  // ============================================================

  // Draw checkerboard into left half of an ImageData buffer.
  // physW and physH are the physical pixel dimensions of ONE half.
  function _fillCheckerboard(imageData, offsetX, physW, physH) {
    const px = imageData.data;
    const totalW = imageData.width; // full canvas width in physical px
    for (let y = 0; y < physH; y++) {
      for (let x = 0; x < physW; x++) {
        const i   = (y * totalW + (offsetX + x)) * 4;
        const val = (x + y) % 2 === 0 ? 255 : 0;
        px[i] = px[i+1] = px[i+2] = val;
        px[i+3] = 255;
      }
    }
  }

  function _drawSplitField(canvas, greyValue) {
    const dpr      = window.devicePixelRatio || 1;
    const physHalf = Math.round(PATCH_SIZE_CSS * dpr);
    const physH    = Math.round(PATCH_SIZE_CSS * dpr);

    canvas.width        = physHalf * 2;
    canvas.height       = physH;
    canvas.style.width  = (PATCH_SIZE_CSS * 2) + 'px';
    canvas.style.height = PATCH_SIZE_CSS + 'px';

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Left half: checkerboard (physical pixels, no ctx.scale)
    const imgData = ctx.createImageData(physHalf * 2, physH);
    _fillCheckerboard(imgData, 0, physHalf, physH);

    // Right half: uniform grey
    const g = greyValue;
    const px = imgData.data;
    for (let y = 0; y < physH; y++) {
      for (let x = 0; x < physHalf; x++) {
        const i = (y * physHalf * 2 + physHalf + x) * 4;
        px[i] = px[i+1] = px[i+2] = g;
        px[i+3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // ============================================================
  // DRAWING: CENTRE-SURROUND
  // ============================================================
  // Canvas is PATCH_SIZE_CSS x PATCH_SIZE_CSS (square).
  // Centre disc radius = CS_INNER_R_CSS, drawn at CSS-pixel level.
  // Surround annulus fills the rest.
  // The checkerboard is drawn at physical pixel resolution everywhere
  // it appears, using an off-screen canvas clipped by the appropriate shape.

  function _drawCentreSurround(canvas, greyValue) {
    const orientation = CONFIG.calibration.gamma_centre_surround_orientation
                        || 'checker_surround';
    const checkerIsSurround = (orientation === 'checker_surround');

    const dpr      = window.devicePixelRatio || 1;
    const physSize = Math.round(PATCH_SIZE_CSS * dpr);
    const cx       = PATCH_SIZE_CSS / 2;   // CSS px centre
    const cy       = PATCH_SIZE_CSS / 2;

    canvas.width        = physSize;
    canvas.height       = physSize;
    canvas.style.width  = PATCH_SIZE_CSS + 'px';
    canvas.style.height = PATCH_SIZE_CSS + 'px';

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // -- Step 1: fill entire canvas with checkerboard at physical px --
    const imgData = ctx.createImageData(physSize, physSize);
    _fillCheckerboard(imgData, 0, physSize, physSize);
    ctx.putImageData(imgData, 0, 0);

    // -- Step 2: switch to CSS-pixel drawing for the uniform grey region --
    // ctx.scale so subsequent draws use CSS coordinates
    ctx.scale(dpr, dpr);

    const g = greyValue;
    ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')';

    if (checkerIsSurround) {
      // Checkerboard is SURROUND -> grey disc in CENTRE
      ctx.beginPath();
      ctx.arc(cx, cy, CS_INNER_R_CSS, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Grey is SURROUND -> checker disc in CENTRE
      // Paint grey over everything, then punch out the centre circle
      // to reveal the checkerboard underneath.
      // We do this by filling with grey EXCEPT the disc region.
      // Canvas doesn't have a subtract operation directly, so we use
      // an even-odd winding rule fill with two paths:
      //   outer rect + inner circle = annulus
      ctx.beginPath();
      ctx.rect(0, 0, PATCH_SIZE_CSS, PATCH_SIZE_CSS); // outer rect
      ctx.arc(cx, cy, CS_INNER_R_CSS, 0, Math.PI * 2, true); // inner circle (counterclockwise = hole)
      ctx.fill('evenodd');
    }
  }

  // ============================================================
  // MASTER DRAW FUNCTION
  // Calls the appropriate drawing function based on CONFIG flag.
  // ============================================================
  function _draw(canvas, greyValue) {
    const arrangement = CONFIG.calibration.gamma_arrangement || 'split_field';
    if (arrangement === 'centre_surround') {
      _drawCentreSurround(canvas, greyValue);
    } else {
      _drawSplitField(canvas, greyValue);
    }
  }

  // ============================================================
  // LABELS for the two patches
  // ============================================================
  function _getPatchLabels() {
    const arrangement   = CONFIG.calibration.gamma_arrangement || 'split_field';
    const orientation   = CONFIG.calibration.gamma_centre_surround_orientation
                          || 'checker_surround';
    const checkerIsSurround = (orientation === 'checker_surround');

    if (arrangement === 'split_field') {
      var C = Loader.text().calibration;
      return { fixed: C.gamma_label_fixed, adjust: C.gamma_label_adjust };
    }
    // centre_surround
    if (checkerIsSurround) {
      return { fixed: 'FIXED (checkerboard surround)', adjust: 'ADJUST (centre disc)' };
    }
    return { fixed: 'FIXED (checkerboard disc)', adjust: 'ADJUST (surround ring)' };
  }

  // ============================================================
  // GAMMA COMPUTATION
  // ============================================================
  function _computeGamma(greyValue) {
    const n = greyValue / 255;
    if (n <= 0 || n >= 1) return null;
    return Math.log(0.5) / Math.log(n);
  }

  // ============================================================
  // CANVAS SIZE for layout labels
  // ============================================================
  function _canvasDisplayWidth() {
    const arrangement = CONFIG.calibration.gamma_arrangement || 'split_field';
    return arrangement === 'split_field'
      ? PATCH_SIZE_CSS * 2
      : PATCH_SIZE_CSS;
  }

  // ============================================================
  // PUBLIC: getNodes
  // ============================================================
  function getNodes(jsPsych) {

    const arrangement = CONFIG.calibration.gamma_arrangement || 'split_field';
    const labels      = _getPatchLabels();
    const canvasW     = _canvasDisplayWidth();

    // ---- Node 1: instruction (button click to advance) ----------------------
    const instructionNode = {
      type: jsPsychHtmlButtonResponse,
      stimulus:
        '<div class="calibration-card">' +
        '<h2>' + Loader.text().calibration.gamma_title + '</h2>' +
        Loader.text().calibration.gamma_intro +
        '</div>',
      choices: [Loader.text().calibration.gamma_button],
      button_html: '<button class="ne-continue-btn">%choice%</button>',
      data: { calibration_step: 'gamma_instruction' },
    };

    // ---- Node 2: matching task (jsPsychCallFunction owns the DOM) -----------
    //
    // INTERACTION STRATEGY:
    // ---- Node 2: three sequential matches with slider -----------------------
    //
    // The checkerboard drawing functions are identical to the working
    // single-match version — only the interaction and loop are new.
    const taskNode = {
      type: jsPsychCallFunction,
      async: true,
      func: function (done) {

        const display = jsPsych.getDisplayElement();
        const matches = [];

        // Neutral slider CSS: uniform grey track, no fill progression,
        // off-white thumb — provides no positional cue to the answer.
        var sliderCSS =
          '<style>' +
          '#gamma-slider{-webkit-appearance:none;-moz-appearance:none;' +
          'appearance:none;width:' + canvasW + 'px;max-width:100%;height:8px;' +
          'background:#666;border-radius:4px;outline:none;cursor:ew-resize;' +
          'border:none;display:block;margin:18px auto 0 auto;}' +
          '#gamma-slider::-webkit-slider-thumb{-webkit-appearance:none;' +
          'appearance:none;width:26px;height:26px;border-radius:50%;' +
          'background:#f0ede8;border:2px solid #333;cursor:ew-resize;' +
          'box-shadow:none;}' +
          '#gamma-slider::-webkit-slider-runnable-track{background:#666;' +
          'height:8px;border-radius:4px;}' +
          '#gamma-slider::-moz-range-thumb{width:26px;height:26px;' +
          'border-radius:50%;background:#f0ede8;border:2px solid #333;' +
          'cursor:ew-resize;box-shadow:none;}' +
          '#gamma-slider::-moz-range-track{background:#666;height:8px;' +
          'border-radius:4px;}' +
          '#gamma-slider::-moz-range-progress{background:#666;}' +
          '</style>';

        // Build label row HTML (identical across matches)
        let labelRow = '';
        if (arrangement === 'split_field') {
          labelRow =
            '<div style="display:flex; width:' + canvasW + 'px; ' +
            'justify-content:space-between; margin-bottom:6px; max-width:100%;">' +
            '<span style="width:' + PATCH_SIZE_CSS + 'px; text-align:center; ' +
            'color:#ddd; font-size:0.85rem;">' +
            labels.fixed + '</span>' +
            '<span style="width:' + PATCH_SIZE_CSS + 'px; text-align:center; ' +
            'color:#ddd; font-size:0.85rem;">' +
            labels.adjust + '</span>' +
            '</div>';
        } else {
          labelRow =
            '<div style="width:' + canvasW + 'px; text-align:center; ' +
            'margin-bottom:6px; max-width:100%;">' +
            '<span style="color:#aaa; font-size:0.75rem; font-family:monospace;">' +
            labels.fixed + ' / ' + labels.adjust + '</span>' +
            '</div>';
        }

        // Run one match; resolves to { grey, density }
        function runMatch(matchIndex) {
          return new Promise(function (resolve) {
            // Randomise start: immediately visible against #808080 background
            var greyValue = 90 + Math.floor(Math.random() * 111);

            display.innerHTML =
              sliderCSS +
              '<div style="text-align:center; padding:20px 0;">' +

              '<p style="color:#ddd; font-size:0.85rem; ' +
              'margin-bottom:6px;">' +
              Loader.text().calibration.gamma_progress
                .replace('{N}', matchIndex + 1).replace('{TOTAL}', N_MATCHES) +
              '</p>' +

              '<p style="color:#f0f0f0; font-size:1rem; ' +
              'margin-bottom:20px; max-width:600px; ' +
              'margin-left:auto; margin-right:auto;">' +
              Loader.text().calibration.gamma_prompt +
              '</p>' +

              '<div style="display:inline-block;">' +
              labelRow +
              '<canvas id="gamma-canvas" ' +
              'style="display:block; image-rendering:pixelated; ' +
              'image-rendering:crisp-edges; max-width:100%;">' +
              '</canvas>' +
              '</div>' +

              '<input type="range" id="gamma-slider" ' +
              'min="0" max="255" value="' + greyValue + '">' +

              '<div style="margin-top:20px;">' +
              '<button id="gamma-confirm-btn" class="ne-continue-btn" ' +
              'style="min-width:160px;">' +
              Loader.text().calibration.gamma_confirm_button +
              '</button>' +
              '</div>' +

              '<p style="color:#ddd; font-size:0.8rem; margin-top:10px;">' +
              Loader.text().calibration.gamma_hint +
              '</p>' +

              '</div>';

            const canvas     = document.getElementById('gamma-canvas');
            const slider     = document.getElementById('gamma-slider');
            const btnConfirm = document.getElementById('gamma-confirm-btn');

            if (!canvas || !slider || !btnConfirm) {
              resolve({ grey: greyValue, density: 0.50 });
              return;
            }

            _draw(canvas, greyValue);

            function onSliderInput() {
              greyValue = parseInt(slider.value, 10);
              _draw(canvas, greyValue);
            }

            function onConfirm() {
              slider.removeEventListener('input', onSliderInput);
              slider.removeEventListener('keydown', onSliderKey);
              btnConfirm.removeEventListener('click', onConfirm);
              resolve({ grey: greyValue, density: 0.50 });
            }

            function onSliderKey(e) {
              if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                onConfirm();
              }
            }

            slider.addEventListener('input', onSliderInput);
            slider.addEventListener('keydown', onSliderKey);
            btnConfirm.addEventListener('click', onConfirm, { once: true });

            setTimeout(function () { slider.focus(); }, 0);
          });
        }

        // Run all matches sequentially
        (async function () {
          for (var i = 0; i < N_MATCHES; i++) {
            var result = await runMatch(i);
            matches.push(result);
          }
          window._gammaMatches     = matches;
          window._gammaArrangement = arrangement;
          display.innerHTML = '';
          done();
        })();
      },

      data: { calibration_step: 'gamma_task' },

      on_finish: function (data) {
        data.gamma_matches     = window._gammaMatches;
        data.gamma_arrangement = window._gammaArrangement;
      },
    };

    // ---- Node 3: compute median gamma, store all three matches -------------
    const storeNode = {
      type: jsPsychCallFunction,
      func: function () {
        var matches = window._gammaMatches || [];

        var gammaValues = matches.map(function (m) {
          return _computeGamma(m.grey);
        });

        // Median
        var valid = gammaValues.filter(function (v) { return v !== null; });
        var finalGamma = null;
        if (valid.length > 0) {
          var s = valid.slice().sort(function (a, b) { return a - b; });
          var mid = Math.floor(s.length / 2);
          finalGamma = s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
        }
        window._estimatedGamma = finalGamma;

        var props = {
          gamma_estimate:         finalGamma !== null
                                    ? parseFloat(finalGamma.toFixed(3))
                                    : null,
          gamma_arrangement_used: window._gammaArrangement || 'unknown',
        };

        matches.forEach(function (m, i) {
          var n = i + 1;
          var g = _computeGamma(m.grey);
          props['gamma_grey_match_' + n] = m.grey;
          props['gamma_density_'   + n]  = 0.50;
          props['gamma_estimate_'  + n]  = g !== null
                                             ? parseFloat(g.toFixed(3))
                                             : null;
        });

        jsPsych.data.addProperties(props);

        matches.forEach(function (m, i) {
          var g = _computeGamma(m.grey);
          console.log(
            '[Gamma] match ' + (i + 1) + ': grey=' + m.grey +
            '/255  gamma=' + (g !== null ? g.toFixed(3) : 'null')
          );
        });
        console.log('[Gamma] final (median): ' +
          (finalGamma !== null ? finalGamma.toFixed(3) : 'null'));
        console.log('[Platform] Calibration step complete: calibration_gamma');
      },
    };

    return [instructionNode, taskNode, storeNode];
  }

  return { getNodes };

})();
