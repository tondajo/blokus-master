const express = require("express")
const path = require("path")
const app = express()
const port = 3000;

//tu wszystkie deklaracje
let users = []
let registeredUsers = []
let activeUsers = []

let kolor = ['niebieski', 'rozowy']
let upcomingMoves = []
let recentMove;

let status = {
    wait: { name: "wait", message: "oczekiwanie na drugiego gracza"},
    userActive: { name: "active", message: "użytkownik o podanym nicku już gra"},
    start: { name: "start", message: "" },

}

app.use(express.static('static'))

//tu wszystkie funkcje
function logowanie(req, res) {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
        res.writeHead(200, { "Content-type": "text/plain;charset=utf-8" });
        loginUser(data);
    })

    let loginUser = (data) => {
        let json = JSON.parse(data)

        if (users.length < 2) {
            if (json.username.length > 0 && !registeredUsers.includes(json.username)) {
                json.launch = false;
                json.id = users.length;
                json.message = 'oczekiwanie na drugiego gracza'
                users.push(json)
                registeredUsers.push(json.username)
            }

            if (users.length < 2) {
                res.end(JSON.stringify(JSON.stringify(users[users.length - 1])))
            }
        }

        if (users.length == 2) {
            if (registeredUsers.includes(json.username)) {
                if (!json.launch) {
                    for (let i = 0; i < users.length; i++) {
                        users[i].launch = true;
                        let oponent = ''
                        if (i == 0) { oponent = users[1].username } else { oponent = users[0].username }
                        users[i].message = users[i].username + ', grasz pionkami ' + kolor[i] + ' przeciwko ' + oponent
                    }

                    if (json.username == users[0].username) res.end(JSON.stringify(JSON.stringify(users[0])))
                    if (json.username == users[1].username) res.end(JSON.stringify(JSON.stringify(users[1])))
                }
            } else {
                res.end(JSON.stringify(JSON.stringify({ launch: true, id: 3, message: 'gra w toku' })))
            }
        }

    }
}

function ruch(req, res) {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
        res.writeHead(200, { "Content-type": "text/plain;charset=utf-8" });
        upcomingMoves.push(JSON.parse(data))
        upcomingMoves.push(JSON.parse(data))
        res.end(data)
    })
}

function requestmove(req, res) {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
        res.writeHead(200, { "Content-type": "text/plain;charset=utf-8" });

        if (upcomingMoves.length > 0) {
            
            console.log(data)
            console.log(upcomingMoves)

            let object = upcomingMoves[0]
            if(object != recentMove) {
                recentMove = object
            
                res.end(JSON.stringify(object)); 
                upcomingMoves.splice(0, 1)
            } else {
                res.end(JSON.stringify({x: null, z: null, color: null}))
            }
            
                            

        } else {
            res.end(data)
        }




    })
}

//tu wszystkie app.post
app.post('/login', (req, res) => logowanie(req, res));
app.post('/requestmove', (req, res) => requestmove(req, res));
app.post('/move', (req, res) => ruch(req, res));
app.get('/', (req, res) => res.sendFile(path.join(__dirname + "/static/html/index.html")));
app.listen(port, () => console.log("start serwera na porcie " + port))