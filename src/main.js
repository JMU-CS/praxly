import Blockly, { Block, config } from 'blockly';
import { praxlyDefaultTheme } from "./theme"
import { PraxlyDark } from './theme';
import { toolbox } from './toolbox';

// import {textEditor } from './lexer-parser';
import { tree2text } from './tree2text';
import { definePraxlyBlocks } from './newBlocks';
import { makeGenerator } from './blocks2tree';
import { blocks2tree } from './blocks2tree';
import { createExecutable } from './ast';

// import ace from 'ace-builds';
import "ace-builds/src-min-noconflict/theme-twilight";
import "ace-builds/src-min-noconflict/theme-katzenmilch";
import { tree2blocks } from './tree2blocks';
// import { errorOutput } from './lexer-parser';
import { text2tree } from './text2tree';
import { generateUrl, loadFromUrl } from './share';

// import { readFileSync } from 'fs';
import { codeText } from './examples';
import { DEV_LOG, debugButton, addBlockErrors, annotationsBuffer, clearErrors, clearOutput, comingSoon, defaultError, errorOutput, getDebugMode, printBuffer, setDebugMode, setStepInto, stepButton, stepIntoButton, stopButton, textEditor } from './common';
import { hideDebug, showDebug } from './debugger';

let runButton;
let shareButton;
let darkModeButton;
let settingsButton;
let infoButton;
let manualButton;
let resizeBarX;
let resizeBarY;
let blockPane;
let textPane;
let stdOut;
let stdErr;
let clearOut;
let modal;
let manual;
let featuresButton;
let bugButton;
let changelogButton;
let exampleDiv;
let githubButton;
let peopleButton;
let titleRefresh;
let bothButton;
let textButton;
let blocksButton;
let bottomPart;
let toolboxstylesheet;
let span;
let darkmodediv;
let runEmbedButton;
let debugEmbedButton;
let stopEmbedButton;
let stepEmbedButton;
let resizeBarBott;

let configuration = {
  code: null,
  editorMode: 'both',
  showOutput: true,
  isEmbedded: null,
};

export let workspace;
let praxlyGenerator;
let mainTree;
let darkMode = true;
let live = true;
let isResizing = false;

function initializeGlobals() {
  if (configuration.embed) {
    runButton = document.getElementById('embed-run-button');
  } else {
    runButton = document.getElementById('runButton');
  }
  shareButton = document.getElementById('share');
  darkModeButton = document.getElementById('darkMode');
  settingsButton = document.getElementById("settings");
  infoButton = document.getElementById('info');
  manualButton = document.getElementById("reference");
  resizeBarX = document.querySelector('.resizeBarX');
  resizeBarY = document.querySelector('.resizeBarY');
  blockPane = document.querySelector('#blocklyDiv');
  textPane = document.querySelector('#aceCode');
  stdOut = document.querySelector('.stdout');
  stdErr = document.querySelector('.stderr');
  clearOut = document.querySelector('.clearOut');
  modal = document.getElementById("myModal");
  manual = document.getElementById("manual");
  featuresButton = document.getElementById('FeaturesButton');
  bugButton = document.getElementById("BugButton");
  changelogButton = document.getElementById('ChangelogButton');
  exampleDiv = document.getElementById('exampleTable');
  githubButton = document.getElementById('GitHubButton');
  peopleButton = document.getElementById('AboutButton');
  titleRefresh = document.getElementById('titleRefresh');
  bothButton = document.getElementById("tab1_button");
  textButton = document.getElementById('tab2_button');
  blocksButton = document.getElementById('tab3_button');
  bottomPart = document.getElementById('bottom-part');
  toolboxstylesheet = document.getElementById("ToolboxCss");
  span = document.getElementsByClassName("close")[0];
  darkmodediv = document.querySelector('.settingsOptions');
  runEmbedButton = document.querySelector('#embed-run-button');
  debugEmbedButton = document.querySelector('#embed-debug-button');
  stepEmbedButton = document.querySelector('#embed-step-button');
  stopEmbedButton = document.querySelector('#embed-stop-button');
  resizeBarBott = document.querySelector('.resizeBarBott');
}

