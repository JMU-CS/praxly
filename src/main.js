import Blockly, { Block } from 'blockly';
import { praxlyDefaultTheme } from "./theme"
import { PraxlyDark } from './theme';
import { toolbox } from './toolbox';

import { tree2text } from './tree2text';
import { definePraxlyBlocks } from './newBlocks';
import { makeGenerator } from './blocks2tree';
import { blocks2tree } from './blocks2tree';
import { createExecutable } from './ast';

import "ace-builds/src-min-noconflict/theme-twilight";
import "ace-builds/src-min-noconflict/theme-katzenmilch";
import { tree2blocks } from './tree2blocks';
import { text2tree } from './text2tree';
import { generateUrl } from './share';

import { codeText } from './examples';
import { DEV_LOG, debugButton, addBlockErrors, annotationsBuffer, clearErrors, clearOutput, defaultError, errorOutput, getDebugMode, setDebugMode, setStepInto, stepButton, stepIntoButton, stopButton, textEditor } from './common';
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

let span;
let darkmodediv;

let resizeBarBott;
let resizeSideInEmbed;
let toggleText, toggleBlocks, toggleOutput, toggleVars;

// make sure this works fine in gui
export let configuration = {};  // see parseUrlConfiguration()

export let workspace;
let praxlyGenerator;
let mainTree;
let darkMode = true;
let isResizing = false;
let varsOn, outputOn = false;
export let embedMode;
export let parameters;

function initializeGlobals() {
  if (!configuration.embed) {
    embedMode = false;
    darkModeButton = document.getElementById('darkMode');
    settingsButton = document.getElementById("settings");
    modal = document.getElementById("myModal");
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
    darkmodediv = document.querySelector('.settingsOptions');
    span = document.getElementsByClassName("close")[0];
    toggleText = document.querySelector('#toggle-text');
    toggleBlocks = document.querySelector('#toggle-blocks');
    toggleOutput = document.querySelector('#toggle-output');
    toggleVars = document.querySelector('#toggle-vars');
  } else {
    embedMode = true;
  }
  runButton = document.getElementById('runButton');
  shareButton = document.getElementById('share');
  infoButton = document.getElementById('info');
  manualButton = document.getElementById("reference");
  resizeBarX = document.querySelector('.resizeBarX');
  resizeBarY = document.querySelector('.resizeBarY');
  blockPane = document.querySelector('#blocklyDiv');
  textPane = document.querySelector('#aceCode');
  stdOut = document.querySelector('.stdout');
  stdErr = document.querySelector('.stderr');
  clearOut = document.querySelector('.clearOut');
  manual = document.getElementById("manual");
  bottomPart = document.getElementById('bottom-part');
  resizeBarBott = document.querySelector('.resizeBarBott');
  resizeSideInEmbed = document.querySelector('.resize-side-view');

}

function registerListeners() {
  if (!embedMode) { // if embed mode is not on, add usual listeners
    darkModeButton.addEventListener('click', () => { darkMode ? setLight() : setDark(); });
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

    blocksButton.addEventListener('click', showBlocksOnly);
    textButton.addEventListener('click', showTextOnly);
    bothButton.addEventListener('click', showTextAndBlocks);

    stepIntoButton.addEventListener('mouseup', function () {
      // comingSoon();
      if (!getDebugMode()) {
        endDebugPrompt();
      }
      setDebugMode(true);
      setStepInto(true);
    });

    // toggle buttons
    toggleText.addEventListener('click', toggleTextOn);
    toggleBlocks.addEventListener('click', toggleBlocksOn);
    toggleOutput.addEventListener('click', toggleOutputOn);
    toggleVars.addEventListener('click', toggleVarsOn);

    resizeBarBott.addEventListener('mousedown', function (e) {
      isResizing = true;
      document.addEventListener('mousemove', resizeHandlerBott);
    });

    document.addEventListener('mouseup', function (e) {
      isResizing = false;
      document.removeEventListener('mousemove', resizeHandlerBott);
    });
  } else {
    resizeSideInEmbed.addEventListener('mousedown', function (e) {
      isResizing = true;
      document.addEventListener('mousemove', resizeHandlerSideEmbed);
    });

    document.addEventListener('mouseup', function (e) {
      isResizing = false;
      document.removeEventListener('mousemove', resizeHandlerSideEmbed);
    });
  }

  runButton.addEventListener('click', runTasks);
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



  // these make it so that the blocks and text take turns.
  blockPane.addEventListener('click', () => {
    workspace.removeChangeListener(onBlocklyChange);
    workspace.addChangeListener(onBlocklyChange);
  });

  textPane.addEventListener('click', () => {
    textEditor.removeEventListener("input", turnCodeToBLocks);
    textEditor.addEventListener("input", turnCodeToBLocks);
  });


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


  stepButton.addEventListener('mouseup', function () {
    // comingSoon();
    if (!getDebugMode()) {
      endDebugPrompt();
    }
    setDebugMode(true);
  });


}



let isTextOn = true;
function toggleTextOn() {
  isTextOn = !isTextOn;

  if (isTextOn) {
    textPane.style.display = 'block'
    resizeBarX.style.display = 'block';
    toggleText.style.backgroundColor = 'black';
  } else {
    textPane.style.display = 'none';
    resizeBarX.style.display = 'none';
    Blockly.svgResize(workspace);
    toggleText.style.backgroundColor = 'white';
  }
}



let isBlocksOn = true;
function toggleBlocksOn() {
  isBlocksOn = !isBlocksOn;

  if (isBlocksOn) {
    blockPane.style.display = 'block';
    resizeBarX.style.display = 'block';
    Blockly.svgResize(workspace);
    toggleBlocks.style.backgroundColor = 'black';
  } else {
    blockPane.style.display = 'none';
    resizeBarX.style.display = 'none';
    Blockly.svgResize(workspace);
    textEditor.resize();
    toggleBlocks.style.backgroundColor = 'white';
  }
}

