async function fetchVariants (container) {
    let response = await fetch('/variants')
    if (response.ok) {
        response = await response.json();
        for (let item in response) {
            const currentItem = document.createElement('option')
            currentItem.textContent = response[item]
            currentItem.value = item
            container.appendChild(currentItem)
        }
    }
    return response
}

async function fetchStat (container, variants) {
    let response = await fetch('/stat')
    if (response.ok) {
        response = await response.json();
        for (let item in response) {
            // Статистика
            const statItem = document.createElement('li')
            statItem.textContent = response[item]
            statItem.textContent =   variants[item] + ' - ' + statItem.textContent
            container.appendChild(statItem)
        }
    }
    return response
}

async function showInfo (variantsContainer, statContainer) {
    const variants = await fetchVariants(variantsContainer)
    fetchStat(statContainer, variants)
    return variants
}

async function getJSON() {
    const fetchOptions={
        headers: {
            'Accept': 'application/json',
        },
    };
    const response = await fetch('/statFile',fetchOptions);
    const data = await response.json();
    return data
}

async function getXML() {
    const fetchOptions={
        headers: {
            'Accept': 'application/xml',
        },
    };
    const response = await fetch('/statFile',fetchOptions);
    const xmlStr = await response.text();
    return xmlStr
}

async function getHTML() {
    const fetchOptions={
        headers: {
            'Accept': 'application/html',
        },
    };
    const response = await fetch('/statFile',fetchOptions);
    const htmlStr = await response.text();
    return htmlStr
}

window.onload = () => {
    const variantsContainer = document.querySelector('#variants')
    const statContainer = document.querySelector('#stat')
    const form = document.querySelector('#form')
    const goodVoice = document.querySelector('#goodVoice')
    const btn = document.querySelector('#btn')
    const jsonBtn = document.querySelector('#json')
    const xmlBtn = document.querySelector('#xml')
    const htmlBtn = document.querySelector('#html')
    const result = document.querySelector('#result')
    let variants = null

    showInfo(variantsContainer, statContainer)
        .then((res) => {
            variants = res
        })

    form.addEventListener('submit', async e => {
        e.preventDefault()
        const url = '/stat';
        const data = { vote: variantsContainer.value };
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                statContainer.innerHTML = ''
                await fetchStat(statContainer, variants)
                goodVoice.style.display = 'block'
                btn.style.display = 'none'
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    })

    jsonBtn.addEventListener('click', async () => {
        const data = await getJSON()
        let variants = await fetch('/variants')
        if (variants.ok) {
            variants = await variants.json();
        }
        let str = ''
        for (let key in data) {
            str += variants[key] + ': ' + data[key] + '\n'
        }

        result.value = str
    })

    xmlBtn.addEventListener('click', async () => {
        const data = await getXML()
        result.value = data
    })

    htmlBtn.addEventListener('click', async () => {
        const data = await getHTML()
        result.value = data
    })
}


