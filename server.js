const express = require("express")
const WebSocket = require("ws")
const http = require("http")

const app = express()
app.use(express.json())

// route test
app.get("/", (req,res)=>{
    res.send("Webhook server running")
})

const server = http.createServer(app)

const wss = new WebSocket.Server({ server })

let clients = []

wss.on("connection", ws => {

    console.log("UE connected")
    clients.push(ws)

    ws.on("close", ()=>{
        clients = clients.filter(c=>c!==ws)
    })
})

app.post("/webhook",(req,res)=>{

    const event = req.body

    if(event.event_type === "optimization_finished"){

        const url = event.data.rapidmodel["rapid.glb"]

        const msg = JSON.stringify({
            type:"model_ready",
            url:url
        })

        clients.forEach(c=>c.send(msg))
    }

    res.sendStatus(200)
})

const PORT = process.env.PORT || 3000
server.listen(PORT, ()=>{
    console.log("Server running on port",PORT)
})
