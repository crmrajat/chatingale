import { useEffect, useRef, useState } from 'react';
import './Chatroom.scss';
import avatar1 from '../../../src/assets/images/avatar1.png';
import avatar2 from '../../../src/assets/images/avatar2.png';
import { io } from 'socket.io-client';

interface MessageDetails {
    messageDetails: {
        userId: string;
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

// add key value pairs to the local storage
const saveToLocalStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// get key value pairs from the local storage
const getFromLocalStorage = (key: string) => {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
};

// delete key value pairs from the local storage
const deleteFromLocalStorage = (key: string) => {
    localStorage.removeItem(key);
};

// My message component
const MyMessage = ({ messageDetails }: MessageDetails) => (
    <div className="chatroom__message  is-mine ">
        <img className="chatroom__avatar" src={messageDetails.imageUrl} />

        <p>{messageDetails.message}</p>
    </div>
);

// Others message component
const OthersMessage = ({ messageDetails }: MessageDetails) => (
    <div className="chatroom__message">
        <img className="chatroom__avatar" src={messageDetails.imageUrl} />

        <p>{messageDetails.message}</p>
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
    const [myImage, setMyImage] = useState<any | null>(null); // store the current user image
    const [imageList, setImageList] = useState<any>(null); // store the random image list
    const [socket, setSocket] = useState<any | null>(null); // store the socket
    const [message, setMessage] = useState<string>(''); // store the message
    const [chatHistory, setChatHistory] = useState<any | null>([]); // store the chat history
    const chatroomBodyRef = useRef<HTMLDivElement>(null); // store the chatroom body ref
    const [typingUser, setTypingUser] = useState<{
        id: string;
        isTyping: boolean;
    } | null>({
        id: '',
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
                    console.log('🚀 ~ Api for image list called ', data);
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
                    // Get the previous chat history
                    socket.emit('import chat');
                    // Tell the server about the new user
                    socket.emit('user joined', myId);
                });

                // Listen for other user joined event
                socket.on('user joined', (userId: string) => {
                    setTypingUser({
                        id: userId,
                        isTyping: false,
                    });
                    socket.emit('done typing', userId);
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
                socket.on('typing', (userId: string) => {
                    setTypingUser({ id: userId, isTyping: true });
                });

                // When other user is not typing
                socket.on('done typing', (userId: string) => {
                    setTypingUser({ id: userId, isTyping: false });
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
                    <p>{'My Name is ' + myId}</p>
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
                            <p>{typingUser.id + ' is typing'} </p>
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
                            socket.emit('typing', myId);
                        } else {
                            socket.emit('done typing', myId);
                        }
                        setMessage(e.target.value);
                    }}
                />
                <button
                    className="chatroom__button"
                    onClick={() => {
                        // Empty message guard
                        if (message.length < 1) return null;

                        const newMessage = {
                            userId: myId,
                            imageUrl: myImage.download_url,
                            messageId: uniqueId(),
                            message,
                            time: new Date(),
                        };

                        // Send the message to the server
                        socket.emit('chat message', newMessage);
                        socket.emit('done typing', myId);

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
