import { format } from 'date-fns'

import { TEMPLATE_MESSAGE, TEMPLATE_MESSAGE_USER, MESSAGE_CONTAINER, INPUT, URL } from './constants'
import { myNameServer } from './nameUsers'
import { getCodeCookie } from './token'

export { sendMessage,  getHistoryMessage }

function sendMessage(e) {
    e.preventDefault();
    //клонируем содержимое template
    const cloneMessageTemplate = TEMPLATE_MESSAGE.content.cloneNode(true);
    //найти имя отправителя и установить имя отправителя
    
    cloneMessageTemplate.querySelector("#my-name").textContent = `${myNameServer}: `;
    //найти введенное сообщение
    //проверить на пустое сообщение, чтобы не отправлять пустое сообщение  
    if (!checkValidMessage()) return;
    const inputMessage = checkValidMessage();
    // находим тег span нашего клона шаблона и помещаем туда текст сообщения из формы
    cloneMessageTemplate.querySelector('#text-message').textContent = inputMessage;
    // Добавить новое сообщение в элемент
    MESSAGE_CONTAINER.append(cloneMessageTemplate);
    //чистим поле от сообщения после отправки
    INPUT.MESSAGE.value = "";
    //прокручиваем скролл к самому нижнему сообщению при обновлении страницы или добавлении нового сообщения
    /*метод scrollTop элемента MESSAGE_CONTAINER используется, чтобы установить вертикальное смещение 
    содержимого на величину scrollHeight этого же элемента, которая соответствует 
    полной высоте содержимого включая область, которая не помещается на экране.*/ 
    MESSAGE_CONTAINER.scrollTop = MESSAGE_CONTAINER.scrollHeight;
}

async function getHistoryMessage() {
    const token = getCodeCookie();
    try {
        const response = await fetch(URL.HIST_MESSAGE ,{ //response - это промис 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (response.ok) {
            let json = await response.json();
            //console.log(`История 300 сообщений с сервера в json: ${JSON.stringify({json})}`);
            console.log(json.messages);
            renderHistoryMessage(json);       
        }
        else {
            console.log("Есть проблемы с получением истории сообщений!");
            //нужно открыть экран для авторизации, чтобы получить токен (раз его нет в куках)
        }  
    }
    //отловит ошибку, если, например, пропадет интернет
    catch(error) {
        alert(`Ошибка: ${error.name} - ${error.message}`);
    }
}

function renderHistoryMessage(jsonMessages) {
    const allMessage = jsonMessages.messages;
    allMessage.forEach(element => {
        //console.log(element);
        console.log(element.user.name);
        console.log(element.text);
        //клонируем содержимое template
        const cloneMessageTemplate = TEMPLATE_MESSAGE_USER.content.cloneNode(true);
        // находим тег span нашего клона шаблона и помещаем туда текст сообщения из формы
        cloneMessageTemplate.querySelector("#text-message").textContent = element.text;
        //найти имя отправителя и установить в шаблон
        cloneMessageTemplate.querySelector("#my-name").textContent = `${element.user.name}: `;
        //найти врем отправителя и установить в шаблон
        cloneMessageTemplate.querySelector(".time-message").textContent = format(new Date(element.createdAt),"HH:mm");
        // Добавить новое сообщение в элемент
        MESSAGE_CONTAINER.append(cloneMessageTemplate);
        MESSAGE_CONTAINER.scrollTop = MESSAGE_CONTAINER.scrollHeight;
    });
}

function checkValidMessage() {
    if (INPUT.MESSAGE.value === "") {
        return false;
    }
    return INPUT.MESSAGE.value; 
}