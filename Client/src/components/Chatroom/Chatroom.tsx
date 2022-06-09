import { useEffect, useRef, useState } from 'react';
import './Chatroom.scss';
import { io } from 'socket.io-client';
import {
    saveToLocalStorage,
    getFromLocalStorage,
    deleteFromLocalStorage,
} from '../../Utilities/localStorage';

interface MessageDetails {
    messageDetails: {
        userId: string;
        name: string;
        imageUrl: string;
        messageId: string;
        message: string;
        time: Date;
    };
}

// Choose random image to be the user profile picture
const chooseImage = (list: []) => {
    return list[Math.floor(Math.random() * list.length)];
};

// My message component
const MyMessage = ({ messageDetails }: MessageDetails) => (
    <div className="chatroom__message  is-mine ">
        <img className="chatroom__avatar" src={messageDetails.imageUrl} />
        {/* <p className="my__message">{messageDetails.message}</p> */}
        <div>
            <p className="font-large flex_row reverse">{'You'}</p>
            <pre className="my__message">{messageDetails.message}</pre>
            <p className="my__time">{'10:30 am'}</p>
        </div>
    </div>
);

// Others message component
const OthersMessage = ({ messageDetails }: MessageDetails) => (
    <div className="chatroom__message">
        <img className="chatroom__avatar" src={messageDetails.imageUrl} />
        <div>
            <p className="font-large">{messageDetails.name}</p>
            <pre className="other__message">{messageDetails.message}</pre>
            <p className="other__time">{'10:30 am'}</p>
        </div>
    </div>
);

// Generate random unique id
const uniqueId = (prefix: string = '') => {
    if (prefix !== '') return prefix + Math.random().toString(16).slice(2);
    return 'id' + Math.random().toString(16).slice(2);
};

