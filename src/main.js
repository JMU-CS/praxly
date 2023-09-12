import Blockly from 'blockly';
import {praxlyDefaultTheme } from "./theme"
import { PraxlyDark } from './theme';
import {toolbox} from './toolbox';
import { addBlockErrors, annotationsBuffer, textEditor } from './lexer-parser';

import { tree2text } from './tree2text';
import {definePraxlyBlocks} from './newBlocks';
import { makeGenerator } from './generators';
import { blocks2tree } from './generators';
import { createExecutable } from './ast';
import { printBuffer } from './lexer-parser';
import { clearOutput } from './lexer-parser';
import ace from 'ace-builds';
import "ace-builds/src-min-noconflict/theme-twilight";
import "ace-builds/src-min-noconflict/theme-katzenmilch";
import { tree2blocks } from './tree2blocks';
import { errorOutput } from './lexer-parser';
import { text2tree } from './lexer-parser';
import { generateUrl, loadFromUrl } from './share';

// import { readFileSync } from 'fs';
import {codeText} from './examples';
// import { registerDefaultOptions } from 'blockly/core/contextmenu_items';


const praxlyGenerator = makeGenerator();
export const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
  // scrollbars: false,
  horizontalLayout: false,
  toolboxPosition: "start",
  theme: praxlyDefaultTheme,
  zoom:
         {controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
          pinch: true},

  renderer: 'zelos'
});


const runButton = document.getElementById('runButton');
const shareButton = document.getElementById('share');
const darkModeButton = document.getElementById('darkMode');
const helpButton = document.getElementById("help");
const manualButton = document.getElementById("reference");
const resizeBar = document.querySelector('.resizeBar');
const leftPane = document.querySelector('#blocklyDiv');
const rightPane = document.querySelector('#aceCode');
const stdOut = document.querySelector('.output');
var modal = document.getElementById("myModal");
var manual = document.getElementById("manual");
const featuresButton = document.getElementById('FeaturesButton');
const bugButton = document.getElementById("BugButton");
const changelogButton = document.getElementById('ChangelogButton');
const exampleDiv = document.getElementById('exampleTable');
const editorElement = textEditor.container;
const githubButton = document.getElementById('GitHubButton');
const BenButton = document.getElementById('AboutButton');

var mainTree = null;
let darkMode = false;
let live = true;
let isResizing = false;

runButton.addEventListener('mouseup', runTasks);
darkModeButton.addEventListener('click', ()=> {darkMode ? setLight() : setDark();});
definePraxlyBlocks(workspace);
// blockUpdatesButton.innerText = 'block updates: live ';
workspace.addChangeListener( turnBlocksToCode); 
textEditor.addEventListener("input", turnCodeToBLocks);

//resizing things with the purple bar
resizeBar.addEventListener('mousedown', function(e) {
  isResizing = true;
  document.addEventListener('mousemove', resizeHandler);
});
document.addEventListener('mouseup', function(e) {
  isResizing = false;
  document.removeEventListener('mousemove', resizeHandler);
  Blockly.svgResize(workspace);
  textEditor.resize();
});
manualButton.addEventListener('click', function() {
  var linkUrl = 'pseudocode.html';
  window.open(linkUrl, '_blank');
});
bugButton.addEventListener('click', function(){
  window.open("BugsList.html", '_blank');
});
changelogButton.addEventListener('click', function(){
  window.open("changelog.html", '_blank');
});
featuresButton.addEventListener('click', function(){
  window.open("features.html", '_blank');
});
githubButton.addEventListener('click', function(){
  window.open("https://github.com/Praxly/praxly.github.io", '_blank');
});
BenButton.addEventListener('click', function() {
  window.open('https://sauppb.github.io/website/');
});


// these make it so that the blocks and text take turns. 
leftPane.addEventListener('click', () => {
  workspace.removeChangeListener(turnBlocksToCode); 
  workspace.addChangeListener( turnBlocksToCode);
});
rightPane.addEventListener('click', () => {
  textEditor.removeEventListener("input", turnCodeToBLocks);
  textEditor.addEventListener("input", turnCodeToBLocks);
});


var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
helpButton.onclick = function() {
  setLight();
  modal.style.display = "block";
}

manualButton.onclick = function() {
  manual.style.display = "block";
}


// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
  manual.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal || event.target == manual) {
    modal.style.display = "none";
    manual.style.display = "none";
  }
}




function runTasks() {
  clearOutput();
  // mainTree = blocks2tree(workspace, praxlyGenerator);
  if (mainTree === null){
    alert('there is nothing to run :( \n try typing some code or dragging some blocks first.');
  }
  console.log(mainTree);
  const executable = createExecutable(mainTree);
  console.log(executable);
  executable.evaluate();
  if (errorOutput.length > 0){
    stdOut.innerHTML = errorOutput;
    stdOut.style.color = '#ff0000';
  } else{
    stdOut.innerHTML = printBuffer;
    stdOut.style.color = darkMode ? '#FFFFFF': '#000000';

    
  }

  // stdError.innerHTML = errorOutput;
  textEditor.session.setAnnotations(annotationsBuffer);
  //might have to remove
  addBlockErrors(workspace);
}



// this function gets called every time a charater is typed in the editor.
// export const turnCodeToBLocks = () => {
  
//   // console.log("ace has the lock");
//   workspace.removeChangeListener(turnBlocksToCode); 
//   clearOutput();
//   mainTree = text2tree();
//   workspace.clear();
//   tree2blocks(workspace, mainTree);
//   workspace.render();
//   stdError.innerHTML = errorOutput;

// }

