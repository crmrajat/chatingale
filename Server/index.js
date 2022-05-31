// Importing express
const express = require('express');
const app = express();

// Importing http module
const http = require('http');
const server = http.createServer(app);

// Creating the server
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: { origin: 'http://localhost:9999' },
});

// To serve the static files
const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));

// Handling GET / Request
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Listening to server at port 3000
server.listen(3000, () => {
    console.log(
        '- - - - - - - - - - - - 🤣 Server is running on port 3000 - - - - - - - - - - - - '
    );
});

// Socket event listener
io.on('connection', (socket) => {
    console.log('🎈 user connected = ', socket.id);
    console.log('😎The queue', log);
    console.log('👘Chat History', chatHistory);

    if (chatHistory.length === 0) {
        importChatHistory();
        console.log('👩‍👩‍👧‍👦Chat has been imported ');
    }

    socket.on('disconnect', () => {
        console.log('user disconnected 💀');
        // exportChatHistory();
    });

    socket.on('chat message', (msg) => {
        console.log('🎄 message: ', msg);
        io.emit('chat message', msg);
        log.enqueue(msg);
        console.log('🚀 ~ socket.on ~ log', log);
    });

    socket.on('chat history', (list) => {
        console.log('💑', list);
    });
});

/**
 * Using a Queue data structure to store the messages in the original sequence
 * enqueue from back , dequeue from front :     📥 | 5 | 4 | 3 | 2| 1 | 0 |📤
 */
class ChatHistory {
    constructor() {
        this.elements = {};
        this.head = 0; // Front of the queue
        this.tail = 0; // Back of the queue
    }

    // Append data from the back of the queue
    enqueue(message) {
        this.elements[this.tail] = message;
        this.tail++;
    }

    // Remove the message from the front of the queue
    dequeue() {
        if (this.head === this.tail) return null;
        const message = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return message;
    }

    // Return the length of the queue
    length() {
        return this.tail - this.head;
    }

    // Check if the queue is empty
    isEmpty() {
        return this.length() === 0;
    }
}

let log = new ChatHistory();

// fs module used to interact with the file system
const fs = require('fs');

let chatHistory = [];

// Export the chat history to a file
exportChatHistory = () => {
    fs.writeFile('chatHistory.txt', JSON.stringify(chatHistory), (err) => {
        if (err) throw err;
    });
};

// Import the chat history from a file
importChatHistory = () => {
    fs.readFile('chatHistory.txt', (err, data) => {
        if (err) throw err;
        chatHistory = JSON.parse(data);
    });
};
