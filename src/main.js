import Blockly, { Block } from 'blockly';
import { praxlyDefaultTheme } from "./theme"
import { PraxlyDark } from './theme';
import { toolbox } from './toolbox';

import { tree2text } from './tree2text';
import { definePraxlyBlocks } from './newBlocks';
import { makeGenerator } from './blocks2tree';
import { blocks2tree } from './blocks2tree';
import { createExecutable } from './ast';

import "ace-builds/src-min-noconflict/theme-dracula";
import "ace-builds/src-min-noconflict/theme-katzenmilch";
import { tree2blocks } from './tree2blocks';
import { text2tree } from './text2tree';
import { generateUrl, loadFromUrl } from './share';

import { codeText } from './examples';
import { DEV_LOG, debugButton, addBlockErrors, annotationsBuffer, clearErrors, clearOutput, defaultError, errorOutput, getDebugMode, setDebugMode, setStepInto, stepButton, stepIntoButton, stopButton, textEditor, setStopClicked } from './common';
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

let examples;
let titleRefresh;
let bottomPart;
let darkmodediv;

let resizeBarBott;
let resizeSideInEmbed;
let toggleText, toggleBlocks, toggleOutput, toggleVars;
let clearButton;
let varContainer;
let varTable;
let output;
let main;
let resetButton;
let debugModal;
let yesButton;
let noButton;
let openWindowButton;

// make sure this works fine in gui
export let configuration = {};  // see parseUrlConfiguration()

export let workspace;
let praxlyGenerator;
let mainTree;
let darkMode = true;
let isResizingHoriz = false;
let isResizingVert = false;
export let parameters;

function initializeGlobals() {
  if (!configuration.embed) {
    darkModeButton = document.getElementById('darkMode');
    settingsButton = document.getElementById("settings");
    examples = document.getElementById('examplesButton');
    titleRefresh = document.getElementById('titleRefresh');
    darkmodediv = document.querySelector('.settingsOptions');
    toggleText = document.querySelector('#toggle-text');
    toggleBlocks = document.querySelector('#toggle-blocks');
    toggleOutput = document.querySelector('#toggle-output');
    toggleVars = document.querySelector('#toggle-vars');
    clearButton = document.querySelector('#clearButton');
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
  bottomPart = document.getElementById('bottom-part');
  resizeBarBott = document.querySelector('.resizeBarBott');
  resizeSideInEmbed = document.querySelector('.resize-side-view');
  varContainer = document.querySelector('#Variable-table-container');
  varTable = document.querySelector('#Variable-table');
  output = document.querySelector('.output');
  main = document.querySelector('main');
  resetButton = document.querySelector('#resetButton');
  debugModal = document.querySelector('.debugModal');
  yesButton = document.querySelector('#yes');
  noButton = document.querySelector('#no');
  openWindowButton = document.querySelector('#newWindow');

}

function registerListeners() {
  if (!configuration.embed) { // if embed mode is not on, add usual listeners
    darkModeButton.addEventListener('click', () => { darkMode ? setLight() : setDark(); });
    manualButton.addEventListener('click', function () {
      var linkUrl = 'pseudocode.html';
      window.open(linkUrl, '_blank');
    });

    clearButton.addEventListener('click', clear);

    titleRefresh.addEventListener('click', function () {
      clear();
      window.location.hash = '';
      textEditor.setValue('', -1);
      textPane.click();
      textEditor.focus();
    });

    settingsButton.onclick = function () {
      let darkmodediv = document.querySelector('.settingsOptions');
      if (darkmodediv.style.display === 'none') {
        darkmodediv.style.display = ''; // Show the button
      } else {
        darkmodediv.style.display = 'none'; // Hide the button
      }
    }

    //share button
    shareButton.addEventListener('click', generateUrl);

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
      isResizingHoriz = true;
      document.addEventListener('mousemove', resizeHandler);
    });

    document.addEventListener('mouseup', function (e) {
      isResizingVert = false;
      document.removeEventListener('mousemove', resizeHandler);
    });

    examples.addEventListener('click', function () {
      document.querySelector('.exampleModal').style.display = 'flex';
    });

    document.querySelector('.close').addEventListener('click', function () {
      document.querySelector('.exampleModal').style.display = 'none';
    });
  } else {
    resizeSideInEmbed.addEventListener('mousedown', function (e) {
      isResizingVert = true;
      document.addEventListener('mousemove', resizeHandler);
    });

    document.addEventListener('mouseup', function (e) {
      isResizingVert = false;
      document.removeEventListener('mousemove', resizeHandler);
    });

    resetButton.addEventListener('click', showDebugModal);
    openWindowButton.addEventListener('click', openInPraxly);
  }

  runButton.addEventListener('click', runTasks);
  clearOut.addEventListener('click', clear);
  workspace.addChangeListener(onBlocklyChange);
  textEditor.addEventListener("input", turnCodeToBLocks);

  //resizing things with the purple bar
  resizeBarX.addEventListener('mousedown', function (e) {
    isResizingHoriz = true;
    document.addEventListener('mousemove', resizeHandler);
  });

  resizeBarY.addEventListener('mousedown', function (e) {
    isResizingVert = true;
    document.addEventListener('mousemove', resizeHandler);
  })



  document.addEventListener('mouseup', function (e) {
    isResizingHoriz = false;
    document.removeEventListener('mousemove', resizeHandler);
    Blockly.svgResize(workspace);
    textEditor.resize();
  });

  document.addEventListener('mouseup', function (e) {
    isResizingVert = false;
    document.removeEventListener('mousemove', resizeHandler);
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
    setStopClicked(false);
    showDebug();
    setDebugMode(true);
    runTasks();
  });

  stopButton.addEventListener('click', function () {
    setStopClicked(true);
    hideDebug(configuration);
    setDebugMode(false);
    setStepInto(false);
    stepButton.click();  // in case awaiting
  });


  //   stepButton.addEventListener('mouseup', function () {
  //     // comingSoon();
  //     if (!getDebugMode()) {
  //       endDebugPrompt();
  //     }
  //     setDebugMode(true);
  //   });

}


