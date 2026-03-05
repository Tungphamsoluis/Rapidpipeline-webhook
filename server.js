const express = require("express")
const WebSocket = require("ws")

const app = express()
app.use(express.json())

const server = app.listen(process.env.PORT || 3000)

const wss = new WebSocket.Server({ server })

let clients = []

wss.on("connection", ws => {
    clients.push(ws)
    console.log("UE connected")
})

app.post("/webhook", (req,res)=>{

    const event = req.body

    if(event.event_type === "optimization_finished"){

        const model = event.data.rapidmodel["rapid.glb"]

        const msg = JSON.stringify({
            type:"model_ready",
            url:model
        })

        clients.forEach(c=>c.send(msg))
    }

    res.sendStatus(200)
})
