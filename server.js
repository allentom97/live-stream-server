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
			io.to(webConnection).emit('connections-updated', connections) 
		} 
	});

	socket.on('disconnect', () => {
		console.log('socket closed', socket.id)
		delete connections[socket.id]
		if(counter > 1) {
			counter--;
		}
		io.to(webConnection).emit('removed-connection', socket.id, connections)
		io.to(webConnection).emit('connections-updated', connections)
	})
    
	socket.on('message', (toID, message) => {
		if(message.sender === 'web'){
			console.log('Web said: ', message)
			console.log('toMobID:', toID)
			io.to(toID).emit('message', message)
		} else if (message.sender === 'mobile'){
			console.log('Mobile said: ', message)
			console.log('toWebID: ', webConnection)
			io.to(webConnection).emit('message', socket.id, message)
		} 
	})

	socket.on('text-message', (toID, message) => {
		console.log('Web said: ', message)
		io.to(toID).emit('text-message', message)
	})

	socket.on('options-set', (toID, message) => {
		console.log('Web said: ', message)
		io.to(toID).emit('options-set', message)
	})

	socket.on('options-response', (message) => {
		console.log('Mobile said: ', message)
		io.to(webConnection).emit('options-response', socket.id, message)
	})

	

});

http.listen(process.env.PORT || 6500);