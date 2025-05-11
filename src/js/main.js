const menu = document.getElementById("menu");
const userList = document.getElementById("userList");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

window.onload = init;

//Anropar funktion vid laddning av sida
function init() {

    changeMenu();

    if (userList) {
        getUsers();
    }

    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }
}

//Funktion som genererar meny beroende på om du är inloggad eller inte
function changeMenu() {

    //Hittar aktiv sida genom att splitta sökvägen till en array och plocka ut sista elementet.
    const currentPage = window.location.pathname.split("/").pop();

    if (localStorage.getItem("user_token")) {
        menu.innerHTML = `
            <li><a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Startsida</a></li>
            <li><a href="admin.html" class="${currentPage === 'admin.html' ? 'active' : ''}">Admin</a></li>
            <li><a href="#" id="logoutLink">Logga ut</a></li>
        `;
    } else {
        menu.innerHTML = `
            <li><a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Startsida</a></li>
            <li><a href="login.html" class="${currentPage === 'login.html' ? 'active' : ''}">Logga in</a></li>
        `;
    }

    //Logga ut genom att ta bort token
    const logoutLink = document.getElementById("logoutLink");

    if (logoutLink) {
        logoutLink.addEventListener("click", () => {
            localStorage.removeItem("user_token");
            window.location.href = "login.html";
        })
    }

    //Hade problem med att admin fortfarande syndes mellan klick i en millisekund så löste det med CSS.
    menu.style.visibility = "visible";
}

//Funktion som hämtar användare i databasen om du är inloggad och har giltig token
async function getUsers() {
    try {

        const token = localStorage.getItem("user_token");

        const response = await fetch("https://dt207g-moment4-del1.onrender.com/api/protected", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Nätverksfel eller ogiltig token");

        const data = await response.json();
        console.table(data);
        renderData(data);
    } catch (error) {
        console.error("Fel vid hämtning:", error);
    } finally {
        console.log("Förfrågan avslutad.");
    }
}

//Funktion som skiver ut användare på skärmen.
async function renderData(data) {
    userList.innerHTML = "";
    data.forEach(user => {
        userList.innerHTML += `
        <li>${user.username}</li>
        `
    });
}


//Logga in användare
async function loginUser(e) {
    e.preventDefault();

    let usernameInput = document.getElementById("username").value;
    let passwordInput = document.getElementById("password").value;
    const loginMessageDiv = document.getElementById("loginMessage");

    loginMessageDiv.innerHTML = "";

    //Samla felmeddelanden i en array
    const errors = [];

    //Validering för inmatning
    if (!usernameInput.trim()) {
        errors.push("Du måste fylla i ett användarnamn.");
    } else if (usernameInput.trim().length < 5) {
        errors.push("Användarnamn måste vara minst 5 tecken.");
    }

    if (!passwordInput) {
        errors.push("Du måste fylla i ett lösenord.");
    } else if (passwordInput.length < 7) {
        errors.push("Lösenord måste vara minst 7 tecken.");
    }

    //Om det finns valideringfel, visa dessa och avsluta inloggningen
    if (errors.length > 0) {
        errors.forEach(error => {
            displayError(error, loginMessageDiv);
        });
        return;
    }

    //Om validering är godkänd, fortsätt med inloggning.
    let user = {
        username: usernameInput,
        password: passwordInput
    }

    try {
        const response = await fetch("https://dt207g-moment4-del1.onrender.com/api/login", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if (response.ok) {
            //Spara min token i localStorage(min server skickar tillbaka svaret i "response" i JSON)
            localStorage.setItem("user_token", data.response.token);
            window.location.href = "admin.html";
        } else {
            //Om något går fel med inloggningen, visa ett generellt felmeddelande
            displayError("Felaktigt användarnamn eller lösenord.", loginMessageDiv);
        }
    } catch (error) {
        console.log("Fel vid inloggning", error);
        displayError("Fel vid inloggning, vänligen försök igen senare.", loginMessageDiv);
    }
}

//Funktion för att visa felmeddelande (parametrar meddelanden och elementet)
function displayError(error, container) {
    const errorMessage = document.createElement("p");
    errorMessage.textContent = error;
    errorMessage.classList.add("error");
    container.appendChild(errorMessage);
}