let isTextOn = true;
function toggleTextOn() {
  isTextOn = !isTextOn;

  if (isTextOn) {
    textPane.style.display = 'block';
    resizeBarX.style.display = 'block';
    toggleText.style.backgroundColor = 'white';
    document.querySelector('#text-tip').innerHTML = "Text On";
  } else {
    textPane.style.display = 'none';
    resizeBarX.style.display = 'none';
    Blockly.svgResize(workspace);
    toggleText.style.backgroundColor = 'black';
    document.querySelector('#text-tip').innerHTML = "Text Off";
  }
}



let isBlocksOn = true;
function toggleBlocksOn() {
  isBlocksOn = !isBlocksOn;

  if (isBlocksOn) {
    blockPane.style.display = 'block';
    resizeBarX.style.display = 'block';
    Blockly.svgResize(workspace);
    toggleBlocks.style.backgroundColor = 'white';
    document.querySelector('#blocks-tip').innerHTML = "Blocks On";
  } else {
    blockPane.style.display = 'none';
    resizeBarX.style.display = 'none';
    Blockly.svgResize(workspace);
    textEditor.resize();
    toggleBlocks.style.backgroundColor = 'black';
    document.querySelector('#blocks-tip').innerHTML = "Blocks Off";
  }
}

let isOutputOn = true;
function toggleOutputOn() {
  isOutputOn = !isOutputOn;

  output.style.display = isOutputOn ? 'block' : 'none';
  document.querySelector('#output-tip').innerHTML = isOutputOn ? "Output On" : "Output Off";
  resizeBarBott.style.display = isOutputOn ? 'block' : 'none';
  toggleOutput.style.backgroundColor = isOutputOn ? 'white' : 'black';
  isBottomOff();
}

let isVarsOn = true;
function toggleVarsOn() {
  isVarsOn = !isVarsOn;

  varContainer.style.display = isVarsOn ? 'block' : 'none';
  document.querySelector('#vars-tip').innerHTML = isVarsOn ? "Variables On" : "Variables Off";
  resizeBarBott.style.display = isVarsOn ? 'block' : 'none';
  toggleVars.style.backgroundColor = isVarsOn ? 'white' : 'black';
  isBottomOff();
}

