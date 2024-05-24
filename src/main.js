import Blockly from 'blockly';
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

const runButton = document.getElementById('runButton');
const shareButton = document.getElementById('share');
const darkModeButton = document.getElementById('darkMode');
const settingsButton = document.getElementById("settings");
const infoButton = document.getElementById('info');
const manualButton = document.getElementById("reference");
const resizeBarX = document.querySelector('.resizeBarX');
const resizeBarY = document.querySelector('.resizeBarY');
const blockPane = document.querySelector('#blocklyDiv');
const textPane = document.querySelector('#aceCode');
const stdOut = document.querySelector('.stdout');
const stdErr = document.querySelector('.stderr');
const clearOut = document.querySelector('.clearOut');
const modal = document.getElementById("myModal");
const manual = document.getElementById("manual");
const featuresButton = document.getElementById('FeaturesButton');
const bugButton = document.getElementById("BugButton");
const changelogButton = document.getElementById('ChangelogButton');
const exampleDiv = document.getElementById('exampleTable');
const githubButton = document.getElementById('GitHubButton');
const peopleButton = document.getElementById('AboutButton');
const titleRefresh = document.getElementById('titleRefresh');
const bothButton = document.getElementById("tab1_button");
const textButton = document.getElementById('tab2_button');
const blocksButton = document.getElementById('tab3_button');
const bottomPart = document.getElementById('bottom-part');
const toolboxstylesheet = document.getElementById("ToolboxCss");
const span = document.getElementsByClassName("close")[0];
const darkmodediv = document.querySelector('.settingsOptions');

export let workspace;
let praxlyGenerator;
let mainTree;
let darkMode = false;
let live = true;
let isResizing = false;

function registerListeners() {
  runButton.addEventListener('click', runTasks);
  darkModeButton.addEventListener('click', () => { darkMode ? setLight() : setDark(); });
  clearOut.addEventListener('click', () => {
    clearOutput();
    clearErrors();
    stdOut.innerHTML = "";
    stdErr.innerHTML = "";
  });
  workspace.addChangeListener(turnBlocksToCode);
  textEditor.addEventListener("input", turnCodeToBLocks);

  //resizing things with the purple bar
  resizeBarX.addEventListener('mousedown', function (e) {
    isResizing = true;
    document.addEventListener('mousemove', resizeHandlerX);
  });

  resizeBarY.addEventListener('mousedown', function(e){
    isResizing = true;
    document.addEventListener('mousemove', resizeHandlerY);
  })

  document.addEventListener('mouseup', function (e) {
    isResizing = false;
    document.removeEventListener('mousemove', resizeHandlerX);
    Blockly.svgResize(workspace);
    textEditor.resize();
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
    workspace.removeChangeListener(turnBlocksToCode);
    workspace.addChangeListener(turnBlocksToCode);
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

  debugButton.addEventListener('mouseup', function() {
    // comingSoon();
    showDebug();
    setDebugMode(true);
    runTasks();
  });

  stopButton.addEventListener('click', function() {
    hideDebug();
    setDebugMode(false);
    setStepInto(false);
    stepButton.click();
  });

  stepIntoButton.addEventListener('mouseup', function() {
    // comingSoon();
    if (!getDebugMode()){
      endDebugPrompt();
    }
    setDebugMode(true);
    setStepInto(true);
  });

  stepButton.addEventListener('mouseup', function() {
    // comingSoon();
    if (!getDebugMode()){
      endDebugPrompt();
    }
    setDebugMode(true);
  });
}

function showBlocksOnly() {
  resizeBarX.style.display = 'none';
  textPane.style.display = 'none';
  blockPane.style.display = 'block';
  Blockly.svgResize(workspace);
  textEditor.resize();
}

function showTextOnly() {
  resizeBarX.style.display = 'none';
  blockPane.style.display = 'none';
  textPane.style.display = 'block';
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
  workspace.removeChangeListener(turnBlocksToCode);
  if (getDebugMode()){
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
}

function resizeHandlerY(e) {
  if (!isResizing) return;

  const mouseY = e.pageY;
  const main = document.querySelector('main').getBoundingClientRect();
  const topHeight = mouseY - main.top;

  document.querySelector('main').style.height = topHeight + 'px';
  document.querySelector('#bottom-part').style.height = 100% - (topHeight + 'px');

  const change = window.innerHeight - mouseY - 25 + '%'

  const output = document.querySelector('.output');
  output.style.height = change;

  const table = document.querySelector('#Variable-table-container');
  if (!table.classList.contains('hidden')) {
    table.style.height = change;
  }
}

function setDark() {
  darkMode = true;
  workspace.setTheme(PraxlyDark);
  textEditor.setTheme("ace/theme/twilight");
  // textEditor.setMode("ace/modes/java")
  // var bodyElement = document.body;
  // bodyElement.style.backgroundColor = "black";
  var elements = document.querySelectorAll(".output, #secondary_bar, example_links, #exampleTable");
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = "#303030";
    elements[i].style.color = "white";
  }
  toolboxstylesheet.href = "toolbox-dark.css";
}

function setLight() {
  darkMode = false;
  workspace.setTheme(praxlyDefaultTheme);
  textEditor.setTheme('ace/theme/katzenmilch');
  // var bodyElement = document.body;
  // bodyElement.style.backgroundColor = "white";
  var elements = document.querySelectorAll(".output, #secondary_bar, example_links, #exampleTable");
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = "#e3e6e4";
    elements[i].style.color = "black";
  }
  toolboxstylesheet.href = "toolbox-light.css";
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
  if (exitDebug){
    stopButton.click();
  }
}

function initializeBlockly() {
  workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolbox,
    // scrollbars: false,
    horizontalLayout: false,
    toolboxPosition: "start",
    theme: praxlyDefaultTheme,
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
  definePraxlyBlocks(workspace);
}

function parseUrlParameters() {
  // The URL may be of the form https://.../?key1=value1&key2#code=... The code
  // is provided as a fragment identifier (that is, succeeding #) because
  // fragment identifiers are not sent up to the web server. The code can get
  // quite long, and URLs sent to a server have a maximum length.

  // Load the code baked into the URL. It's necessarily text, not blocks.
  const hash = window.location.hash;
  const pattern = '#code=';
  if (hash.startsWith(pattern)) {
    let source = hash.substring(pattern.length);
    source = decodeURIComponent(source);
    textEditor.setValue(source, 1);
  }

  // Configure according to the ?key1=value1&key2 parameters.
  let parameters = new URLSearchParams(window.location.search);
  if (parameters.has('embed')) {
    document.body.classList.add('embed');
  }

  const editorMode = parameters.get('editor') ?? 'both';
  if (editorMode === 'text') {
    showTextOnly();
    textEditor.focus();
  } else if (editorMode === 'blocks') {
    showBlocksOnly();
  } else {
    showTextAndBlocks();
    textEditor.focus();
  }

  if (parameters.get('output') === 'false') {
    bottomPart.style.display = 'none';
  }
}

function initialize() {
  praxlyGenerator = makeGenerator();
  initializeBlockly();
  darkmodediv.style.display = 'none';
  registerListeners();
  generateExamples();
  parseUrlParameters();
}

initialize();
