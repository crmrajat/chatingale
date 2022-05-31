import { Key, useEffect, useRef, useState } from 'react';
import './Chatroom.scss';
import avatar1 from '../../../src/assets/images/avatar1.png';
import avatar2 from '../../../src/assets/images/avatar2.png';
import { io } from 'socket.io-client';

// Interface for the message props
interface MessageComponent {
    message: string;
}
interface ChatHistory {
    userId: string;
    messageId: string;
    message: string;
    time: Date;
}

// My message component
const MyMessage = ({ message }: MessageComponent) => {
    return (
        <div className="chatroom__message  is-mine ">
            <img className="chatroom__avatar" src={avatar1} />
            <p>{message}</p>
        </div>
    );
};

// Others message component
const OthersMessage = ({ message }: MessageComponent) => {
    return (
        <div className="chatroom__message">
            <img className="chatroom__avatar" src={avatar2} />
            <p>{message}</p>
        </div>
    );
};

// Generate random unique id
const uniqueId = (prefix: string = '') => {
    if (prefix !== '') return prefix + Math.random().toString(16).slice(2);
    return 'id' + Math.random().toString(16).slice(2);
};

// Chatroom component
const Chatroom = () => {
    // const myId state
    const [myId, setMyId] = useState<string | null>(null); // Store the current user id
    const [message, setMessage] = useState<string>(''); // Store the message
    const [chatHistory, setChatHistory] = useState<any | null>(null); // store the chat history
    const [socket, setSocket] = useState<any | null>(null); // store the socket
    const chatroomBodyRef = useRef<HTMLDivElement>(null); // store the chatroom body ref

    // Mount the chatroom component
    useEffect(() => {
        setSocket(io('http://localhost:3000')); // set the socket
        setMyId(uniqueId('user')); // set the current user id

        return () => {
            console.log('🤫', 'unmounting');
            socket.disconnect(); // disconnect the socket
        };
    }, []);

    useEffect(() => {
        console.log('🧘', 'useEffect - socket');
        if (socket) {
            // Initializing the chat history
            setChatHistory([
                {
                    userId: uniqueId('user'),
                    messageId: uniqueId(),
                    message: 'Your Message 🐱‍🐉',
                    time: new Date(),
                },
                {
                    userId: myId,
                    messageId: uniqueId(),
                    message: 'My Message 🐲',
                    time: new Date(),
                },
            ]);

            socket.on('chat message', (msg: any) => {
                console.log('🚀 ~ socket.on ~ chat message', msg);
            });
        }
        return () => {};
    }, [socket]);

    useEffect(() => {
        // Scroll to the bottom of the chatroom body
        if (chatroomBodyRef.current) {
            chatroomBodyRef.current.scrollTop =
                chatroomBodyRef.current.scrollHeight;
        }
        if (message.length > 0) {
            // Send the message and chat log to server
            console.log('🤫', 'chat history use effect');
            // socket.emit('chat message', message);
            // socket.emit('chat history', chatHistory);

            // Reset the message text area
            setMessage('');
        }
        return () => {};
    }, [chatHistory]);

    return (
        <div className="chatroom">
            <div className="chatroom__head">
                <h1>Chatingale</h1>
            </div>
            <div className="chatroom__body">
                <div className="chatroom__wrapper" ref={chatroomBodyRef}>
                    {chatHistory &&
                        chatHistory.map((item: ChatHistory, index: number) => {
                            if (item.userId === myId) {
                                return (
                                    <MyMessage
                                        message={item.message}
                                        key={index}
                                    />
                                );
                            }
                            return (
                                <OthersMessage
                                    message={item.message}
                                    key={index}
                                />
                            );
                        })}
                </div>
            </div>
            <div className="chatroom__foot">
                <textarea
                    className="chatroom__textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    className="chatroom__button"
                    onClick={() => {
                        const newMessage = {
                            userId: myId,
                            messageId: uniqueId(),
                            message,
                            time: new Date(),
                        };

                        socket.emit('chat message', newMessage);

                        setChatHistory((prevState: any) => {
                            // append the new message to the chat history
                            if (message.length < 1) return prevState;
                            console.log('🧥', prevState);
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
