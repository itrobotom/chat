
import { TEMPLATE_MESSAGE, MESSAGE_CONTAINER, INPUT, URL } from './constants'
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
    const inputMessage = INPUT.MESSAGE.value;
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

