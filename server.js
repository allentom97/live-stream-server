var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var webConnection;
connections = {};
counter = 1
io.on('connection', (socket) =>{


	socket.on('connected', (message) => {
		if(message.sender === 'web'){
			console.log('web-connected')
			webConnection = socket.id;
		} else if (message.sender === 'mobile'){
			console.log('mobile-connected')
			connections[socket.id] = counter;
			counter++;
			io.to(webConnection).emit('new-connection', socket.id, connections)
		} 
	});

	socket.on('disconnect', () => {
		console.log('socket closed', socket.id)
		console.log('before ',connections)
		delete connections[socket.id]
		if(counter > 1) {
			counter--;
		}
		console.log('after ',connections)
		io.to(webConnection).emit('removed-connection', connections)
	})
    
	socket.on('message', (toID, message) => {
		if(message.sender === 'web'){
			console.log('Client said: ', message)
			console.log('toMobID:', toID)
			io.to(toID).emit('message', message)
		} else if (message.sender === 'mobile'){
			console.log('Client said: ', message)
			console.log('toWebID: ', webConnection)
			io.to(webConnection).emit('message', socket.id, message)
		} 
	})
});

http.listen(6500, () => {
  console.log('listening on *:6500');
});