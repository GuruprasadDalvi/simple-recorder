const { remote } = require('electron');
const { shell } = require('electron');
const { desktopCapturer } = require('electron');
const { dialog, Menu } = remote;
const { writeFile } = require('fs');

var loaded = false;
const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;
var withAudio = false;
var recording = false;

let mediaRecorder;
const recordedChunks = [];
const recordBtnElem = document.getElementById("recordBtn")

document.querySelector('#min-btn').addEventListener('click', () => { minimizeWindow() });

document.querySelector('#audioBtn').addEventListener('click', () => {
    withAudio = !withAudio;
    var btn = document.getElementById('audioBtn');
    if (withAudio) {
        btn.classList.remove("audio-disable")
        btn.classList.add("audio")
            // btn.className.replace(/\baudio\b/g, "audio")
        console.log("With Audio: " + withAudio)
    } else {
        btn.classList.remove("audio")
        btn.classList.add("audio-disable")
            //btn.className.replace(/\baudio-disable\b/g, "audio-disable")
        console.log("Without Audio" + withAudio)
    }
});

recordBtnElem.onclick = e => {
    if (recording) {
        recordBtnElem.classList.remove('record-ing')
        recordBtnElem.classList.add('record')
        recording = !recording
        mediaRecorder.stop()
    } else {
        recordBtnElem.classList.remove('record')
        recordBtnElem.classList.add('record-ing')
        recording = !recording
        mediaRecorder.start()
    }
}
document.querySelector('#cls-btn').addEventListener('click', () => { closeWindow() });
document.querySelector('#gh').addEventListener('click', () => { shell.openExternal("https://github.com/GuruprasadDalvi") });
document.querySelector('#ig').addEventListener('click', () => { shell.openExternal("https://github.com/GuruprasadDalvi") });
document.querySelector('#ln').addEventListener('click', () => { shell.openExternal("https://www.linkedin.com/in/guruprasad-dalvi-b0727b109/") });


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
//Get all avilabe screens on users machine
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );


    videoOptionsMenu.popup();
}


async function selectSource(source) {

    videoSelectBtn.innerText = "Selected Screen: " + source.name;
    const constraints = {
        audio: withAudio,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    // Create a Stream
    const stream = await navigator.mediaDevices
        .getUserMedia(constraints);


    // Create the Media Recorder
    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    // Register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;

    // Updates the UI
}


function handleDataAvailable(e) {
    console.log('video data available');
    recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    if (filePath) {
        writeFile(filePath, buffer, () => console.log('video saved successfully!'));
    }

}