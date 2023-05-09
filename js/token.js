import { URL, POPUPS, INPUT } from './constants'
import Cookies from 'js-cookie'
import { getName } from './nameUsers'

export { saveCode, getCodeAutorization, getCodeCookie }

//ПО СУТИ ЭТО ФУНКЦИЯ АВТОРИЗАЦИИ, В КОНЦЕ МЫ ПОЛУЧАЕМ ИМЯ С СЕРВЕРА
function saveCode() {
    //сохраняем код в куках
    const inputMailCodeValue = INPUT.TOKEN.value;
    Cookies.set('autorization-token', inputMailCodeValue);
    INPUT.TOKEN.value = "";
    getName(); //сразу получить актульное имя с сервера (если нет нужды менять и не будем менять)
}

function getCodeCookie() {
    const token = Cookies.get('autorization-token');
    if (token === "") {
        return false;
    }
    return token; 
}

async function getCodeAutorization() {
    const email = INPUT.MAIL.value; //забираем почту из инпута
    //сделать валидацию почты, хотябы на пустое значение проверить
    try {
        const response = await fetch(URL.SERVER_USER ,{ 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify({email}) //тело запроса в данном случае содержит email, а именно объект {}
        });
        if (response.ok) {
            let json = await response.json();
            console.log(json);
            console.log(`Состояние: ${json.message}, Код ответа: ${json.cod}`);
        }
        else {
            console.log("Есть проблемы");
        }
          
    }
    //отловит ошибку, если, например, пропадет интернет
    catch(error) {
        alert(`Ошибка: ${error.name} - ${error.message}`);
    }
}