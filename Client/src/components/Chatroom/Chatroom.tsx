import { useEffect, useRef, useState } from 'react';
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
const MyMessage = ({ message }: MessageComponent) => (
    <div className="chatroom__message  is-mine ">
        <img className="chatroom__avatar" src={avatar1} />
        <p>{message}</p>
    </div>
);

// Others message component
const OthersMessage = ({ message }: MessageComponent) => (
    <div className="chatroom__message">
        <img className="chatroom__avatar" src={avatar2} />
        <p>{message}</p>
    </div>
);

// Generate random unique id
const uniqueId = (prefix: string = '') => {
    if (prefix !== '') return prefix + Math.random().toString(16).slice(2);
    return 'id' + Math.random().toString(16).slice(2);
};

// Chatroom component
const Chatroom = () => {
    // const myId state
    const [myId, setMyId] = useState<string | null>(uniqueId('user')); // Store the current user id
    const [message, setMessage] = useState<string>(''); // Store the message
    const [chatHistory, setChatHistory] = useState<any | null>([]); // store the chat history
    const [socket, setSocket] = useState<any | null>(null); // store the socket
    const chatroomBodyRef = useRef<HTMLDivElement>(null); // store the chatroom body ref
    const [typingUser, setTypingUser] = useState<{
        id: string;
        isTyping: boolean;
    } | null>({
        id: '',
        isTyping: false,
    }); // store the typing user id and typing status
    const [isTyping, setIsTyping] = useState<boolean>(false); // store the typing state of the other user

    // Mount the chatroom component
    useEffect(() => {
        setSocket(io('http://localhost:3000')); // set the socket
        // setMyId(uniqueId('user')); // set the current user id

        return () => {
            try {
                console.log('🤫', 'unmounting');
                if (socket) {
                    console.log('👨‍❤️‍💋‍👨', 'Removing all the listeners');
                    socket.disconnect(); // disconnect the socket
                    socket.removeAllListeners(); // removes all listeners
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
            console.log('🧘', 'useEffect - socket');
            if (socket) {
                // Initializing the chat history
                socket.on('chat history', (params: any) => {
                    console.log('🚀 ~ socket.on ~ chat history', params);
                    setChatHistory(params);
                });

                socket.on('chat message', (msg: any) => {
                    console.log('🚀 ~ socket.on ~ chat message', msg);
                    setChatHistory((prevState: any) => {
                        // append the new message to the chat history
                        return [...prevState, msg];
                    });
                });

                socket.on('typing', (userId: string) => {
                    console.log('🚀 ~ socket.on ~ typing', userId);
                    setTypingUser({ id: userId, isTyping: true });
                });

                socket.on('done typing', (userId: string) => {
                    console.log('🚀 ~ socket.on ~ done typing', userId);
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
            // Send the message and chat log to server
            console.log('🤫', 'chat history use effect');
            // socket.emit('chat message', message);
            // socket.emit('chat history', chatHistory);
            console.log('🧥chatHistory state = ', chatHistory);

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
                    <p>{'My Name is ' + myId}</p>
                    {chatHistory &&
                        chatHistory.map((item: any, index: number) => {
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
                    {typingUser?.isTyping && (
                        <div className="chatroom__message">
                            <img className="chatroom__avatar" src={avatar2} />
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
                        socket.emit('typing', myId);
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
                <button
                    onClick={() => {
                        socket.emit('import chat');
                    }}
                >
                    Import the Chat
                </button>
                <button
                    onClick={() => {
                        socket.emit('export chat');
                    }}
                >
                    Export the Chat
                </button>
            </div>
        </div>
    );
};

export default Chatroom;
