import { format } from 'date-fns'

import { TEMPLATE_MESSAGE, MESSAGE_CONTAINER, INPUT, URL } from './constants'
import { myNameServer, mailMy } from './nameUsers'
import { getCodeCookie } from './token'

export { sendMessage,  getHistoryMessage, focusMessage }

function sendMessage(e) {
    e.preventDefault();
    //проверить, не пустое ли сообщение вводится
    if (!checkValidMessage()) return;
    const token = getCodeCookie();
    //работа с вебсокетом
    //открываем соединение
    let socket = new WebSocket(`${URL.SOCKET}${token}`);

    socket.onopen = function(e) {
        alert("[open] Соединение установлено");
        alert("Отправляем данные на сервер");
        socket.send(JSON.stringify({ text: checkValidMessage() }));
    };
    

    //принимаем сообщение
    socket.onmessage = function(event) { 
        //вызываем рендер сообщения
        const textMessage = JSON.parse(event.data).text;
        //найти время отправителя
        const dateMessage = format(new Date(JSON.parse(event.data).createdAt),"HH:mm");
        renderOneMessage(myNameServer, textMessage, dateMessage)
        //чистим поле от сообщения после отправки
        INPUT.MESSAGE.value = "";
        //console.log(event.data);
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
          alert(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
        } else {
          // например, сервер убил процесс или сеть недоступна
          // обычно в этом случае event.code 1006
          alert('[close] Соединение прервано');
        }
      };
      socket.onerror = function(error) {
        alert(`[error]`);
      };
    
    /*socket.onclose = () => {
        websocketPermanentConnection()
    }*/
    
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

function renderOneMessage(name, message, time, mailUser = mailMy) {
    let cloneMessageTemplate = TEMPLATE_MESSAGE.content.cloneNode(true); 
    // находим тег span нашего клона шаблона и помещаем туда текст сообщения из формы
    cloneMessageTemplate.querySelector("#text-message").textContent = message;
    //найти имя отправителя и установить в шаблон
    cloneMessageTemplate.querySelector("#my-name").textContent = `${name}: `;
    //найти врем отправителя и установить в шаблон
    cloneMessageTemplate.querySelector(".time-message").textContent = time;
    
    //console.log(cloneMessageTemplate.querySelector('.message-all'));
    console.log(`${mailMy} : ${mailUser}`);
    //добавляем дополнительный класс сообщению, меняющий его стиль, если отправитель не я (любой другой пользователь)
    if (mailMy !== mailUser) cloneMessageTemplate.querySelector('.message-all').classList.add('message-me');
    // Добавить новое блок с сообщением в окно сообщений
    MESSAGE_CONTAINER.append(cloneMessageTemplate);
    //прокручиваем скролл к самому нижнему сообщению при обновлении страницы или добавлении нового сообщения
    /*метод scrollTop элемента MESSAGE_CONTAINER используется, чтобы установить вертикальное смещение 
    содержимого на величину scrollHeight этого же элемента, которая соответствует 
    полной высоте содержимого включая область, которая не помещается на экране.*/
    MESSAGE_CONTAINER.scrollTop = MESSAGE_CONTAINER.scrollHeight;
}

function renderHistoryMessage(jsonMessages) {
    const allMessage = jsonMessages.messages.reverse();

    allMessage.forEach(element => {        
        const mailUser = element.user.email; //узнаем почту каждого отправителя
        const dataMessage = format(new Date(element.createdAt),"HH:mm")
        renderOneMessage (element.user.name, element.text, dataMessage, element.user.email); 
    });
}


function checkValidMessage() {
    if (INPUT.MESSAGE.value === "") {
        return false;
    }
    return INPUT.MESSAGE.value; 
}

function focusMessage() {
    //можно поставить не фон, а класс с бордером, например .focused { outline: 1px solid red; }
    document.querySelector('.input-message').addEventListener("focus", function() {
        document.querySelector('.input-message').classList.add('focus-input-mess');
    });

    document.querySelector('.input-message').addEventListener("blur", function() {
        document.querySelector('.input-message').classList.remove('focus-input-mess');
    });
}