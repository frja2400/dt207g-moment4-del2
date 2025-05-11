const menu = document.getElementById("menu");
const userList = document.getElementById("userList");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

window.onload = init;

//Anropar funktion vid laddning av sida
function init() {

    changeMenu();

    if(userList) {
        getUsers();
    }
}

//Funktion som genererar meny beroende på om du är inloggad eller inte
function changeMenu() {

    //Hittar aktiv sida genom att splitta sökvägen till en array och plocka ut sista elementet.
    const currentPage = window.location.pathname.split("/").pop();

    if(localStorage.getItem("user_token")) {
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

    if(logoutLink) {
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
    
        if(!response.ok) throw new Error("Nätverksfel eller ogiltig token");

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

