import { getStepInto, isPrimative, setStepInto, stepButton, stepIntoButton, stopButton } from "./common";
import { embedMode, parameters } from "./main";

export function showDebug() {
    let debugOptions = document.querySelectorAll('.debugOptions');
    let debugButton = document.getElementById('debug') ?? document.getElementById('DebugButton');
    // let variableTableContainer = document.getElementById('Variable-table-container');
    // variableTableContainer.style.display = 'block';
    for (let button of debugOptions) {
        button.style.display = 'block';
    }
    debugButton.style.display = 'none';
    document.querySelector('#runButton').style.display = 'none';
}

export function hideDebug() {
    let debugOptions = document.querySelectorAll('.debugOptions');
    let debug = document.getElementById('debug') ?? document.getElementById('DebugButton');
    let variableTableContainer = document.getElementById('Variable-table-container');
    for (let button of debugOptions) {
        button.style.display = 'none';
    }
    if (!embedMode) {
        document.querySelector('#runButton').style.display = 'block';
    } else if (embedMode && (parameters.get('button') === 'both')){
        document.querySelector('#runButton').style.display = 'block';
    }
    debug.style.display = 'block';
    // variableTableContainer.style.display = 'none';


}


/**
 * this is a function that Dr. Johnson made to show me how promises worked.
 */
export function waitForStep() {
    return new Promise(resolve => {
        const listener = () => {
            stepButton.removeEventListener('click', listener);
            resolve();
        };
        stepButton.addEventListener('click', listener);
    });
}


/**
 * this is a future idea for a slowed down version of running the code.
 * @returns
 */
export function waitForTimer() {
    return new Promise(resolve => {
        setTimeout(resolve, 3000);
    });
}


// aynchronousness is like an infectious disease.
export async function generateVariableTable(environment, level) {
    let stepIn = getStepInto();
    setStepInto(false);
    let table = document.getElementById('Variable-table');
    if (level == 1) {
        table.innerHTML = "";
    }
    let parent = environment.parent;
    const variableList = environment.variableList;
    // console.error(variableList);
    for (const key in variableList) {
        if (Object.hasOwnProperty.call(variableList, key)) {
            const value = variableList[key];
            const newRow = document.createElement("tr");
            const attributeCell = document.createElement("td");
            attributeCell.textContent = key;
            const valueCell = document.createElement("td");
            const typeCell = document.createElement("td");
            typeCell.textContent = value.realType;

            let valueEvaluated = await value.evaluate(environment);
            valueCell.textContent = valueEvaluated.value;
            const locationCell = document.createElement("td");
            locationCell.textContent = environment.name;
            newRow.appendChild(attributeCell);
            newRow.appendChild(typeCell);
            newRow.appendChild(valueCell);
            newRow.appendChild(locationCell);
            table.appendChild(newRow);
        }
    }
    if (parent !== 'root') {
        generateVariableTable(parent, level + 1);
    }
    setStepInto(stepIn);

}