function isBottomOff() {

  if (varContainer.style.display === 'none' && output.style.display === 'none') {
    resizeBarY.style.display = 'none';
    bottomPart.style.display = 'none';
    Blockly.svgResize(workspace);
    textEditor.resize();
  } else {
    resizeBarY.style.display = 'block';
    bottomPart.style.display = 'flex';
  }
}


function generateTable() {
  const exampleData = codeText.split('##');
  for (let i = 1; i < exampleData.length - 1; i +=2) {
    const newRow = document.createElement("tr");
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = exampleData[i];
    link.addEventListener('click', function () {
      textEditor.setValue(exampleData[i + 1], -1);
      textPane.click();
      document.querySelector('.exampleModal').style.display = 'none';
    });
    link.classList.add('example_links');
    const nameCell = document.createElement("td");
    nameCell.appendChild(link);
    const difficultyCell = document.createElement("td");
    difficultyCell.textContent = "N/A";
    const topicsCell = document.createElement("td");
    topicsCell.textContent = "N/A";

    newRow.appendChild(nameCell);
    newRow.appendChild(difficultyCell);
    newRow.appendChild(topicsCell);

    document.querySelector('.examplesTable').appendChild(newRow);
  }
}

function clear() {
  clearOutput();
  clearErrors();
  // stdOut.innerHTML = "";
  stdErr.innerHTML = "";
  varTable.innerHTML = "";
}

function showDebugModal() {
  debugModal.style.display = 'flex';

  yesButton.addEventListener('click', function () {
    debugModal.style.display = 'none';
    reset();
  });

  noButton.addEventListener('click', function () {
    debugModal.style.display = 'none';
  })
}

const originalUrl = window.location.href;

function reset() {
  if (getDebugMode()) {
    stopButton.click();
    clear(); // clear output/vars
  } else {
    // see if the current URL is different from the original URL
    if (window.location.href !== originalUrl) {
      window.location.href = originalUrl;
    } else {
      textEditor.setValue(configuration.code, 1); // reload the page if the URL hasn't changed
      clear();
    }
  }
}

function openInPraxly() {
  const params = window.location.search;
  const hashcode = window.location.hash;
  window.open('main.html' + params + hashcode, '_blank');
}

/**
 * this function gets called every time the run button is pressed.
 */
async function runTasks() {
  // console.log("runTasks");
  clear();
  try {
    // compile/run only if not blank
    if (textEditor.getValue().trim()) {
      const executable = createExecutable(mainTree);
      await executable.evaluate();
    }
  } catch (error) {
    if (error.message === "Stop_Debug") {
      // special case: abort running (not an error)
      reset();
      // exit debug, clear output/vars, restart debugger
    } else if (!errorOutput) {
      // if not previously handled (by PraxlyError)
      defaultError(error);
      console.error(error);
    }
  }
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
    stopButton.click();
  }
  // TODO: See note in turnBlocksToCode.
  // clearOutput();
  // clearErrors();
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
  // TODO: the console has been getting cleared too often. When the program is
  // run, it'd clear in runTasks. Then again in turnCodeToBLocks. Then again
  // here, wiping away the output. Surely something is overeager here, but I'm
  // not sure what.
  // clearOutput();
  // clearErrors();
  mainTree = blocks2tree(workspace, praxlyGenerator);
  // console.info("here is the tree generated by the blocks:");
  // console.debug(mainTree);
  const text = tree2text(mainTree, 0, 0);
  textEditor.setValue(text, -1);
};


