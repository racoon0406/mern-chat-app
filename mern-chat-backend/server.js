const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User')
const Message = require('./models/Message')
const rooms = ['general', 'tech', 'finance', 'crypto'];
const cors = require('cors');//course

app.use(express.urlencoded({extended: true}));// be able to receive data from fontend
app.use(express.json());
app.use(cors());

require('./connection');
app.use('/users', userRoutes);//api url with prefix /users, ex: /users/login


//create server
const server = require('http').createServer(app);
//create port
const PORT = 5001;
//web socket: communicate between the server and client -> send messages back and forth
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})


async function getLastMessagesFromRoom(room){
  let roomMessages = await Message.aggregate([//query the messages in mongodb
    {$match: {to: room}},
    {$group: {_id: '$date', messagesByDate: {$push: '$$ROOT'}}},//group a group of messages for each date
  ])
  return roomMessages;
}

// 02/11/2022
//date[0]=month, date[1]=day, date[2]=year
function sortRoomMessagesByDate(messages){
  return messages.sort(function(a, b){
    let date1 = a._id.split('/');//_id: date
    let date2 = b._id.split('/');
    date1 = date1[2] + date1[0] + date1[1]; //sort by year->month->day
    date2 = date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1
  })
}

//socket connection
io.on('connection', (socket) => {//socket from frontend (each user has his own socket)
  //if we have a new user, inform all the users
  socket.on('new-user', async() => {//login, event from frontend
    const members = await User.find();
    io.emit('new-user', members);//emit to all the users that connect to the socket, send back to frontend
  })

  //if we join a room, get all room messages
  socket.on('join-room', async(newRoom, previousRoom) => {//event sent from frontend, join a room by default
    socket.join(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom); //get messages by date
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit('room-messages', roomMessages) //emit to the specific user, send back event to client(frontend)
    //console.log(roomMessages)
  })

  //if we send a message, create a message and refresh room messages
  socket.on('message-room', async(room, content, sender, time, date) => {
    //console.log('new message', content);
    const newMessage = await Message.create({content, from: sender, time, date, to: room});//create a new Message
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    //sending messages to room
    io.to(room).emit('room-messages', roomMessages);

    socket.broadcast.emit('notifications', room);//tell other users there is a new message in this room
  })

  app.delete('/logout', async(req, res) => {
    try {
      const {_id, newMessages} = req.body;
      const user = await User.findById(_id);
      user.status = "offline";
      user.newMessages = newMessages;//from frontend
      await user.save();
      const members = await User.find();
      socket.broadcast.emit('new-user', members);//refresh members
      res.status(200).send();//success
    } catch (e) {
      console.log(e);
      res.status(400).send();
    }
  })
})


app.get('/rooms', (req, res) => {
  res.json(rooms)
})

server.listen(PORT, () => {
  console.log('listening to port', PORT)
})
