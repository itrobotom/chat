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
        renderOneMessage(myNameServer, textMessage, dateMessage, 'append');
        //чистим поле от сообщения после отправки
        INPUT.MESSAGE.value = "";
        //console.log(event.data);
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            alert(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
            socket.onopen = function(e) {
                alert("[open] Соединение установлено");
                alert("Отправляем данные на сервер");
                socket.send(JSON.stringify({ text: checkValidMessage() }));
            };
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
let jsonAllMessage;
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
            jsonAllMessage = await response.json();
            //console.log(`История 300 сообщений с сервера в json: ${JSON.stringify({json})}`);
            console.log(jsonAllMessage.messages);
            //вешаем событие при касании скролла вызываем рендер сообщений, причем диапазон сообщений будет каждый раз смещаться на 20
            //счетчик вызовов функции надо тогда ввести?
            //или по подсчету касаний скролла
            renderHistoryMessage();       
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


function renderOneMessage(name, message, time, mailUser = mailMy, positionMessegeAdd) {
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
    if(positionMessegeAdd === 'prepend') {
        MESSAGE_CONTAINER.prepend(cloneMessageTemplate);
    }  else {
        MESSAGE_CONTAINER.append(cloneMessageTemplate); //это мое напечатанное сообщение
        MESSAGE_CONTAINER.scrollTop = MESSAGE_CONTAINER.scrollHeight; //поэтому скролл перематываем в самый низ
    }  
}

let countRender = 0;

function renderHistoryMessage() { 
    const allMessage = jsonAllMessage.messages.reverse();
    
    console.log(allMessage); //Все 300 сообщений
    //Выберем определенный диапазон ключей (по 20 штук из 300)
    //console.log(Object.keys(allMessage));

    // заведем счетчик вызова функции renderHistoryMessage, где при первом вызове выберем первые 20 свойств: finishObj = 300, starObj = finishObj - 20 = 280
    // при втором вызове отнимаем по 20 к каждой, то есть starObj = 260, finishObj = 280
    // делать проверку не меньше ли starObj 0 ключей объекта, если меньше, то starObj = 0 (то есть первое сообщение с объекта сервера)
    const finishIndexObj = 300 - countRender * 20;
    const startIndexObj = finishIndexObj - 20;
    if(startIndexObj < 0) {
        //alert("Это вся история чата"); //сделать вывод один раз, а то браузер зависает!!
        return;
    }
    
    const keys = Object.keys(allMessage).slice(startIndexObj, finishIndexObj);

    //перебор элементов объекта только по выбранным ранее ключам keys
    keys.forEach(element => {
        console.log(format(new Date(allMessage[element].createdAt),"HH:mm"));
        const dataMessage = format(new Date(allMessage[element].createdAt),"HH:mm")
        renderOneMessage(allMessage[element].user.name, allMessage[element].text, dataMessage, allMessage[element].user.email, 'prepend');
        
        console.log(`Высота она с сообщениями1: ${MESSAGE_CONTAINER.scrollHeight}`);
        
        if (countRender === 1) { //или я отправил сообщение
            //прокручиваем скролл к самому нижнему сообщению при обновлении страницы или добавлении нового сообщения
            /*метод scrollTop элемента MESSAGE_CONTAINER используется, чтобы установить вертикальное смещение 
            содержимого на величину scrollHeight этого же элемента, которая соответствует 
            полной высоте содержимого включая область, которая не помещается на экране.
            Кажную порцию сообщений мы смещаем вверх, чтобы увидеть нижнее, как только вертикальный экран наполнится*/
            MESSAGE_CONTAINER.scrollTop = MESSAGE_CONTAINER.scrollHeight; //это надо сделать один раз при первой подгрузке с 280 по 300 или когда напечатаю свое сообщение и отправлю
        } else {
            MESSAGE_CONTAINER.scrollTop = MESSAGE_CONTAINER.scrollTop + 2; //чуть отступаем от верха, иначе счетчик сразу переполнится (как прижать бегунок к верху)
        }
      
    });
    countRender += 1;
}
MESSAGE_CONTAINER.addEventListener('scroll', function(event) {
    console.log(`Позиция верхней точки окна с сообщениям в пикселях: ${MESSAGE_CONTAINER.scrollTop}`);
    console.log(`Высота: ${MESSAGE_CONTAINER.scrollHeight}`);
    //console.log(`Текущие границы объекта: startIndexObj-${startIndexObj} : finishIndexObj-${finishIndexObj }`);
    console.log(`Счетчик вызова функции: ${countRender}`);
    //т.к. у нас MESSAGE_CONTAINER.scrollTop = MESSAGE_CONTAINER.scrollHeight; перемотка уходит вниз, то мы ждем пока MESSAGE_CONTAINER.scrollTop не станет 0
    //если он будет 0, значит мы дошли до верха сообщений и пора выдать очередную порицию 20 сообщений
    if(MESSAGE_CONTAINER.scrollTop === 0) {
        //renderOneMessage (allMessage[element].user.name, allMessage[element].text, dataMessage, allMessage[element].user.email);
        renderHistoryMessage();
        
    } 
    console.log(`Высота она с сообщениями2: ${MESSAGE_CONTAINER.scrollHeight}`);
})


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