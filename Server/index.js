/**
console.log('🧞‍♂️ Global A ', global.a);
global.a = 22;
console.log('🧞‍♂️ Global A', global.a);
console.log('🤢Platform', process.platform);
process.on('exit', () => {console.log('😢', 'callback function)});
 */

const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));

// event handler for route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// event handler for http server
server.listen(3000, () => {
    console.log('🤣 Server is running on port 3000');
});

// event handler for socket
io.on('connection', (socket) => {
    console.log('a user connected');
});