export function turnCodeToBLocks (){
  
  // console.log("ace has the lock");
  workspace.removeChangeListener(turnBlocksToCode); 
  clearOutput();
  mainTree = text2tree();
  workspace.clear();
  tree2blocks(workspace, mainTree);
  workspace.render();
  // stdError.innerHTML = errorOutput;
  textEditor.session.setAnnotations(annotationsBuffer);
  addBlockErrors(workspace);
}


function turnBlocksToCode() {
  
  // console.log("blockly has the lock");
  textEditor.removeEventListener("input", turnCodeToBLocks);
  // clearOutput();
  
  mainTree = blocks2tree(workspace, praxlyGenerator);
  console.log(mainTree);
  const text = tree2text(mainTree, 0, 0);
  
  textEditor.setValue(text, -1);
  // stdError.innerHTML = errorOutput;
  
};


// this function gets called whenever the blocks are modified. 
// let turnBlocksToCode = () => {

//   // console.log("blockly has the lock");
//   textEditor.removeEventListener("input", turnCodeToBLocks);
//   // clearOutput();

//   mainTree = blocks2tree(workspace, praxlyGenerator);
//   console.log(mainTree);
//   const text = tree2text(mainTree, 0, 0);

//   textEditor.setValue(text, -1);
//   stdError.innerHTML = errorOutput;
  
// };





function resizeHandler(e) {
  if (!isResizing) return;

  const containerWidth = document.querySelector('main').offsetWidth;
  const mouseX = e.pageX;
  const leftPaneWidth = (mouseX / containerWidth) * 100;
  const rightPaneWidth = 100 - leftPaneWidth;

  leftPane.style.flex = leftPaneWidth;
  rightPane.style.flex = rightPaneWidth;
}
var toolboxstylesheet = document.getElementById("ToolboxCss");

function setDark(){
  darkMode = true;
  workspace.setTheme(PraxlyDark);
  textEditor.setTheme("ace/theme/twilight");
  // textEditor.setMode("ace/modes/java")
  var bodyElement = document.body;
  // bodyElement.style.backgroundColor = "black";
  var elements = document.querySelectorAll(".output, .error, #secondary_bar, example_links, #exampleTable");
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = "#303030";
    elements[i].style.color = "white";
  }
  toolboxstylesheet.href = "darkThemeToolbox.css";
}

function setLight(){
  darkMode = false;
  workspace.setTheme(praxlyDefaultTheme);
  textEditor.setTheme('ace/theme/katzenmilch');
  var bodyElement = document.body;
  // bodyElement.style.backgroundColor = "white";
  var elements = document.querySelectorAll(".output, .error, #secondary_bar, example_links, #exampleTable");
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = "#e3e6e4";
    elements[i].style.color = "black";
  }
  toolboxstylesheet.href = "toolbox.css";
}







// blockUpdatesButton.addEventListener('click', () => {
  
//   if (!live){
//     runButton.removeEventListener('mousedown', turnCodeToBLocks);
//     blockUpdatesButton.innerText = 'block updates: live ';
//     workspace.addChangeListener( turnBlocksToCode);
//     textEditor.addEventListener("input", turnCodeToBLocks);
//     live = true;
//   } else {
//     blockUpdatesButton.innerText = 'block updates: on run (not implimented yet)';
//     workspace.removeChangeListener(turnBlocksToCode);
//     textEditor.removeEventListener("input", turnCodeToBLocks);
//     runButton.addEventListener('mousedown', turnCodeToBLocks);
//     live = false;
//   }
// });





// Attach a keydown event listener to the editor's DOM element
editorElement.addEventListener("keydown", function(event) {
  // Check if the event key is 's' and Ctrl or Command key is pressed
  if ((event.key === 's' || event.key === 'S') && (event.ctrlKey || event.metaKey)) {
    // Prevent the default save action (e.g., opening the save dialog)
    event.preventDefault();
    const output = document.querySelector('.output');
    // const error = document.querySelector('.error');
    output.innerHTML = "";

    const trees = createExecutable(mainTree);
    trees.evaluate();

      
    output.innerHTML = printBuffer;
    stdError.innerHTML = errorOutput;

    console.log(trees);
    
    
  }
});

//share button 
shareButton.addEventListener('click', generateUrl);

loadFromUrl(turnCodeToBLocks);



function openCity(evt, cityName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
} 

const bothButton = document.getElementById("tab1_button");
const textButton = document.getElementById('tab2_button');
const blocksButton = document.getElementById('tab3_button');
blocksButton.addEventListener('click', function(event){
  resizeBar.style.display = 'none';
  rightPane.style.display = 'none';
  leftPane.style.display = 'block';
  Blockly.svgResize(workspace);
  textEditor.resize();
  // openCity(event, 'London');
});
textButton.addEventListener('click', function(event){
  resizeBar.style.display = 'none';
  leftPane.style.display = 'none';
  rightPane.style.display = 'block';
  Blockly.svgResize(workspace);
  textEditor.resize();
  // openCity(event, 'Paris');
});
bothButton.addEventListener('click', function(event){
  // openCity(event, 'Tokyo');
  resizeBar.style.display = 'block';
  leftPane.style.display = 'block';
  rightPane.style.display = 'block';
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
    newButton.addEventListener('click', function(){
      generateUrl();
      applyExample(label);
    });
    exampleDiv.appendChild(newButton);    

    const value = dataArray[i + 1].trim();
    result[label] = value;
  }

  return result;
}
let examples = GenerateExamples();
console.log(`the examples are: ${Object.keys(examples)}`);

function applyExample (exampleName){
  // append the example to the code
  textEditor.setValue(examples[exampleName], -1);
}


