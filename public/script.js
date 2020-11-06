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

window.onload = () => {
    const variantsContainer = document.querySelector('#variants')
    const statContainer = document.querySelector('#stat')
    const form = document.querySelector('#form')
    const goodVoice = document.querySelector('#goodVoice')
    const btn = document.querySelector('#btn')
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
}