function registerListeners() {
  runButton.addEventListener('click', runTasks);
  runEmbedButton.addEventListener('click', runTasks);
  debugEmbedButton.addEventListener('mouseup', function () {
    showDebugEmbedMode();
    setDebugMode(true);
    runTasks();
  });
  stepEmbedButton.addEventListener('mouseup', function () {
    if (!getDebugMode) {
      endDebugPrompt();
    }
    setDebugMode(true);
  });
  stopEmbedButton.addEventListener('click', function () {
    hideDebugEmbedMode();
    setDebugMode(false);
    stepEmbedButton.click();
  });
  darkModeButton.addEventListener('click', () => { darkMode ? setLight() : setDark(); });
  clearOut.addEventListener('click', () => {
    clearOutput();
    clearErrors();
    stdOut.innerHTML = "";
    stdErr.innerHTML = "";
  });
  workspace.addChangeListener(onBlocklyChange);
  textEditor.addEventListener("input", turnCodeToBLocks);

  //resizing things with the purple bar
  resizeBarX.addEventListener('mousedown', function (e) {
    isResizing = true;
    document.addEventListener('mousemove', resizeHandlerX);
  });

  resizeBarY.addEventListener('mousedown', function (e) {
    isResizing = true;
    document.addEventListener('mousemove', resizeHandlerY);
  })

  resizeBarBott.addEventListener('mousedown', function (e) {
    isResizing = true;
    document.addEventListener('mousemove', resizeHandlerBott);
  });

  document.addEventListener('mouseup', function (e) {
    isResizing = false;
    document.removeEventListener('mousemove', resizeHandlerX);
    Blockly.svgResize(workspace);
    textEditor.resize();
  });

  document.addEventListener('mouseup', function (e) {
    isResizing = false;
    document.removeEventListener('mousemove', resizeHandlerY);
    Blockly.svgResize(workspace);
    textEditor.resize();
  });

  document.addEventListener('mouseup', function (e) {
    isResizing = false;
    document.removeEventListener('mousemove', resizeHandlerBott);
  });

  manualButton.addEventListener('click', function () {
    var linkUrl = 'pseudocode.html';
    window.open(linkUrl, '_blank');
  });

  bugButton.addEventListener('click', function () {
    window.open("BugsList.html", '_blank');
  });

  changelogButton.addEventListener('click', function () {
    window.open("changelog.html", '_blank');
  });

  featuresButton.addEventListener('click', function () {
    window.open("features.html", '_blank');
  });

  githubButton.addEventListener('click', function () {
    window.open("https://github.com/sauppb/praxly", '_blank');
  });

  peopleButton.addEventListener('click', function () {
    window.open('people.html');
  });

  titleRefresh.addEventListener('click', function () {
    clearOutput();
    clearErrors();
    stdOut.innerHTML = "";
    stdErr.innerHTML = "";
    window.location.hash = '';
    textEditor.setValue('', -1);
    textPane.click();
    textEditor.focus();
  });

  // these make it so that the blocks and text take turns.
  blockPane.addEventListener('click', () => {
    workspace.removeChangeListener(onBlocklyChange);
    workspace.addChangeListener(onBlocklyChange);
  });

  textPane.addEventListener('click', () => {
    textEditor.removeEventListener("input", turnCodeToBLocks);
    textEditor.addEventListener("input", turnCodeToBLocks);
  });

  // When the user clicks the button, open the modal
  infoButton.onclick = function () {
    setLight();
    modal.style.display = "block";
  }

  settingsButton.onclick = function () {
    let darkmodediv = document.querySelector('.settingsOptions');
    if (darkmodediv.style.display === 'none') {
      darkmodediv.style.display = ''; // Show the button
    } else {
      darkmodediv.style.display = 'none'; // Hide the button
    }
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
    manual.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal || event.target == manual) {
      modal.style.display = "none";
      manual.style.display = "none";
    }
  }

  //share button
  shareButton.addEventListener('click', generateUrl);

  // this is how you add custom keybinds!
  document.addEventListener("keydown", function (event) {
    // Check if the event key is 's' and Ctrl or Command key is pressed
    if ((event.key === 's' || event.key === 'S') && (event.ctrlKey || event.metaKey) || event.key === 'F5') {
      // Prevent the default save action (e.g., opening the save dialog, reloading the page)
      event.preventDefault();
      runTasks();
      // console.log(trees);
    }
  });

  blocksButton.addEventListener('click', showBlocksOnly);
  textButton.addEventListener('click', showTextOnly);
  bothButton.addEventListener('click', showTextAndBlocks);

  /**
   * Event listeners for the main circular buttons along the top.
   */

  debugButton.addEventListener('mouseup', function () {
    // comingSoon();
    showDebug();
    setDebugMode(true);
    runTasks();
  });

  stopButton.addEventListener('click', function () {
    hideDebug();
    setDebugMode(false);
    setStepInto(false);
    stepButton.click();
  });

  stepIntoButton.addEventListener('mouseup', function () {
    // comingSoon();
    if (!getDebugMode()) {
      endDebugPrompt();
    }
    setDebugMode(true);
    setStepInto(true);
  });

  stepButton.addEventListener('mouseup', function () {
    // comingSoon();
    if (!getDebugMode()) {
      endDebugPrompt();
    }
    setDebugMode(true);
  });
}

