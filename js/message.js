import { format } from 'date-fns'

import { TEMPLATE_MESSAGE, MESSAGE_CONTAINER, INPUT, URL, ALL_ELEM_DOM } from './constants'
import { mailMy } from './nameUsers'
import { getCodeCookie } from './token'
import { socket } from './main'

export { sendMessage,  getHistoryMessage, focusMessage, renderOneMessage, clearDom}

//для виртуализации (скролл)
let countRender = 0;
const stepMess = 20;
const allMessageCount = 300;
let allMessage; //массив с данными всех сообщений

//функция не по SOLID, но если делать отдельно resetFormSubmit(e) для сброса с проверкой на пустую строку
//то нужно создавать глобальную переменную для хранения данных с формы, чтобы потом их использовать
function sendMessage(e) {
    e.preventDefault();
    //проверить, не пустое ли сообщение вводится
    if (!validMessage()) return;
    socket.send(JSON.stringify({ text: validMessage() })); //отправляю свое сообщение на сервер
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
            json = await response.json(); 
            console.log(json.messages);
            allMessage = json.messages.reverse(); //переворачиваем для правильного порядка рендера
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


function renderOneMessage(name, message, time, positionMessegeAdd, mailUser = mailMy) {
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
        
    }  else { //это мое напечатанное сообщение
        MESSAGE_CONTAINER.append(cloneMessageTemplate); 
        MESSAGE_CONTAINER.scrollTop = MESSAGE_CONTAINER.scrollHeight; //поэтому скролл перематываем в самый низ
    }  
}

function renderHistoryMessage() {     
    console.log(allMessage); //Все 300 сообщений
    //Выберем определенный диапазон ключей (по 20 штук из 300)
    //console.log(Object.keys(allMessage));
    // заведем счетчик вызова функции renderHistoryMessage, где при первом вызове выберем первые 20 свойств: finishObj = 300, starObj = finishObj - 20 = 280
    // при втором вызове отнимаем по stepMess = 20 к каждой, то есть starObj = 260, finishObj = 280
    // делать проверку не меньше ли starObj 0 ключей объекта, если меньше, то starObj = 0 (то есть первое сообщение с объекта сервера)
    const finishIndexObj = allMessageCount - countRender * stepMess;
    const startIndexObj = finishIndexObj - stepMess;
    console.log(`Текущие границы объекта: startIndexObj-${startIndexObj} : finishIndexObj-${finishIndexObj }`);
    
    if (startIndexObj < 0) {
        alert("Это вся история чата")
        return; //не добавляем больше сообщения, если они коничились
    }
    
    
    const keys = Object.keys(allMessage).slice(startIndexObj, finishIndexObj).reverse();

    //перебор элементов объекта только по выбранным ранее ключам keys
    keys.forEach(element => {
        console.log(format(new Date(allMessage[element].createdAt),"HH:mm"));
        const dataMessage = format(new Date(allMessage[element].createdAt),"HH:mm")
        renderOneMessage(allMessage[element].user.name, allMessage[element].text, dataMessage, 'prepend', allMessage[element].user.email);

        console.log(`Высота она с сообщениями1: ${MESSAGE_CONTAINER.scrollHeight}`);
        
        if (countRender === 0) { //или я отправил сообщение
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

function clearDom() {
    //можно добавить проверку, вдруг ничего найдено не будет
    const elemDom = document.querySelectorAll(".box-message");
    if (elemDom) {
        elemDom.forEach((elem) => elem.remove()); 
    }
}

MESSAGE_CONTAINER.addEventListener('scroll', function() {
    console.log(`Позиция верхней точки окна с сообщениям в пикселях: ${MESSAGE_CONTAINER.scrollTop}`);
    console.log(`Высота: ${MESSAGE_CONTAINER.scrollHeight}`);
    
    console.log(`Счетчик вызова функции: ${countRender}`);
    //т.к. у нас MESSAGE_CONTAINER.scrollTop = MESSAGE_CONTAINER.scrollHeight; перемотка уходит вниз, то мы ждем пока MESSAGE_CONTAINER.scrollTop не станет 0
    //если он будет 0, значит мы дошли до верха сообщений и пора выдать очередную порицию 20 сообщений
    if(MESSAGE_CONTAINER.scrollTop === 0) {
        //renderOneMessage (allMessage[element].user.name, allMessage[element].text, dataMessage, allMessage[element].user.email);
        renderHistoryMessage();
        
    } 
    console.log(`Высота она с сообщениями2: ${MESSAGE_CONTAINER.scrollHeight}`);
})


function validMessage() {
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
