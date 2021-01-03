function dbQuery (e) {
    e.preventDefault()

    const errorsField = document.querySelector('#error')
    const resultField = document.querySelector('#result')
    const resultThead = resultField.querySelector('thead tr')
    const resultTbody = resultField.querySelector('tbody')
    errorsField.textContent = ''
    resultThead.innerHTML = ''
    resultTbody.innerHTML = ''

    const query = document.querySelector('#request').value
    fetch('/api/queries', {
        method: 'post',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({query})
    })
        .then(res => res.json())
        .then(response => {
            if (response.error) {
                errorsField.textContent = response.error.original.sqlMessage
                return false
            }

            if (response.metadata.info) {
                resultThead.textContent = response.metadata.info
            } else {
                for (let key in response.result[0]) {
                    const td = document.createElement('td')
                    td.textContent = key
                    resultThead.append(td)
                }

                response.result.forEach(i => {
                    const tr = document.createElement('tr')
                    for (let key in i) {
                        const td = document.createElement('td')
                        td.textContent = i[key]
                        tr.append(td)
                    }
                    resultTbody.append(tr)
                })
            }
        })
        .catch(e => {
            console.log(e)
        })
}

window.onload = () => {
    const form = document.querySelector('form')

    form.addEventListener("submit", e => {
        dbQuery(e)
    })
}
