
import { textEditor } from "./milestone2";

export function generateUrl() {
    // yank the text in ace
    // console.log(textEditor.getValue());
    var code = textEditor.getValue();
    let encoded = encodeURIComponent(code);
    console.log(encoded);
    window.location.hash = ''; //this should clear it before repalcing it
    window.location.hash = `code=${encoded}`
    saveToLocal()
    // encode
    // encodeURIComponent is the function we use by default
    //update the url
    //future: automatically copy to clipboard

}

export function loadFromUrl(turnCodeToBLocks) {
    const fragmentPattern = '#code='
    // look at the url
    // look for '#code
    let urlSrc = window.location.hash;
    if (!urlSrc.startsWith(fragmentPattern)) {
        return;
    }
    urlSrc = urlSrc.substring(fragmentPattern.length);
    let decoded = decodeURIComponent(urlSrc);
    textEditor.setValue(decoded, 1);
    turnCodeToBLocks();
    //take everything after that
    // decode the encodeing
    // set the editor text to the encodedtext
    // trigger the function that generates the code
}


// this seems to work, but we should trigger it automatically at some frequency so that teacher doens't accidentally lose their work
export function saveToLocal() {
    const currentSrc = textEditor.getValue()
    window.localStorage.setItem(`${(new Date()).toLocaleDateString()}`, currentSrc)
}

// when the page loads, there might be some piece of the interface that displays the drafts it read from local storage