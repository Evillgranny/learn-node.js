async function newRequest (sendMethod, url, paramsStr, contentType, bodyContent, otherHeadersContent) {
    const body = JSON.stringify({
        method: sendMethod,
            url: url,
            query: paramsStr,
            contentType: contentType,
            body: bodyContent,
            headers: otherHeadersContent
    })
    let response = await fetch('/postman', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body
    })
    try {
        const json = await response.json()
        if (json.errors) {
            const errorsContainer = document.querySelector('#errors')
            const errorsBlock = document.querySelector('.errors')

            errorsBlock.style.display = 'block'
            errorsContainer.innerHTML = ''

            json.errors.forEach(error => {
                const item = document.createElement('li')
                item.textContent = error.msg
                item.style.color = 'red'
                errorsContainer.append(item)
            })
            return
        }

        const errorsBlock = document.querySelector('.errors')
        errorsBlock.style.display = 'none'

        document.querySelector('#result').textContent = json.body
        document.querySelector('#headerResult').textContent = JSON.stringify(json.headers)
        document.querySelector('#contentType').textContent = json.headers['content-type']
        document.querySelector('#resStatus').textContent = json.status
    } catch (e) {console.log(e)}

}

async function prepareRequest () {
    const sendMethod = document.querySelector('#sendMethod').value
    const url = document.querySelector('#url').value
    const paramsContainer = document.querySelector('.query-container')
    const queries = paramsContainer.querySelectorAll('.query-block')
    const contentTypeVariants = document.querySelectorAll('.content-type')
    const body = document.querySelectorAll('.body-block')
    const otherHeaders = document.querySelectorAll('.other-headers-block')


    let queryStr = ''

    queries.forEach(function (i) {
        const key = i.querySelector('.query-key').value
        const value = i.querySelector('.query-value').value
        if (!queryStr && key) queryStr += '?'

        if (key) {
            if (queryStr === '?') {
                queryStr += key + '=' + value
            } else {
                queryStr += '&' + key + '=' + value
            }
        }
    })

    let contentType = ''

    contentTypeVariants.forEach(function (i ) {
        if (i.checked) {
            if (i === 'none') {
                contentType = null
            } else {
                contentType = i.value
            }
        }
    })

    let bodyContent = {}

    body.forEach(function (i) {
        const key = i.querySelector('.body-key').value
        const value = i.querySelector('.body-value').value
        if (key && value) {
            bodyContent[key] = value
        }
    })

    let otherHeadersContent = {}

    otherHeaders.forEach(function (i) {
        const key = i.querySelector('.other-headers-key').value
        const value = i.querySelector('.other-headers-value').value
        if (key && value) {
            otherHeadersContent[key] = value
        }
    })

    return {sendMethod, url, queryStr, contentType, bodyContent, otherHeadersContent}
}

window.onload = () => {
    const submitBtn = document.querySelector('#submitBtn')

    submitBtn.addEventListener('click', async () => {
        const obj = await prepareRequest()
        await newRequest(...Object.values(obj))
    })
}