function showBlocksOnly() {
  document.querySelector('header').style.display = 'none';
  resizeBarX.style.display = 'none';
  textPane.style.display = 'none';
  blockPane.style.display = 'block';
  Blockly.svgResize(workspace);
  textEditor.resize();
}

/* Default */
function showTextOnly() {
  textPane.style.display = 'block';

  document.querySelector('header').style.display = 'none';
  resizeBarX.style.display = 'none';
  blockPane.style.display = 'none';

  document.querySelector('#Variable-table-container').style.display = 'none';
  resizeBarBott.style.display = 'none';

  Blockly.svgResize(workspace);
  textEditor.resize();
}

function showTextAndBlocks() {
  resizeBarX.style.display = 'block';
  blockPane.style.display = 'block';
  textPane.style.display = 'block';
  document.querySelector('header').style.display = 'none';

  Blockly.svgResize(workspace);
  textEditor.resize();
}

function showDebugEmbedMode() {
  let buttons = document.querySelectorAll('.debugOptionsEmbed');
  for (let button of buttons) {
    button.style.display = 'block';
  }
  document.querySelector('#embed-debug-button').style.display = 'none';
  document.querySelector('#embed-run-button').style.display = 'none';
}

function hideDebugEmbedMode() {
  let buttons = document.querySelectorAll('.debugOptionsEmbed');
  for (let button of buttons) {
    button.style.display = 'none';
  }
  document.querySelector('#embed-debug-button').style.display = 'block';

}

/**
 * this function gets called every time the run button is pressed.
 */
async function runTasks() {
  console.log("runTasks");

  if (!textEditor.getValue().trim()) {
    alert('there is nothing to run :( \n try typing some code or dragging some blocks first.');
    return;
  }
  const executable = createExecutable(mainTree);
  try {
    await executable.evaluate();
    setDebugMode(false);
  } catch (error) {

    // if not previously handled (by PraxlyError)
    if (!errorOutput) {
      defaultError(error);
      console.error(error);
    }
  }
  // stdOut.innerHTML = printBuffer;
  if (errorOutput) {
    textEditor.session.setAnnotations(annotationsBuffer);
    stdErr.innerHTML = errorOutput;
    addBlockErrors(workspace);
    clearErrors();
  } else {
    // replace special chars if ran without error
    var pos = textEditor.getCursorPosition();
    turnBlocksToCode();
    textEditor.moveCursorToPosition(pos);
    textEditor.addEventListener("input", turnCodeToBLocks);
  }
  textEditor.focus();
}

