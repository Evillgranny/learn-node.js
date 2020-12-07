const socket = io('http://localhost:3000')
const uploader = new SocketIOFileClient(socket)
const form = document.getElementById('form')
const progress = document.querySelector('.progress-in')
const progressContainer = document.querySelector('.progress')
const info = document.querySelector('#info')
const commentInput = document.querySelector('#comment')

const setPercent = (current, fullSize) => {
    const percent = fullSize / 100
    return Math.round(current / percent)
}

uploader.on('ready', function() {
    console.log('SocketIOFile ready to go!');
})

uploader.on('loadstart', function() {
    console.log('Loading file to browser before sending...');
})

uploader.on('start', function(fileInfo) {
    console.log('Start uploading', fileInfo);
    info.textContent = 'Uploading'
    info.style.color = 'aqua'
    progressContainer.style.display = 'block'
})

uploader.on('stream', function(fileInfo) {
    console.log('Streaming... sent ' + fileInfo.sent + ' bytes.')
    progress.style.width = setPercent(fileInfo.sent ,fileInfo.size) + '%'
    progress.style.background = 'aqua'
})

uploader.on('complete', function(fileInfo) {
    console.log('Upload Complete', fileInfo);
    progress.style.width = '100%'
    progress.style.background = 'greenyellow'
    info.textContent = 'Upload Complete'
    info.style.color = 'greenyellow'
})

uploader.on('error', function(err) {
    console.log('Error!', err);
    info.textContent = err
    info.style.color = 'red'
    progress.style.background = 'red'
    progress.style.width = '100%'
})

form.onsubmit = function(ev) {
    ev.preventDefault()
    const fileEl = document.getElementById('file')
    const uploadIds = uploader.upload(fileEl.files, {data:{ comment: commentInput.value }})
};
