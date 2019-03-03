var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) =>{
    console.log('a user connected');

    socket.on('offer',  (data) => {
        console.log(data)
        console.log('relaying offer');
        socket.broadcast.emit('offer', data);
      });
    
      socket.on('answer', (data) => {
        console.log('relaying answer');
        socket.broadcast.emit('answer', data);
      });
    
      socket.on('candidate',  (data) => {
        console.log('relaying candidate');
        socket.broadcast.emit('candidate', data);
      });

});

http.listen(6500, () => {
  console.log('listening on *:6500');
});