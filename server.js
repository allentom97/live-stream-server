var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var webConnection;
connections = {};
io.on('connection', (socket) =>{


	socket.on('connected', (message) => {
		if(message.sender === 'web'){
			webConnection = socket.id;
		}
	});

	socket.on('mobile-connected', (message) => {
		if (message.sender === 'mobile'){
			if(Object.values(connections).includes(message.name)){
				io.to(socket.id).emit('name-taken')
			} else{
				connections[socket.id] = message.name;
				io.to(webConnection).emit('new-connection', socket.id, connections)
				io.to(socket.id).emit('mobile-connected')
			}
		} 
	})
	socket.on('disconnect', () => {
		delete connections[socket.id]
		io.to(webConnection).emit('removed-connection', socket.id, connections)
	})
    
	socket.on('message', (toID, message) => {
		if(message.sender === 'web'){
			io.to(toID).emit('message', message)
		} else if (message.sender === 'mobile'){
			io.to(webConnection).emit('message', socket.id, message)
		} 
	})

	socket.on('text-message', (toID, message) => {
		io.to(toID).emit('text-message', message)
	})

	socket.on('air', (toID, message) => {
		io.to(toID).emit('air', message)
	})

	socket.on('options-message', (toID, otherIDs, message) => {
		io.to(toID).emit('options-message', otherIDs, message)
	})

	socket.on('option-taken', (toID, otherIDs, message)=>{
		io.to(toID).emit('option-taken', socket.id, otherIDs, message)
	})

	socket.on('options-response', (message) => {
		io.to(webConnection).emit('options-response', connections[socket.id], message)
	})

	

});

server.listen(process.env.PORT || 6500, () => {
	if(process.env.PORT){
		console.log(process.env.PORT)
	} else {
		console.log('listening on 6500')
	}
});