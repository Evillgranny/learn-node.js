module.exports = function (email, key) {
    return {
        to: email,
        from: 'tractor2554393@yandex.by',
        subject: 'Регистрация',
        html: `
            <h1>Регистрация</h1>
            <p>Для перейдите по ссылке ниже для завершения регистрации</p>
            <p><a href="${process.env.BASE_SITE_URL}/registration/${key}">Завершить процесс регистрации</a></p>
        `
    }
}
