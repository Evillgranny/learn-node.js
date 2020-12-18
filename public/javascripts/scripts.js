document.addEventListener("DOMContentLoaded", getUploadedFiles);
const backEndServer = 'http://localhost:5695';
// const backEndServer = 'http://46.101.255.222:5695';

const uploadedFiles = document.querySelector('.uploadedFiles');
uploadedFiles.addEventListener('click', downloadFile);
const percentContainer = document.querySelector('.uploadPercent');

const form = document.forms.namedItem("fileInfo");
form.addEventListener('submit', sendForm);

const url = `ws://localhost:5696`;
// const url = `ws://46.101.255.222:5696`;
let ws = null;


let reOpenTimer = null;
let keepAliveTimer = null;

function start(websocketServerLocation){

    ws = new WebSocket(websocketServerLocation);
    ws.onopen =  async function (e) {
        console.log('соединение установлено');
        addError({errorInfo:""});

        ws.send('KEEP_ME_ALIVE');
    };

    ws.onclose = function () {
        console.log("соединение с сервером закрыто");
        percentContainer.textContent = '';
        ws=null;
        clearInterval(keepAliveTimer);
    };

    ws.onmessage = async function (res) {

        const message = JSON.parse(res.data);

        switch (message.type) {
            case 'ID':
                connectionId = message.data;
                const data = new FormData(form);
                keepAlive();
                uploadDataService(data);
                console.log('connectionId', connectionId);
                reOpenTimer = null;
                break;
            case 'UPLOAD_PERCENT':
                uploadPercent = message.data;
                percentContainer.textContent = `${uploadPercent}%`;
                break;
            case 'ERROR':
                addError({errorInfo: message.data});
                break;
        }
    };

    ws.onerror = error => {
        addError({errorInfo:"Сервер недоступен"});
        percentContainer.textContent = '';
        setTimeout(() => sendForm() , 5000);
        clearInterval(keepAliveTimer);
        console.log('WebSocket error:',error);
    };
}



function keepAlive () {
    keepAliveTimer=setInterval(()=>{
        ws.send('KEEP_ME_ALIVE');
    },5000);
}

function addFileToList (item) {
    const wrapper = document.createElement('div');
    wrapper.className = 'wrapperName';
    const nameElem = document.createElement('div');
    nameElem.textContent = item.originalName;
    nameElem.className = 'fileName';
    const downloadElem = document.createElement('a');
    downloadElem.dataset.name = item.name;
    downloadElem.className = 'downloadLink';
    downloadElem.textContent = 'скачать';
    wrapper.appendChild(nameElem);
    wrapper.appendChild(downloadElem);

    uploadedFiles.appendChild(wrapper);
}

function addError (error) {
    const errorWrap = document.querySelector('.error');
    errorWrap.textContent = error.errorInfo;
}

async function getUploadedFiles() {
        try {
            const response = await fetch(`${backEndServer}/files`);

            const data = await response.json();

            data.forEach((item) => {
                addFileToList(item)
            })
        }
        catch (e) {
            addError({errorInfo: 'Ошибка при загрузке'});
            clearInterval(keepAliveTimer);
        }
};

let connectionId = null;
let uploadPercent = null;



async function uploadDataService (data) {

    try {
        const response = await fetch(`${backEndServer}/uploadFile`, {
            method: 'POST',
            headers:{
                connectionid: connectionId
            },
            body: data
        });

        const res = await response.json();

        addFileToList(res.data);
        form.reset();
        percentContainer.textContent = '';


        if (res.error){
            addError(res.error)
        }
    }
    catch (e) {
        addError({errorInfo:'Ошибка при загрузке'});
        if (!reOpenTimer)
            reOpenTimer = setTimeout(() => sendForm(), 3000);
        console.error(e)
    }
}

async function sendForm(e) {

    if (e) e.preventDefault();
    start(url);
};

async function downloadFile(e) {

    const body = JSON.stringify({name: e.target.dataset.name});
    try{
    const response = await fetch(`${backEndServer}/uploads/${e.target.dataset.name}`, {
        method: 'GET',
    } );

    const imageInfoRaw = await fetch(`${backEndServer}/getImageInfo`, {
        method:'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body
    });

    const imageInfo = await imageInfoRaw.json();

    if ( response.ok ) {
        const ab=await response.arrayBuffer();

        const blob = new Blob([ab], { type: imageInfo.mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = imageInfo.originalName;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    else {
        console.error('error loading');
    }
}
catch ( err ) {
    console.error(err);
}
}



