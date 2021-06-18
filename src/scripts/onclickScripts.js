const { shell } = require('electron');

function closeWindow() {
    var window = remote.getCurrentWindow();
    console.log("Close Window");
    window.close();
}

function minimizeWindow() {
    console.log("Minimise Window");
    var window = remote.getCurrentWindow();
    window.minimize();
}

document.querySelector('#min-btn').addEventListener('click', () => { minimizeWindow() });
document.querySelector('#cls-btn').addEventListener('click', () => { closeWindow() });

//Social Media Links
document.querySelector('#gh').addEventListener('click', () => { shell.openExternal("https://github.com/GuruprasadDalvi") });
document.querySelector('#ig').addEventListener('click', () => { shell.openExternal("https://www.instagram.com/guruprasad_dalvi/") });
document.querySelector('#ln').addEventListener('click', () => { shell.openExternal("https://www.linkedin.com/in/guruprasad-dalvi-b0727b109/") });