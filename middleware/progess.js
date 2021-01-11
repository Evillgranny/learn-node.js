let clients = require('../utils/wsClients')

function progressFunc (req, res, next) {
    const size = req.headers['content-length'];
    let data = 0;
    const id = req.headers.connectionid;

    req.on('data', chunk => {
        data += chunk.length;
        const dataString = JSON.stringify({type: 'UPLOAD_PERCENT', data: (data/size * 100).toFixed(2)});
        if (clients[id]) {
            clients[id].connection.send(dataString)
        }
        else {
            console.log(`${clients[id]} Клиент отключен`);
        }
    })

    next()
}

module.exports = progressFunc