export function turnCodeToBLocks() {
  // I need to make the listeners only be one at a time to prevent an infinite loop.
  workspace.removeChangeListener(onBlocklyChange);
  if (getDebugMode()) {
    setDebugMode(false);
    setStepInto(false);
    stepButton.click();

  }
  clearOutput();
  clearErrors();
  mainTree = text2tree();

  if (DEV_LOG) {
    console.log(mainTree);
  }
  workspace.clear();
  tree2blocks(workspace, mainTree);
  workspace.render();
  //comment this out to stop the live error feedback.
  textEditor.session.setAnnotations(annotationsBuffer);
  addBlockErrors(workspace);
}

function onBlocklyChange(event) {
  // Not every change event warrants rebuilding the program. For example,
  // switching themes.
  if (event.type !== 'theme_change') {
    turnBlocksToCode();
  }
}

function turnBlocksToCode() {
  textEditor.removeEventListener("input", turnCodeToBLocks);
  clearOutput();
  clearErrors();
  mainTree = blocks2tree(workspace, praxlyGenerator);
  // console.info("here is the tree generated by the blocks:");
  // console.debug(mainTree);
  const text = tree2text(mainTree, 0, 0);
  textEditor.setValue(text, -1);
};

function resizeHandlerX(e) {
  if (!isResizing) return;

  const containerWidth = document.querySelector('main').offsetWidth;
  const mouseX = e.pageX;
  const leftPaneWidth = (mouseX / containerWidth) * 100;
  const rightPaneWidth = 100 - leftPaneWidth;

  textPane.style.flex = leftPaneWidth;
  blockPane.style.flex = rightPaneWidth;

  Blockly.svgResize(workspace);
}

function resizeHandlerY(e) {
  if (!isResizing) return;

  const main = document.querySelector('main');
  const bottom = document.querySelector('#bottom-part');

  const containerHeight = document.body.clientHeight;
  const mouseY = e.pageY;
  const topHeight = (mouseY / containerHeight) * 100;
  const bottomHeight = 100 - topHeight;

  main.style.flex = topHeight + '%';
  bottom.style.flex = bottomHeight + '%';

  Blockly.svgResize(workspace);
}

function resizeHandlerBott(e) {
  if (!isResizing) return;

  const output = document.querySelector('.output');
  const variables = document.querySelector('#Variable-table-container');
  const bottom = bottomPart;

  const containerWidth = bottom.offsetWidth;
  const mouseX = e.pageX;
  const left = (mouseX / containerWidth) * 100;
  const right = 100 - left;

  output.style.flex = left;
  variables.style.flex = right;

}

function setDark() {
  darkMode = true;
  workspace.setTheme(PraxlyDark);
  textEditor.setTheme("ace/theme/twilight");

  document.body.classList.toggle('light-mode', false);
}

function setLight() {
  darkMode = false;
  workspace.setTheme(praxlyDefaultTheme);
  textEditor.setTheme('ace/theme/katzenmilch');

  document.body.classList.toggle('light-mode');
}

function generateExamples() {
  const dataArray = codeText.split('##');
  var selectDropdown = document.getElementById("exampleTable");
  for (let i = 1; i < dataArray.length - 1; i += 2) {
    const label = dataArray[i].trim();
    var option = document.createElement("option");
    option.textContent = label;
    const value = dataArray[i + 1].trim();
    option.value = value;

    selectDropdown.appendChild(option);
  }

  selectDropdown.addEventListener('change', function () {
    textEditor.setValue(selectDropdown.value, -1);
    textPane.click();
  });
}

function endDebugPrompt() {
  let exitDebug = confirm('the program has completed. Would you like to exit the debugger?');
  if (exitDebug) {
    stopButton.click();
  }
}

