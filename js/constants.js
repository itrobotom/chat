export { URL, POPUPS, TEMPLATE_MESSAGE, TEMPLATE_MESSAGE_USER, BTN, MESSAGE_CONTAINER, INPUT}

const URL = {
    SERVER: 'https://edu.strada.one/api',
    SERVER_USER: 'https://edu.strada.one/api/user',
    MYNAME: 'https://edu.strada.one/api/user/me',
    HIST_MESSAGE: 'https://edu.strada.one/api/messages/',
    SOCKET: `wss://edu.strada.one/websockets?` 
}

const POPUPS = {
    AUTORIZATION: document.getElementById('avtorizationDialog'),
    INPUT_CODE: document.getElementById('input-code-dialog'),
    SETTINGS_CHAT: document.getElementById('settigns-chat-dialog'),
}

const BTN = {
    LOGIN: document.getElementById('login'),
    CLOSE_AUTORIZATION: document.getElementById('close-autorization'),
    CLOSE_GET_CODE: document.getElementById('close-get-code'),
    INPUT_CODE: document.getElementById('input-code'),
    SETTINGS_CHAT: document.getElementById('settigns-chat'),
    CLOSE_SETTINGS_CHAT: document.getElementById('close-settigns-chat'),
    SEND_MESSAGE: document.querySelector("#send-message"),
    INPUT_MAIL_CODE: document.querySelector("#send-code"),
    GET_CODE: document.getElementById('get-code'),
    SET_NAME: document.querySelector("#send-name")
}

const INPUT = {
    TOKEN: document.querySelector("#code-token"),
    MAIL: document.querySelector(".input-mail-code"),
    MY_NAME: document.querySelector(".input-name"),
    MESSAGE: document.querySelector(".input-message")
}

const TEMPLATE_MESSAGE = document.getElementById("template-my-message"); //найдем шаблон для моего сообщения в разметке 

const TEMPLATE_MESSAGE_USER = document.getElementById("template-user-message");

//находим контейнер, в котором будут все наши сообщения 
const MESSAGE_CONTAINER = document.getElementById("message-container"); 
