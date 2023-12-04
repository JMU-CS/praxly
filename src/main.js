import Blockly from 'blockly';
import { praxlyDefaultTheme } from "./theme"
import { PraxlyDark } from './theme';
import { toolbox } from './toolbox';

// import {textEditor } from './lexer-parser';
import { tree2text } from './tree2text';
import { definePraxlyBlocks } from './newBlocks';
import { makeGenerator } from './generators';
import { blocks2tree } from './generators';
import { createExecutable } from './ast';

// import ace from 'ace-builds';
import "ace-builds/src-min-noconflict/theme-twilight";
import "ace-builds/src-min-noconflict/theme-katzenmilch";
import { tree2blocks } from './tree2blocks';
// import { errorOutput } from './lexer-parser';
import { text2tree } from './lexer-parser';
import { generateUrl, loadFromUrl } from './share';

// import { readFileSync } from 'fs';
import { codeText } from './examples';
import { addBlockErrors, annotationsBuffer, clearErrors, clearOutput, defaultError, errorOutput, printBuffer, textEditor } from './common';

const praxlyGenerator = makeGenerator();
export const workspace = Blockly.inject('blocklyDiv', {
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

const runButton = document.getElementById('runButton');
const shareButton = document.getElementById('share');
const darkModeButton = document.getElementById('darkMode');
const helpButton = document.getElementById("help");
const manualButton = document.getElementById("reference");
const resizeBar = document.querySelector('.resizeBar');
const blockPane = document.querySelector('#blocklyDiv');
const textPane = document.querySelector('#aceCode');
const stdOut = document.querySelector('.stdout');
const stdErr = document.querySelector('.stderr');
const clearOut = document.querySelector('.clearOut');
var modal = document.getElementById("myModal");
var manual = document.getElementById("manual");
const featuresButton = document.getElementById('FeaturesButton');
const bugButton = document.getElementById("BugButton");
const changelogButton = document.getElementById('ChangelogButton');
const exampleDiv = document.getElementById('exampleTable');
const githubButton = document.getElementById('GitHubButton');
const BenButton = document.getElementById('AboutButton');
const titleRefresh = document.getElementById('titleRefresh');

var mainTree = null;
let darkMode = false;
let live = true;
let isResizing = false;

runButton.addEventListener('mouseup', runTasks);
darkModeButton.addEventListener('click', () => { darkMode ? setLight() : setDark(); });
clearOut.addEventListener('click', () => {
  clearOutput();
  clearErrors();
  stdOut.innerHTML = "";
  stdErr.innerHTML = "";
});
definePraxlyBlocks(workspace);

// blockUpdatesButton.innerText = 'block updates: live ';
workspace.addChangeListener(turnBlocksToCode);
textEditor.addEventListener("input", turnCodeToBLocks);

//resizing things with the purple bar
resizeBar.addEventListener('mousedown', function (e) {
  isResizing = true;
  document.addEventListener('mousemove', resizeHandler);
});

document.addEventListener('mouseup', function (e) {
  isResizing = false;
  document.removeEventListener('mousemove', resizeHandler);
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

BenButton.addEventListener('click', function () {
  window.open('https://sauppb.github.io/website/');
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

var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
helpButton.onclick = function () {
  setLight();
  modal.style.display = "block";
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

/**
 * this function gets called every time the run button is pressed.
 */
function runTasks() {
  console.log(mainTree);
  if (!textEditor.getValue().trim()) {
    alert('there is nothing to run :( \n try typing some code or dragging some blocks first.');
    return;
  }
  const executable = createExecutable(mainTree);
  // console.info('here is the executable');
  // console.log(executable);
  try {
    executable.evaluate();
  } catch (error) {
    // if not previously handled (by PraxlyError)
    if (!errorOutput) {
      defaultError(error);
      console.error(error.message);
    }
  }
  stdOut.innerHTML = printBuffer;
  stdErr.innerHTML = errorOutput;
  if (errorOutput) {
    textEditor.session.setAnnotations(annotationsBuffer);
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
  clearOutput();
  clearErrors();
  mainTree = text2tree();
  workspace.clear();
  tree2blocks(workspace, mainTree);
  workspace.render();
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

function resizeHandler(e) {
  if (!isResizing) return;

  const containerWidth = document.querySelector('main').offsetWidth;
  const mouseX = e.pageX;
  const leftPaneWidth = (mouseX / containerWidth) * 100;
  const rightPaneWidth = 100 - leftPaneWidth;

  textPane.style.flex = leftPaneWidth;
  blockPane.style.flex = rightPaneWidth;
}

var toolboxstylesheet = document.getElementById("ToolboxCss");

function setDark() {
  darkMode = true;
  workspace.setTheme(PraxlyDark);
  textEditor.setTheme("ace/theme/twilight");
  // textEditor.setMode("ace/modes/java")
  var bodyElement = document.body;
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
  var bodyElement = document.body;
  // bodyElement.style.backgroundColor = "white";
  var elements = document.querySelectorAll(".output, #secondary_bar, example_links, #exampleTable");
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = "#e3e6e4";
    elements[i].style.color = "black";
  }
  toolboxstylesheet.href = "toolbox-light.css";
}

// this is how you add custom keybinds!
document.addEventListener("keydown", function (event) {
  // Check if the event key is 's' and Ctrl or Command key is pressed
  if ((event.key === 's' || event.key === 'S') && (event.ctrlKey || event.metaKey) || event.key === 'F5') {
    // Prevent the default save action (e.g., opening the save dialog, reloading the page)
    event.preventDefault();
    runTasks();
    // clearOutput();
    // clearErrors();
    // const trees = createExecutable(mainTree);
    // trees.evaluate();
    // stdOut.innerHTML = printBuffer;
    // stdErr.innerHTML = errorOutput;
    // console.log(trees);
  }
});

//share button
shareButton.addEventListener('click', generateUrl);

const bothButton = document.getElementById("tab1_button");
const textButton = document.getElementById('tab2_button');
const blocksButton = document.getElementById('tab3_button');
blocksButton.addEventListener('click', function (event) {
  resizeBar.style.display = 'none';
  textPane.style.display = 'none';
  blockPane.style.display = 'block';
  Blockly.svgResize(workspace);
  textEditor.resize();
});
textButton.addEventListener('click', function (event) {
  resizeBar.style.display = 'none';
  blockPane.style.display = 'none';
  textPane.style.display = 'block';
  Blockly.svgResize(workspace);
  textEditor.resize();
});
bothButton.addEventListener('click', function (event) {
  resizeBar.style.display = 'block';
  blockPane.style.display = 'block';
  textPane.style.display = 'block';
  Blockly.svgResize(workspace);
  textEditor.resize();
});
bothButton.click();

function GenerateExamples() {
  const dataArray = codeText.split('##');
  const result = {};

  for (let i = 1; i < dataArray.length - 1; i += 2) {
    const label = dataArray[i].trim();
    var newButton = document.createElement("button");
    newButton.textContent = label;
    newButton.classList.add("example_links");
    newButton.addEventListener('click', function () {
      // generateUrl();
      applyExample(label);
    });
    exampleDiv.appendChild(newButton);

    const value = dataArray[i + 1].trim();
    result[label] = value + "\n";
  }

  return result;
}

let examples = GenerateExamples();
// console.log(`the examples are: ${Object.keys(examples)}`);

function applyExample(exampleName) {
  // append the example to the code
  textEditor.setValue(examples[exampleName], -1);
  textPane.click();
}

document.addEventListener('DOMContentLoaded', function() {
  loadFromUrl();
  textEditor.focus();
});
