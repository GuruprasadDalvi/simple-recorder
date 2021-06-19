//Imports
const { remote } = require('electron');
const { desktopCapturer } = require('electron');
const { dialog, Menu } = remote;
const { writeFile } = require('fs');

//Variable
const videoSelectBtn = document.getElementById('videoSelectBtn');
var withAudio = false;
var recording = false;
let mediaRecorder;
const options = {
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 6000000,
    mimeType: 'video/webm; codecs=vp9'
};
let recordedChunks = [];
const recordBtnElem = document.getElementById("recordBtn");
videoSelectBtn.onclick = getVideoSources;

//Audio Abutton Logic
document.querySelector('#audioBtn').addEventListener('click', () => {
    var btn = document.getElementById('audioBtn');
    if (withAudio) {
        btn.classList.remove("audio-disable")
        btn.classList.add("audio")
        console.log("With Audio: " + withAudio)
        withAudio = false;
    } else {
        btn.classList.remove("audio")
        btn.classList.add("audio-disable")
        console.log("Without Audio" + withAudio)
        withAudio = true;
    }
});

//Record Button Logic
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

    videoSelectBtn.innerHTML = "Selected Screen: " + source.name;

    //Check if user wants audio
    let constraints = {
        audio: {
            mandatory: {
                chromeMediaSource: 'desktop'
            }
        },
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    if (withAudio) {
        constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: source.id
                }
            }
        };
    }
    console.log(constraints);
    // Create a Stream
    const stream = await navigator.mediaDevices
        .getUserMedia(constraints);


    // Create the Media Recorder
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
        type: 'video/mp4'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.mp4`
    });

    if (filePath) {
        writeFile(filePath, buffer, () => console.log('video saved successfully!'));
    }
    recordedChunks = []
}