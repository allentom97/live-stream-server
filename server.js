var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

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
		console.log('toMobID:', toID)
		io.to(toID).emit('text-message', message)
	})

	socket.on('options-message', (toID, otherIDs, message) => {
		console.log('Web said: ', message)
		console.log('toMobID:', toID)
		io.to(toID).emit('options-message', otherIDs, message)
	})

	socket.on('option-taken', (toID, otherIDs, message)=>{
		console.log('toMobID:', toID)
		io.to(toID).emit('option-taken', otherIDs, message)
	})

	socket.on('options-response', (message) => {
		console.log('Mobile said: ', message)
		io.to(webConnection).emit('options-response', socket.id, message)
	})

	

});

server.listen(process.env.PORT || 6500, () => {
	if(process.env.PORT){
		console.log(process.env.PORT)
	} else {
		console.log('listening on 6500')
	}
});