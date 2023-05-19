import { URL, INPUT, POPUPS, BTN } from './constants'
import { getCodeCookie } from './token'
import { getHistoryMessage } from './message'

export { setName, getName, myNameServer, mailMy }

let myNameServer, mailMy; //глобальная переменная, чтобы в нее записать имя пользователя и его почту при запуске приложения (запуск)

async function setName() {
    //получим данные из поля ввода имени
    const myName = INPUT.MY_NAME.value;
    console.log(myName);
    const token = getCodeCookie();
    console.log(token);
    try {
        const response = await fetch(URL.SERVER_USER ,{ 
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({name: myName}) 
        });
        if (response.ok) {
            let json = await response.json();
            console.log(json);
            console.log(`Состояние: ${json.message}, Код ответа: ${json.cod}`);
            alert(`Вы авторизованы под именем ${json.name}`);
            //вывести сообщение внутри окна настроек о том, что имя установлено и !!!!!!!!!!!!!!!!!
            //через секунду закрыть окно настроек                                 !!!!!!!!!!!!!!!!!
            
            //пока просто закрываем окно настроек после алерта
            POPUPS.SETTINGS_CHAT.close();
        }
        else {
            console.log("Есть проблемы с сохранением нового имени на сервере!");
            alert("Имя не применилось. Проблемы с сервером!")
        }
          
    }
    //отловит ошибку, если, например, пропадет интернет
    catch(error) {
        alert(`Ошибка: ${error.name} - ${error.message}`);
    }
}

async function getName() { //получим имя, а если нет доступа, то запросим окно ввода токена (если нет токена, сами переключимся на вкладку с вводом почты)
    const token = getCodeCookie();
    try {
        const response = await fetch(URL.MYNAME ,{ 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (response.ok) {
            let json = await response.json();
            console.log(`Состояние: ${json.message}, Код ответа: ${json.cod}`);
            myNameServer = json.name;
            mailMy = json.email;
            console.log(`Моя почта: ${mailMy}`);
            console.log(`Вы авторизованы под именем: ${myNameServer}`);
            alert(`Вы авторизованы под именем ${myNameServer}`);
            //вывести сообщение внутри окна настроек о том, что имя установлено и  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //через секунду закрыть окно настроек                                  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //пока просто алерт и закромем окно ввода кода только после авторизации!!!!!!!1
            //обновляем историю сообщений
            
            //СДЕЛАТЬ ЭТО ЧЕРЕЗ THEN, Т.К. ВЛОЖЕННОСТЬ ФУНКЦИЙ ПЛОХО ЧИТАЕТСЯ
            //!!!!!!!!!!
            //getHistoryMessage(); 
            POPUPS.INPUT_CODE.close();
            BTN.LOGIN.textContent = 'Выйти'; //после авторизации а по сути и получения имени мы меняем кнопку на "выйти"

        }
        else {
            console.log("Есть проблемы с получением имени с сервера!");
            //нужно открыть экран для авторизации, чтобы получить токен (раз его нет в куках)
        }
    }
    //отловит ошибку, если, например, пропадет интернет
    catch(error) {
        alert(`Ошибка: ${error.name} - ${error.message}`);
    }
}