// Chatroom component
const Chatroom = () => {
    const SERVER_URL = 'http://localhost:3000'; // server url and port
    const [myId, setMyId] = useState<string | null>(null); // store the current user id
    const [myName, setMyName] = useState<string | null>(null); // store the current user name
    const [myImage, setMyImage] = useState<any | null>(null); // store the current user image
    const [imageList, setImageList] = useState<any>(null); // store the random image list
    const [socket, setSocket] = useState<any | null>(null); // store the socket
    const [message, setMessage] = useState<string>(''); // store the message
    const [chatHistory, setChatHistory] = useState<any | null>([]); // store the chat history
    const chatroomBodyRef = useRef<HTMLDivElement>(null); // store the chatroom body ref
    const [typingUser, setTypingUser] = useState<{
        id: string;
        name: string;
        isTyping: boolean;
    } | null>({
        id: '',
        name: '',
        isTyping: false,
    }); // store the typing user id and typing status

    // Mount the chatroom component
    useEffect(() => {
        // Get the random image list from the api
        fetch('https://picsum.photos/v2/list').then((res) => {
            res.json().then((data) => {
                //  Chek if local storage has the image
                const localStorageImage = getFromLocalStorage('image');
                if (localStorageImage) {
                    // Local storage has the image use it to set the image state
                    setMyImage(localStorageImage);
                } else {
                    // Local storage does not have the image use the random image from the api to set the image state
                    const img = chooseImage(data);
                    setImageList(data);
                    setMyImage(img);
                    saveToLocalStorage('image', img);
                }
            });
        });

        // set the socket with server url and port
        setSocket(io(SERVER_URL));

        // Check if local storage has the user id
        const localStorageUserId = getFromLocalStorage('userId');
        // Local storage has the user id use it to set the state
        if (localStorageUserId) {
            setMyId(localStorageUserId);
        } else {
            // Local storage does not have the user id generate new id and set the state
            const id = uniqueId('user-');
            setMyId(id);
            saveToLocalStorage('userId', id);
        }

        // Get name from local storage and set to myName state
        setMyName(getFromLocalStorage('name'));

        return () => {
            try {
                if (socket) {
                    socket.close(); // disconnect the socket
                    socket.removeAllListeners(); // removes all event listeners
                }
            } catch (error) {
                console.log(
                    '🧓 Could not complete the disconnect process ! ',
                    error
                );
            }
        };
    }, []);

    useEffect(() => {
        try {
            if (socket) {
                // Sockt connection has been established
                socket.on('connect', () => {
                    // Tell the server about the new user
                    socket.emit('user joined', { myId, myName });
                });
                // Listen for other user joined event
                socket.on('user joined', (data: any) => {
                    //Set the other user typing status to false - Client side

                    setTypingUser({
                        id: data.myId,
                        name: data.myName,
                        isTyping: false,
                    });
                    // Get the previous chat history
                    socket.emit('import chat');
                    // Set the typing user status to false - Server side
                    socket.emit('done typing', { myId, myName });
                });

                // Initializing the chat history
                socket.on('chat history', (params: any) => {
                    setChatHistory(params);
                });

                // When a new message is received
                socket.on('chat message', (msg: any) => {
                    setChatHistory((prevState: any) => {
                        // append the new message to the chat history
                        return [...prevState, msg];
                    });
                });

                // When other user is typing
                socket.on('typing', (data: any) => {
                    setTypingUser({
                        id: data.myId,
                        name: data.myName,
                        isTyping: true,
                    });
                });

                // When other user is not typing
                socket.on('done typing', (data: any) => {
                    setTypingUser({
                        id: data.myId,
                        name: data.myName,
                        isTyping: false,
                    });
                });
            }
        } catch (error) {
            console.log('👬 Something went wrong ! ', error);
        }
    }, [socket]);

    useEffect(() => {
        // Scroll to the bottom of the chatroom body
        if (chatroomBodyRef.current) {
            chatroomBodyRef.current.scrollTop =
                chatroomBodyRef.current.scrollHeight;
        }
        if (message.length > 0) {
            // Reset the message text area
            setMessage('');
        }

        return () => {};
    }, [chatHistory]);

    return (
        <div className="chatroom">
            <div className="chatroom__head">
                <h1>Chatingale</h1>
                <button
                    onClick={() => {
                        socket.emit('delete chat');
                    }}
                >
                    Delete Chat
                </button>
            </div>
            <div className="chatroom__body">
                <div className="chatroom__wrapper" ref={chatroomBodyRef}>
                    <p>{'My Id is ' + myId}</p>
                    <p>{'My Name is ' + myName}</p>
                    {chatHistory &&
                        chatHistory.map((item: any, index: number) => {
                            if (item.userId === myId) {
                                return (
                                    <MyMessage
                                        messageDetails={item}
                                        key={index}
                                    />
                                );
                            }

                            return (
                                <OthersMessage
                                    messageDetails={item}
                                    key={index}
                                />
                            );
                        })}
                    {typingUser?.isTyping && typingUser.id !== myId && (
                        <div className="chatroom__message">
                            <p>{typingUser.name + ' is typing'} </p>
                        </div>
                    )}
                </div>
            </div>
            <div className="chatroom__foot">
                <textarea
                    className="chatroom__textarea"
                    value={message}
                    onChange={(e) => {
                        if (e.target.value !== '') {
                            socket.emit('typing', { myId, myName });
                        } else {
                            socket.emit('done typing', { myId, myName });
                        }
                        setMessage(e.target.value);
                    }}
                />
                <button
                    className="chatroom__button"
                    onClick={() => {
                        //    message was empty or only white spaces
                        if (!message.trim() || message.length < 1) return null;

                        const newMessage = {
                            userId: myId,
                            name: myName,
                            imageUrl: myImage.download_url,
                            messageId: uniqueId(),
                            message: message.trim(),
                            time: new Date(),
                        };

                        // Send the message to the server
                        socket.emit('chat message', newMessage);
                        socket.emit('done typing', { myId, myName });

                        // Append the message to the chat history
                        setChatHistory((prevState: any) => {
                            // append the new message to the chat history
                            return [...prevState, newMessage];
                        });
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatroom;
