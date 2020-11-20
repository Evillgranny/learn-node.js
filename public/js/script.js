async function newRequest (sendMethod, url, paramsStr, contentType, bodyContent, otherHeadersContent) {
    console.log(sendMethod, url, paramsStr, contentType, bodyContent, otherHeadersContent)
    let body = JSON.stringify({
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
            'Content-Type': 'application/json'
        },
        body
    })
}

window.onload = function () {
    const submitBtn = document.querySelector('#submitBtn')

    submitBtn.addEventListener('click', function () {
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
            if (!queryStr) queryStr += '?'

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

        newRequest(sendMethod, url, queryStr, contentType, bodyContent, otherHeadersContent)
    })
}