function resizeHandler(e) {
  if (isResizingHoriz) {
    if (configuration.embed) {
      const containerWidth = document.body.offsetWidth;
      const mouseX = e.pageX;
      const leftPaneWidth = (mouseX / containerWidth) * 100;
      const rightPaneWidth = 100 - leftPaneWidth;

      document.querySelector('.side-view').style.flex = rightPaneWidth;

      if (configuration.editor === 'blocks') {
        blockPane.style.flex = leftPaneWidth;
      } else if (configuration.editor === 'text') {
        main.style.flex = leftPaneWidth;
      }

    } else {
      const containerWidth = main.offsetWidth;
      const mouseX = e.pageX;
      const leftPaneWidth = (mouseX / containerWidth) * 100;
      const rightPaneWidth = 100 - leftPaneWidth;

      textPane.style.flex = leftPaneWidth;
      blockPane.style.flex = rightPaneWidth;
      output.style.flex = leftPaneWidth;
      varContainer.style.flex = rightPaneWidth;
    }

  } else if (isResizingVert) {

    if (configuration.embed) {
      const containerHeight = document.querySelector('.side-view').clientHeight;
      const mouseY = e.pageY;
      const topHeight = (mouseY / containerHeight) * 100;
      const bottomHeight = 100 - topHeight;

      output.style.flex = topHeight;
      varContainer.style.flex = bottomHeight;
    } else {
      const containerHeight = document.body.clientHeight;
      const mouseY = e.pageY;
      const topHeight = (mouseY / containerHeight) * 100;
      const bottomHeight = 100 - topHeight;

      main.style.flex = topHeight + '%';
      bottomPart.style.flex = bottomHeight + '%';
    }

  }

  Blockly.svgResize(workspace);
}

function setDark() {
  darkMode = true;
  workspace.setTheme(PraxlyDark);
  textEditor.setTheme("ace/theme/dracula");

  document.body.classList.toggle('light-mode', false);
}

function setLight() {
  darkMode = false;
  workspace.setTheme(praxlyDefaultTheme);
  textEditor.setTheme('ace/theme/katzenmilch');

  document.body.classList.toggle('light-mode');
}

function toggleEditor(value) {
  if (value) {
    // text on (default)
    blockPane.style.display = 'none';
    textPane.style.display = 'block';

    // add toggle change
    if (configuration.main) {
      isTextOn = false;
      toggleTextOn();
      resizeBarX.style.display = 'none';
      isBlocksOn = true;
      toggleBlocksOn();
    }
  } else {
    // blocks on
    blockPane.style.display = 'block';
    textPane.style.display = 'none';

    // add toggle change
    if (configuration.main) {
      isBlocksOn = false;
      toggleBlocksOn();
      configuration.main ? resizeBarX.style.display = 'none' : null;
      isTextOn = true;
      toggleTextOn();
    }
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
  darkMode ? textEditor.setTheme("ace/theme/dracula") : textEditor.setTheme('ace/theme/katzenmilch');
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
  configuration.embed = window.location.pathname.includes("embed");
  configuration.main = window.location.pathname.includes("main");
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
  stepButton.style.display = 'none';
  stopButton.style.display = 'none';

  // buttons
  if (configuration.button === 'both') {
    runButton.style.display = 'inline-flex';
    debugButton.style.display = 'inline-flex';
  } else if (configuration.button === 'debug') {
    runButton.style.display = 'none';
    debugButton.style.display = 'inline-flex';
  } else {
    runButton.style.display = 'inline-flex';
    debugButton.style.display = 'none';
  }

  // editors
  if (configuration.editor === 'both') {
    // showTextAndBlocks();
  } else if (configuration.editor === 'blocks') {
    toggleEditor(false);
  } else {
    toggleEditor(true);
  }

  // result
  if (configuration.result === 'both') {
    output.style.display = 'block';
    varContainer.style.display = 'block'
    resizeSideInEmbed ? resizeSideInEmbed.style.display = 'flex' : null;
  } else if (configuration.result === 'vars') {
    output.style.display = 'none';
    varContainer.style.display = 'block'
    resizeSideInEmbed ? resizeSideInEmbed.style.display = 'none' : null;
    configuration.main ? resizeBarBott.style.display = 'none' : null;
  } else {
    output.style.display = 'block';
    varContainer.style.display = 'none'
    resizeSideInEmbed ? resizeSideInEmbed.style.display = 'none' : null;
    configuration.main ? resizeBarBott.style.display = 'none' : null;
  }
  // use same font as text editor
  let style = window.getComputedStyle(textPane);
  output.style.fontFamily = style.fontFamily;
  varContainer.style.fontFamily = style.fontFamily;
}

function initialize() {
  // We parse the configuration first because it influences the UI.
  parseUrlConfiguration();
  initializeGlobals();
  praxlyGenerator = makeGenerator();
  initializeBlockly();
  !configuration.embed && (darkmodediv.style.display = 'none');  // TODO remove or move div
  registerListeners();
  !configuration.embed && generateTable();
  synchronizeToConfiguration();
}

initialize();
