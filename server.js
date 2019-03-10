var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var connections = {};

io.on('connection', (socket) =>{
    
  socket.on('message', (message) => {
    if(message.sender === 'web'){
		if(message.type === 'connected'){
			console.log('web-connected')
		} else {
			console.log('Client said: ', message)
			socket.broadcast.emit('message-for-mobile', message)
		}	
    } else if (message.sender === 'mobile'){
		if(message.type === 'connected'){
			console.log('mobile-connected')
		} else {
			console.log('Client said: ', message)
			socket.broadcast.emit('message-for-web', message)
		}
    } 
  })
});

http.listen(6500, () => {
  console.log('listening on *:6500');
});