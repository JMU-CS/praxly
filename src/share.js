import { textEditor } from "./common";

export function generateUrl() {
    // yank the text in ace
    var code = textEditor.getValue();
    let encoded = encodeURIComponent(code);
    window.location.hash = ''; //this should clear it before replacing it
    window.location.hash = `code=${encoded}`
    saveToLocal();
    var dummy = document.createElement('input');
    var text = window.location.href;
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(function () {
        toast.style.display = 'none';
    }, 3000); // Hide the toast after 3 seconds (adjust as needed)
}

export function loadFromUrl() {
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

  
}

// this seems to work, but we should trigger it automatically at some frequency so that teacher doesn't accidentally lose their work
export function saveToLocal() {
    const currentSrc = textEditor.getValue()
    window.localStorage.setItem(`${(new Date()).toLocaleDateString()}`, currentSrc)
}

// when the page loads, there might be some piece of the interface that displays the drafts it read from local storage
