const login = document.getElementById('login');
const closeAutorization = document.getElementById('close-autorization');
const avtorizationDialog = document.getElementById('avtorizationDialog');

login.addEventListener('click', function() {
    avtorizationDialog.showModal();
});

closeAutorization.addEventListener('click', function() {
    avtorizationDialog.close();
});

const getCode = document.getElementById('get-code');
const closeGetCode = document.getElementById('close-get-code');
const getCodeDialog = document.getElementById('get-code-dialog');

getCode.addEventListener('click', function() {
    getCodeDialog.showModal();
});

closeGetCode.addEventListener('click', function() {
    getCodeDialog.close();
});

const settignsChat = document.getElementById('settigns-chat');
const closeSettignsChat = document.getElementById('close-settigns-chat');
const settignsChatDialog = document.getElementById('settigns-chat-dialog');

settignsChat.addEventListener('click', function() {
    settignsChatDialog.showModal();
});

closeSettignsChat.addEventListener('click', function() {
    settignsChatDialog.close();
});

const templateMessage = document.getElementById("template-message"); //найдем шаблон для сообщения в разметке 

//вызываем функцию по клику btn или enter для добавления сообщения и в конце вызываем команду для прокрутки скролла к последнему нижнему сообщению
const btnSendMessage = document.querySelector(".btn-send");
btnSendMessage.addEventListener("click", addMessage);


function addMessage(e) {
    e.preventDefault();
    //клонируем содержимое template
    const cloneMessageTemlate = templateMessage.content.cloneNode(true);
    //находим контейнер, в котором будут все наши сообщения 
    const messageContainer = document.getElementById("message-container"); 
    //найти введенное сообщение 
    const inputMessage = document.querySelector(".input-message").value;
    // находим тег span нашего клона шаблона и помещаем туда текст сообщения из формы
    cloneMessageTemlate.querySelector('span').textContent = inputMessage;
    // Добавить новое сообщение в элемент
    messageContainer.append(cloneMessageTemlate);
    //чистим поле от сообщения после отправки
    document.querySelector(".input-message").value = "";
    //прокручиваем скролл к самому нижнему сообщению при обновлении страницы или добавлении нового сообщения
    /*метод scrollTop элемента messageContainer используется, чтобы установить вертикальное смещение 
    содержимого на величину scrollHeight этого же элемента, которая соответствует 
    полной высоте содержимого включая область, которая не помещается на экране.*/ 
    messageContainer.scrollTop = messageContainer.scrollHeight;
}
