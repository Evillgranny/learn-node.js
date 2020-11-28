import React from 'react'

export const LinkCard = ({ link }) => {
    return (
        <>
            <h2>Ссылка</h2>
            <p>Ваша ссылка: <a target="_blank" rel="noopener noreferrer" href={link.to}>{link.to}</a></p>
            <p>Откуда: <a target="_blank" rel="noopener noreferrer" href={link.from}>{link.from}</a></p>
            <p>Количество кликов по ссылке: <strong>{link.clicks}</strong></p>
            <p>Дата создания: <strong>{new Date(link.date).toLocaleDateString()}</strong></p>
        </>
    )
}
