import { valueToString } from "./ast";
import { getStepInto, setStepInto, stepButton } from "./common";


export function showDebug() {
    let debugOptions = document.querySelectorAll('.debugOptions');
    let runButton = document.getElementById('runButton');
    let debugButton = document.getElementById('debugButton');

    for (let button of debugOptions) {
        button.style.display = 'inline-flex';
    }
    runButton.style.display = 'none';
    debugButton.style.display = 'none';
}

export function hideDebug(configuration) {
    let debugOptions = document.querySelectorAll('.debugOptions');
    let runButton = document.getElementById('runButton');
    let debug = document.getElementById('debugButton');

    for (let button of debugOptions) {
        button.style.display = 'none';
    }
    if (!configuration.embed || configuration.button !== 'debug') {
        runButton.style.display = 'inline-flex';
    }
    debug.style.display = 'inline-flex';
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
            valueCell.textContent = valueToString(valueEvaluated, true, value.json?.line);

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
        await generateVariableTable(parent, level + 1);
    }
    setStepInto(stepIn);
}
