import { POPUPS, BTN, INPUT } from './constants'
import { setName } from './nameUsers'
import { sendMessage } from './message'
import { saveCode, getCodeAutorization, getCodeCookie } from './token'
import Cookies from 'js-cookie'

//1) запуск приложения, всплывает окно с авторизацией (если нет кода в куках, а если есть, сразу чат)
// при этом раз есть код авторизации в куках, значит и имя уже задано, то есть открывать окно настроек не нужно
// при этом при первом запуске приложения после получения кода имя пользователя чата = почта
if(!getCodeCookie()){
    //меняем содержимое кнопки с "выйти" на "войти"
    BTN.LOGIN.textContent = 'Войти';
    POPUPS.AUTORIZATION.showModal();
}


// если мы жмем кнопку авторизации, то удаляем токен, то есть выходим и меняем кнопку на "войти"
BTN.LOGIN.addEventListener('click', function() {
    POPUPS.AUTORIZATION.showModal();
    Cookies.remove('autorization-token')
    BTN.LOGIN.textContent = 'Войти';
});

BTN.CLOSE_AUTORIZATION.addEventListener('click', function() {
    POPUPS.AUTORIZATION.close();
});

//2) Нажимаем "ввести код"
BTN.INPUT_CODE.addEventListener('click', function() {
    POPUPS.AUTORIZATION.close();
    POPUPS.INPUT_CODE.showModal();
    if(getCodeCookie()){
        INPUT.TOKEN.value = getCodeCookie();
    }
});


BTN.CLOSE_GET_CODE.addEventListener('click', function() {
    POPUPS.INPUT_CODE.close();
});

BTN.SETTINGS_CHAT.addEventListener('click', function() {
    POPUPS.SETTINGS_CHAT.showModal();
});

BTN.CLOSE_SETTINGS_CHAT.addEventListener('click', function() {
    POPUPS.SETTINGS_CHAT.close();
});


//вызываем функцию по клику btn или enter для добавления сообщения и в конце вызываем команду для прокрутки скролла к последнему нижнему сообщению
BTN.SEND_MESSAGE.addEventListener("click", sendMessage);


//при обновлении страницы запустить функцию получения имени с сервера
//если есть в куках токен авторизации, то запрос на сервер пройдет, если же нет, то открыть окно для авторизации 
//ведь мы не можем отправить сообщения на сервер
//let myNameServer = "NoName"; 
//getName();                




/*function sendMail(e) {
    e.preventDefault();
    return inputMail = document.querySelector(".input-mail-code").value;
}*/

BTN.GET_CODE.addEventListener("click", getCodeAutorization);

//сохраним введенный код в куки при клике на кнопку "войти" 
//открывать окно ввода имени не будем, т.к. оно будет поддятигиваться с сервера последнее
//при необходимости в настойки зайти можно и сменить имя
BTN.INPUT_MAIL_CODE.addEventListener("click", saveCode);



BTN.SET_NAME.addEventListener("click", setName)



