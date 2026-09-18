// =============================================================================
// src/calibration/brightness-confirmation.js
//
// PORTED from the noise-estimation experiment, where it was tested on
// Pavlovia. What changed on the port:
//   - INSTRUCTIONS.* replaced by Loader.text().calibration.*, so the strings
//     live in text/en and text/ja like everything else participants see
//   - guarded by CONFIG.calibration.brightness
//
// WHY IT MATTERS FOR THIS EXPERIMENT
// ----------------------------------
// Haze works by lifting the shadows: lum_p05 runs from roughly 68 at the
// lowest level to 158 at the highest, so the ENTIRE haze manipulation lives
// in the dark end of the range. On a dimmed laptop those levels crush
// toward black, and a participant may not be able to distinguish the haze
// levels at all — which would look like "this person doesn't track fog"
// rather than "this person couldn't see the fog".
//
// The continue button stays disabled until the checkbox is ticked, so the
// participant has to act rather than click through.
//
// OUTPUT (jsPsych data, session-level):
//   brightness_confirmed  bool
// =============================================================================

var BrightnessConfirmation = (function () {

  function getNodes(jsPsych) {

    var confirmNode = {
      type: jsPsychCallFunction,
      async: true,
      func: function (done) {

        var T = Loader.text().calibration;
        var display = jsPsych.getDisplayElement();

        display.innerHTML =
          '<div class="calibration-card" style="text-align:center;">' +

          '<h2>' + T.brightness_title + '</h2>' +

          T.brightness_intro +

          '<div style="margin:28px auto; max-width:520px;">' +

          '<p style="margin:0 0 16px 0; font-size:0.95rem; text-align:center;">' +
          T.brightness_checkbox +
          '</p>' +

          '<input type="checkbox" id="brightness-checkbox" ' +
          'style="display:block; margin:16px auto; width:22px; height:22px; ' +
          'cursor:pointer;">' +

          '</div>' +

          '<button id="brightness-continue-btn" class="calib-btn" ' +
          'disabled style="opacity:0.35; cursor:not-allowed;">' +
          T.button_continue +
          '</button>' +

          '</div>';

        var checkbox    = document.getElementById('brightness-checkbox');
        var continueBtn = document.getElementById('brightness-continue-btn');

        checkbox.addEventListener('change', function () {
          if (checkbox.checked) {
            continueBtn.disabled      = false;
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor  = 'pointer';
          } else {
            continueBtn.disabled      = true;
            continueBtn.style.opacity = '0.35';
            continueBtn.style.cursor  = 'not-allowed';
          }
        });

        continueBtn.addEventListener('click', function () {
          var confirmed = checkbox.checked;
          jsPsych.data.addProperties({ brightness_confirmed: confirmed });
          console.log('[Brightness] confirmed: ' + confirmed);
          display.innerHTML = '';
          done();
        }, { once: true });
      },

      data: { block: 'calibration_brightness' },
    };

    return [confirmNode];
  }

  return { getNodes: getNodes };

})();
