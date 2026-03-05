const express = require("express")
const http = require("http")
const WebSocket = require("ws")

const app = express()
app.use(express.json())

// health check
app.get("/", (req,res)=>{
  res.send("RapidPipeline Webhook Server Running")
})

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

let clients = []

wss.on("connection",(ws)=>{
  console.log("UE connected")
  clients.push(ws)

  ws.on("close",()=>{
    clients = clients.filter(c=>c!==ws)
  })
})

// webhook endpoint
app.post("/webhook",(req,res)=>{

  const event = req.body

  if(event.event_type === "optimization_finished"){

    const modelUrl = event.data.rapidmodel["rapid.glb"]

    const payload = JSON.stringify({
      event:"model_ready",
      url:modelUrl
    })

    clients.forEach(c=>{
      if(c.readyState === WebSocket.OPEN){
        c.send(payload)
      }
    })
  }

  res.sendStatus(200)
})

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
  console.log("Server running",PORT)
})