function initializeBlockly() {
  workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolbox,
    // scrollbars: false,
    horizontalLayout: false,
    toolboxPosition: "start",
    theme: darkMode ? PraxlyDark : praxlyDefaultTheme,
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
      pinch: true
    },
    renderer: 'zelos'
  });
  // darkMode ? setLight() : setDark();
  darkMode ? textEditor.setTheme("ace/theme/twilight") : textEditor.setTheme('ace/theme/katzenmilch');
  definePraxlyBlocks(workspace);
}


function parseUrlConfiguration() {
  // The URL may be of the form https://.../?key1=value1&key2#code=... The code
  // is provided as a fragment identifier (that is, succeeding #) because
  // fragment identifiers are not sent up to the web server. The code can get
  // quite long, and URLs sent to a server have a maximum length.

  // Grab the code baked into the URL.
  const hash = window.location.hash;
  const pattern = '#code=';
  if (hash.startsWith(pattern)) {
    let source = hash.substring(pattern.length);
    configuration.code = decodeURIComponent(source);
  }

  // Configure according to the ?key1=value1&key2 parameters.
  let parameters = new URLSearchParams(window.location.search);
  configuration.embed = parameters.has('embed');
  const defaultEditor = configuration.embed ? 'text' : 'both';
  const defaultButton = configuration.embed ? 'run' : 'both';
  const defaultResult = configuration.embed ? 'output' : 'both';
  configuration.editor = parameters.get('editor') ?? defaultEditor;
  configuration.button = parameters.get('button') ?? defaultButton;
  configuration.result = parameters.get('result') ?? defaultResult;
}

function synchronizeToConfiguration() {
  // The initial code is necessarily text, not blocks.
  if (configuration.code) {
    textEditor.setValue(configuration.code, 1);
  }

  if (configuration.embed) {
    document.body.classList.add('embed');
    // Embeds in the CodeVA Canvas are in high contrast. Let's go
    // with dark mode for the time being.
    setDark();
    showTextOnly();
  }

  // editor
  if (configuration.editor === 'blocks') {
    showBlocksOnly();
  } else if (configuration.editor === 'both') {
    document.querySelector('header').style.display = 'none';
    textEditor.resize
    Blockly.svgResize(workspace);
  } else {
    showTextOnly();
  }

  // button
  if (configuration.button === 'debug') {
    debugEmbedButton.style.display = 'block';
    runEmbedButton.style.display = 'none';
  } else if (configuration.button === 'both') {
    runEmbedButton.style.display = 'block';
    debugEmbedButton.style.display = 'block';
  } else { // run
    runEmbedButton.style.display = 'block';
    debugEmbedButton.style.display = 'none';
  }

  // result
  if (configuration.result === 'vars') {
    document.querySelector('#Variable-table-container').style.display = 'block';
    document.querySelector('.output').style.display = 'none';
  } else if (configuration.result === 'both') {
    document.querySelector('.output').style.display = 'block';
    resizeBarBott.style.display = 'block';
    document.querySelector('#Variable-table-container').style.display = 'block';
  } else {
    document.querySelector('.output').style.display = 'block';
    document.querySelector('#Variable-table-container').style.display = 'none';
  }


  // if (configuration.editor === 'text') {
  //   showTextOnly();
  //   textEditor.focus();
  // } else if (configuration.editor === 'blocks') {
  //   showBlocksOnly();
  // } else {
  //   showTextAndBlocks();
  //   textEditor.focus();
  // }

  // if (!configuration.showOutput) {
  //   bottomPart.style.display = 'none';
  //   resizeBarY.style.display = 'none';
  //   Blockly.svgResize(workspace);
  // }
}

function initialize() {
  // We parse the configuration first because it influences the UI.
  parseUrlConfiguration();
  initializeGlobals();
  praxlyGenerator = makeGenerator();
  initializeBlockly();
  darkmodediv.style.display = 'none';
  registerListeners();
  generateExamples();
  synchronizeToConfiguration();
}

initialize();
