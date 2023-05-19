import Cookies from 'js-cookie'
import { format } from 'date-fns'

import { POPUPS, BTN, INPUT, URL } from './constants'
import { setName, getName } from './nameUsers'
import { sendMessage, getHistoryMessage, renderOneMessage, focusMessage, clearDom } from './message'
import { saveCode, getCodeAutorization, getCodeCookie } from './token'
import { myNameServer } from './nameUsers'

export { socket }

let socket;


//1) запуск приложения, всплывает окно с авторизацией (если нет кода в куках, а если есть, сразу чат)
// при этом раз есть код авторизации в куках, значит и имя уже задано, то есть открывать окно настроек не нужно
// при этом при первом запуске приложения после получения кода имя пользователя чата = почта
startMessendger();


// если мы жмем кнопку авторизации, то удаляем токен, то есть выходим и меняем кнопку на "войти"
BTN.LOGIN.addEventListener('click', () => {
    POPUPS.AUTORIZATION.showModal();
    Cookies.remove('autorization-token')
    BTN.LOGIN.textContent = 'Войти';

    //ДОДЕЛАТЬ НОРМАЛЬНО ЧИСТКУ ДЕРЕВА
    //clearDom(); //чистим дом дерево !!!! ЧИСТИТСЯ НЕ ВСЕ ПОЧЕМУ-ТО
    //!!!!!закрыть сокет!

    //ИНОГДА РУГАЕТСЯ НА ЭТУ СТРОЧКУ, Т.К. СОКЕТ МОЖЕТ БЫТЬ НЕ ОТКРЫТ, ТО ЕСТЬ ОБЪЕКТА НЕТ
    if(socket) socket.close(); //!!!!!вывести бы сообщение в консоль: "Соединение закрыто, т.к. вы вышли из профиля"
    
    startMessendger();
});

BTN.CLOSE_AUTORIZATION.addEventListener('click', () => {
    POPUPS.AUTORIZATION.close();
});

//2) Нажимаем "ввести код"     "войти" в окне, где вставлен код
BTN.INPUT_CODE.addEventListener('click', () => {
    POPUPS.AUTORIZATION.close();
    POPUPS.INPUT_CODE.showModal();
    if(getCodeCookie()){
        INPUT.TOKEN.value = getCodeCookie();
    }
});

BTN.GET_CODE.addEventListener("click", getCodeAutorization);

//сохраним введенный код в куки при клике на кнопку "войти" 
//открывать окно ввода имени не будем, т.к. оно будет поддятигиваться с сервера последнее
//при необходимости в настойки зайти можно и сменить имя
BTN.INPUT_MAIL_CODE.addEventListener("click", () => {
    saveCode();
    startMessendger();
});


BTN.CLOSE_GET_CODE.addEventListener('click', () => {
    POPUPS.INPUT_CODE.close();
});

BTN.SETTINGS_CHAT.addEventListener('click', () => {
    POPUPS.SETTINGS_CHAT.showModal();
});

BTN.CLOSE_SETTINGS_CHAT.addEventListener('click', () => {
    POPUPS.SETTINGS_CHAT.close();
});


//вызываем функцию по клику btn или enter для добавления сообщения и в конце вызываем команду для прокрутки скролла к последнему нижнему сообщению
BTN.SEND_MESSAGE.addEventListener("click", sendMessage);


BTN.SET_NAME.addEventListener("click", setName)


focusMessage(); 

function socketConnect() {
    const token = getCodeCookie();
    //работа с вебсокетом
    //открываем соединение
    socket = new WebSocket(`${URL.SOCKET}${token}`); 

    socket.onopen = function(e) {
        console.log("СОЕДИНЕНИЕ УСТАНОВЛЕНО");
        
    };

    //принимаем сообщение чужое и свое в моменте
    socket.onmessage = function(event) { 
        //вызываем рендер сообщения
        const textMessage = JSON.parse(event.data).text;
        //найти время отправителя
        const dateMessage = format(new Date(JSON.parse(event.data).createdAt),"HH:mm");
        renderOneMessage(JSON.parse(event.data).user.name, textMessage, dateMessage, 'append', JSON.parse(event.data).user.email); 
        //чистим поле от сообщения после отправки
        if(myNameServer === JSON.parse(event.data).user.name) INPUT.MESSAGE.value = ""; //чтобы стирать в поле ввода сообщения только когда я отправляю, а то стиралось и когда кто-то присылал сообщение пока я печатаю
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            alert(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
        } else {
            socketConnect();
            console.log("Соединение продолжается!");
        }
    };
    socket.onerror = function(error) {
        alert(`[error]`);
    };

}

function startMessendger() {
    if(!getCodeCookie()){
        //меняем содержимое кнопки с "выйти" на "войти"
        BTN.LOGIN.textContent = 'Войти';
        POPUPS.AUTORIZATION.showModal();
    } else {
        getName(); //раз авторизованы, получаем имя с сервера
        getHistoryMessage(); //если мы авторизованы, значит грузим историю сообщений чата
        //открываем сокет
        socketConnect();
    }
}