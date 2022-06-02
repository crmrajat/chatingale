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
    console.log('😎The queue = ', chatHistoryQueue);

    // Listen for the disconnect event from client
    socket.on('disconnect', () => {
        console.log('user disconnected 💀');
    });

    // On receiving a message from the client
    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', msg);
        // Add the message to the chat history
        chatHistoryQueue.enqueue(msg);
        console.log('🚀 ~ socket.on ~ chat message = ', msg);
        console.log('🚀 ~ socket.on ~ log =', chatHistoryQueue);
    });

    // Listen for the typing event from the client
    socket.on('typing', (userId) => {
        socket.broadcast.emit('typing', userId);
    });

    // Listen for the stop typing event from the client
    socket.on('done typing', (userId) => {
        socket.broadcast.emit('done typing', userId);
    });

    // Listen for the import chat event from the client
    socket.on('import chat', () => {
        importChatHistory().then((data) => {
            // Set the current chat history to the imported chat history
            chatHistoryQueue = data;
            // Send the imported chat history to all the clients
            io.emit('chat history', enumurateChatHistory(chatHistoryQueue));
        });
    });

    // Listen for the export chat event from the client
    socket.on('export chat', () => {
        exportChatHistory(chatHistoryQueue);
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

let chatHistoryQueue = new ChatHistory();

// fs module used to interact with the file system
const fs = require('fs');

// Export the chat history to a file
exportChatHistory = (data) => {
    fs.writeFile('chatHistory.txt', JSON.stringify(data), (err) => {
        if (err) throw err;
    });
};

// Import the chat history from a file - returns a promise
importChatHistory = () => {
    const promise = new Promise((resolve, reject) => {
        fs.readFile('chatHistory.txt', (err, data) => {
            if (err) {
                reject(err);
            } else {
                // Check for empty file
                if (data.length === 0) {
                    resolve(new ChatHistory());
                } else {
                    let obj = new ChatHistory();
                    let response = JSON.parse(data);
                    // Created a new queue with the imported chat history
                    obj.elements = response.elements;
                    obj.head = response.head;
                    obj.tail = response.tail;
                    resolve(obj);
                }
            }
        });
    });

    return promise;
};

// Loop through the chat history and return a list - returns an array
enumurateChatHistory = (obj) => {
    // Return empty array as the chat history is empty
    if (obj.isEmpty()) return [];

    let chatHistoryList = [];
    for (var key in obj.elements) {
        /*
         *The current property is not a direct property of chatHistory
         *hasOwnProperty skip all the properties along the prototype chain
         */
        if (!obj.elements.hasOwnProperty(key)) continue;
        //Do your logic with the property here
        const element = obj.elements[key];
        chatHistoryList.push(element);
    }
    return chatHistoryList;
};

// add key value pairs to the local storage
const saveToLocalStorage = (key, value) => {
    console.log('🚀 ~ saveToLocalStorage', key, value);
    localStorage.setItem(key, JSON.stringify(value));
};

// get key value pairs from the local storage
const getFromLocalStorage = (key) => {
    console.log('🚀 ~ getFromLocalStorage', key);
    return JSON.parse(localStorage.getItem(key));
};

// delete key value pairs from the local storage
const deleteFromLocalStorage = (key) => {
    console.log('🚀 ~ deleteFromLocalStorage', key);
    localStorage.removeItem(key);
};