let isOutputOn = true;
function toggleOutputOn() {
  isOutputOn = !isOutputOn;

  const output = document.querySelector('.output');
  output.style.display = isOutputOn ? 'block' : 'none';
  resizeBarBott.style.display = isOutputOn ? 'block' : 'none';
  toggleOutput.style.backgroundColor = isOutputOn ? 'black' : 'white';
  isBottomOff();
}

let isVarsOn = true;
function toggleVarsOn() {
  isVarsOn = !isVarsOn;

  const variables = document.querySelector('#Variable-table-container');
  variables.style.display = isVarsOn ? 'block' : 'none';
  resizeBarBott.style.display = isVarsOn ? 'block' : 'none';
  toggleVars.style.backgroundColor = isVarsOn ? 'black' : 'white';
  isBottomOff();
}

function isBottomOff() {
  let leftOff = document.querySelector('#Variable-table-container');
  let rightOff = document.querySelector('.output');

  if (leftOff.style.display === 'none' && rightOff.style.display === 'none') {
    resizeBarY.style.display = 'none';
    bottomPart.style.display = 'none';
    Blockly.svgResize(workspace);
    textEditor.resize();
  } else {
    resizeBarY.style.display = 'block';
    bottomPart.style.display = 'flex';
  }
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

function showBlocksOnly() {
  resizeBarX.style.display = 'none';
  textPane.style.display = 'none';
  blockPane.style.display = 'block';
  Blockly.svgResize(workspace);
  textEditor.resize();
}


/* Default */

function showTextOnly() {
  textPane.style.display = 'block';

  // resizeBarX.style.display = 'none';
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

  Blockly.svgResize(workspace);
  textEditor.resize();
}



/**
 * this function gets called every time the run button is pressed.
 */
async function runTasks() {
  // console.log("runTasks");

  // TODO these four lines are in multiple places and should be a function
  clearOutput();
  clearErrors();
  stdOut.innerHTML = "";
  stdErr.innerHTML = "";

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

  if (configuration.embed) {
    const containerWidth = document.body.offsetWidth;
    const mouseX = e.pageX;
    const leftPaneWidth = (mouseX / containerWidth) * 100;
    const rightPaneWidth = 100 - leftPaneWidth;

    document.querySelector('.side-view').style.flex = rightPaneWidth;

    if (configuration.editor === 'blocks'){
      blockPane.style.flex = leftPaneWidth;
    } else if (configuration.editor === 'text') {
      document.querySelector('main').style.flex = leftPaneWidth;
    }

    Blockly.svgResize(workspace);

  } else {
    const containerWidth = document.querySelector('main').offsetWidth;
    const mouseX = e.pageX;
    const leftPaneWidth = (mouseX / containerWidth) * 100;
    const rightPaneWidth = 100 - leftPaneWidth;

    textPane.style.flex = leftPaneWidth;
    blockPane.style.flex = rightPaneWidth;

    Blockly.svgResize(workspace);
  }



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

function resizeHandlerSideEmbed(e) {
  const output = document.querySelector('.output');
  const vars = document.querySelector('#Variable-table-container');

  const containerHeight = document.querySelector('.side-view').clientHeight;
  const mouseY = e.pageY;
  const topHeight = (mouseY / containerHeight) * 100;
  const bottomHeight = 100 - topHeight;

  output.style.flex = topHeight;
  vars.style.flex = bottomHeight;

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

function debugSettings(value) {
  if (!value) {
    debugButton.style.display = 'none';
    stepButton.style.display = 'none';
    stopButton.style.display = 'none';
  } else {
    debugButton.style.display = 'inline-flex';
  }
}

function toggleEditor(value) {
  if (!value) { // blocks on
    blockPane.style.display = 'block';
    textPane.style.display = 'none';
  } else {
   // text on (default)
   blockPane.style.display = 'none';
   textPane.style.display = 'block';
  }

  Blockly.svgResize(workspace);
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
  } else {
    configuration.code = null;
  }

  // Configure according to the ?key1=value1&key2 parameters.
  parameters = new URLSearchParams(window.location.search);
  configuration.embed = window.location.pathname.includes("embed") || parameters.has('embed');
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
    // document.querySelector('header').style.display = 'none';
    // Embeds in the CodeVA Canvas are in high contrast.
    // Let's go with dark mode for the time being.
    // setDark();

    blockPane.style.display = 'none'
    debugSettings(false); // turn off debug for default embed
  }

  // buttons
  if (configuration.button === 'debug') {
    runButton.style.display = 'none';
    debugSettings(true);
  } else if (configuration.button === 'both') {
    runButton.style.display = 'inline-flex';
    debugSettings(true);
  }

  // editor
  if (configuration.editor === 'text'){
    toggleEditor(true);
  } else if (configuration.editor === 'blocks') {
    toggleEditor(false);
  }

  // use same font as text editor
  let style = window.getComputedStyle(textPane);
  let output = document.querySelector('.output');
  let vartab = document.querySelector('#Variable-table-container');
  output.style.fontFamily = style.fontFamily;
  vartab.style.fontFamily = style.fontFamily;
}

function initialize() {
  // We parse the configuration first because it influences the UI.
  parseUrlConfiguration();
  initializeGlobals();
  praxlyGenerator = makeGenerator();
  initializeBlockly();
  !embedMode && (darkmodediv.style.display = 'none');  // TODO remove or move div
  registerListeners();
  !embedMode && generateExamples(); // generate examples if its not in embed mode
  synchronizeToConfiguration();
}

initialize();
