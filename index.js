var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
const  mongoose  = require('mongoose')
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/message");
const socket = require('socket.io');
require('dotenv').config()


const app = express()


app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });




const server = app.listen(process.env.PORT||9000,()=>{
    console.log("server running on "+process.env.PORT)
})

const io = socket(server, {
    cors: {
      origin: process.env.CLIENT,
      credentials: true,
    },
    maxHttpBufferSize: 1e8 // 100 MB
  });

 global.onlineUsers = new Map();


 io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });
  
    socket.on("send-msg", (data) => {

      const sendUserSocket = onlineUsers.get(data.to);
    
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        
      }
    });



    socket.on("typing_status",(data)=>{
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("typing_status", data.typingStatus);
          }

    })

    socket.on("upload_images",(data)=>{
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("recieve_images",data.message  );
            socket.to(sendUserSocket).emit("message_sent",{msg:"sent"}  );
          }


    })
  });















// var express = require("express")
// const cors = require('cors')
// const bodyParser = require('body-parser')
// const http = require('http');
// const mongoose = require('mongoose')
// const app = express()

// const server = http.createServer(app);

// const { Server } = require("socket.io");

// const io = new Server(server, {
//     cors: {
//         origin: 'http://localhost:3000',
//         methods: ["GET", "POST", "PUT", "DELETE"]
//     }
// });


// app.use(cors())
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))



// app.get('/', (req, res) => {
//     res.send("server running")
// })




// io.on('connection', (socket) => {
//     console.log('a user connected');

//     socket.on("join_room", (data) => {
       
//         socket.join(data)
//     })

//     socket.on("sendmessage", (data) => {
//          console.log(data.data.roomId, socket.id,data.data.msgdata)
//         //socket.broadcast.emit("recieve_message", data)

//         const roomid = data.data.roomId
//         socket.to(roomid).emit("recievemessage",data)

//     })


//     socket.on('disconnect', () => {
//         console.log('🔥: A user disconnected');
//       });




// });


// server.listen(9000, () => {
//     console.log("server running on port 9000")
// })