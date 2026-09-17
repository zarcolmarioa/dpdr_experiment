/* =========================================================================
 * mock.js — SMOKE TEST ONLY.
 *
 * Six trials of two coloured rectangles, answered with the arrow keys.
 * No stimulus images are loaded, so this runs before the 227 PNGs are
 * committed.
 *
 * The point is not the task. The point is that these trials produce rows
 * with the SAME column structure the real pair trials will produce, so a
 * successful upload proves the whole output path works.
 *
 * Delete this file once phases/pairs.js is in place.
 * ========================================================================= */

var MockPhase = (function () {

  // Stand-ins for the real image pairs. The colour difference makes it
  // obvious on screen which side is which, so you can confirm the recorded
  // response_side matches the key actually pressed.
  var MOCK_PAIRS = [
    { pair_type: 'sat_only',  left: '#8b8b8b', right: '#c94f3d', a_is_left: true  },
    { pair_type: 'fog_only',  left: '#d8d4cc', right: '#6b6f72', a_is_left: false },
    { pair_type: 'conflict',  left: '#a8c0a0', right: '#b09080', a_is_left: true  },
    { pair_type: 'together',  left: '#9aa6b2', right: '#4a5560', a_is_left: false },
    { pair_type: 'catch',     left: '#7f7f7f', right: '#7f7f7f', a_is_left: true,
      correct_response: 'right' },
    { pair_type: 'sat_only',  left: '#c0b090', right: '#707070', a_is_left: false },
  ];

  function _panel(colour, label) {
    return (
      '<div class="stim-panel" style="' +
      'width:'  + CONFIG.display.image_px + 'px;' +
      'height:' + CONFIG.display.image_px + 'px;' +
      'background:' + colour + ';">' +
      '<span class="mock-label">' + label + '</span>' +
      '</div>'
    );
  }

  function _prompt(pair) {
    if (pair.pair_type === 'catch') {
      // Catch-trial wording comes from the text file in the real experiment.
      return 'Press the RIGHT arrow key.';
    }
    return 'Which of these looks more like how the world looked to you?';
  }

  function buildNodes(jsPsych) {
    var nodes = [];
    var n = Math.min(CONFIG.mock.n_trials, MOCK_PAIRS.length);

    nodes.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus:
        '<div class="card">' +
        '<h2>Smoke test</h2>' +
        '<p>' + n + ' placeholder trials. Answer with the ' +
        '<b>&#8592;</b> and <b>&#8594;</b> arrow keys.</p>' +
        '<p>Press <b>SPACE</b> to begin.</p>' +
        '</div>',
      choices: [' '],
      data: { block: 'mock_instructions' },
    });

    for (var i = 0; i < n; i++) {
      (function (pair, index) {

        // Fixation
        nodes.push({
          type: jsPsychHtmlKeyboardResponse,
          stimulus: '<div class="fixation">+</div>',
          choices: 'NO_KEYS',
          trial_duration: CONFIG.timing.fixation_ms,
          data: { block: 'fixation' },
        });

        // Stimulus pair
        nodes.push({
          type: jsPsychHtmlKeyboardResponse,
          stimulus:
            '<div class="stim-prompt">' + _prompt(pair) + '</div>' +
            '<div class="stim-row" style="gap:' + CONFIG.display.gap_px + 'px;">' +
            _panel(pair.left,  'LEFT')  +
            _panel(pair.right, 'RIGHT') +
            '</div>',
          choices: [CONFIG.keys.left, CONFIG.keys.right],
          data: {
            block:            'pairs',
            trial_index_list: index,
            pair_type:        pair.pair_type,
            analysed:         pair.pair_type !== 'catch',
            scene_id:         'mock_scene_' + index,
            category:         'mock',
            left_path:        'mock/' + pair.left.slice(1) + '.png',
            right_path:       'mock/' + pair.right.slice(1) + '.png',
            a_is_left:        pair.a_is_left,
            d_sat:            0, d_fog: 0, z_sat: 0, z_fog: 0, mag_bin: 1,
            correct_response: pair.correct_response || null,
            repeat_of:        null,
            display_px:       CONFIG.display.image_px,
          },
          on_finish: function (data) { Record.finishPairTrial(data); },
        });

        // Blank
        nodes.push({
          type: jsPsychHtmlKeyboardResponse,
          stimulus: '',
          choices: 'NO_KEYS',
          trial_duration: CONFIG.timing.blank_ms,
          data: { block: 'blank' },
        });

      })(MOCK_PAIRS[i], i);
    }

    return nodes;
  }

  return { buildNodes: buildNodes };
})();
