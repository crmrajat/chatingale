import { useEffect, useRef, useState } from 'react';
import './Chatroom.scss';
import { io } from 'socket.io-client';
import {
    saveToLocalStorage,
    getFromLocalStorage,
    deleteFromLocalStorage,
} from '../../Utilities/localStorage';
import menuIcon from '../../assets/svg/menu.svg';
import { changeTheme } from '../../Utilities/changeTheme';

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

// Convert the date to hh:mm: a format
const convertTime = (data: Date) => {
    const d = new Date(data);
    return (
        (d.getHours() > 12 ? d.getHours() - 12 : d.getHours()) +
        ':' +
        d.getMinutes() +
        ' ' +
        (d.getHours() >= 12 ? 'PM' : 'AM')
    );
};

// Generate random unique id
const uniqueId = (prefix: string = '') => {
    if (prefix !== '') return prefix + Math.random().toString(16).slice(2);
    return 'id' + Math.random().toString(16).slice(2);
};

// Choose random image to be the user profile picture
const chooseImage = (list: []) => {
    return list[Math.floor(Math.random() * list.length)];
};

// My message component
const MyMessage = ({ messageDetails }: MessageDetails) => (
    <div className="chatroom__message  is-mine ">
        <img className="chatroom__avatar" src={messageDetails.imageUrl} />
        <div className="message__width">
            <p className="font-large flex_row reverse">{'You'}</p>

            <pre className="my__message">
                {messageDetails.message}
                <p className="time">{convertTime(messageDetails.time)}</p>
            </pre>
        </div>
    </div>
);

// Others message component
const OthersMessage = ({ messageDetails }: MessageDetails) => (
    <div className="chatroom__message">
        <img className="chatroom__avatar" src={messageDetails.imageUrl} />
        <div className="message__width">
            <p className="font-large">{messageDetails.name}</p>
            <pre className="other__message">
                {messageDetails.message}
                <p className="time">{convertTime(messageDetails.time)}</p>
            </pre>
        </div>
    </div>
);

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
    const [connectedUsers, setConnectedUsers] = useState<any | null>(null); // store the list of  typing user id and typing status];
    const chatroomBodyRef = useRef<HTMLDivElement>(null); // store the chatroom body ref

    // Mount the chatroom component
    useEffect(() => {
        // Get the random image list from the api
        fetch('https://picsum.photos/v2/list').then((res) => {
            res.json().then((data) => {
                //  Check if local storage has the image
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
                // Socket connection has been established
                socket.on('connect', () => {
                    // Tell the server about the new user
                    socket.emit('user joined', { myId, myName });
                });
                // Listen for other user joined event
                socket.on('user joined', (data: any) => {
                    //Set the connected user - Client side
                    setConnectedUsers(data);
                    // Get the previous chat history
                    socket.emit('import chat');
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
                    setConnectedUsers(data);
                });

                // When other user is not typing
                socket.on('done typing', (data: any) => {
                    setConnectedUsers(data);
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
        return () => {};
    }, [chatHistory]);

    return (
        <div className="chatroom">
            <div className="chatroom--width">
                <nav className="chatroom__head">
                    <h1>Chatingale</h1>

                    <div className="chatroom__options">
                        <img
                            src={menuIcon}
                            alt="menu icon"
                            className="chatroom__icon"
                            onClick={() => {
                                document
                                    .getElementsByClassName(
                                        'chatroom__dropdown__wrapper'
                                    )[0]
                                    .classList.toggle('hide');
                                document
                                    .getElementsByClassName(
                                        'chatroom__dropdown'
                                    )[0]
                                    .classList.toggle('hide');
                                document
                                    .getElementsByClassName('chatroom__icon')[0]
                                    .classList.toggle('active');
                            }}
                        />

                        <div className="chatroom__dropdown hide">
                            <button
                                onClick={() => {
                                    socket.emit('delete chat');
                                }}
                            >
                                Delete Chat 👀
                            </button>
                            <button
                                onClick={() => {
                                    deleteFromLocalStorage('name');
                                    deleteFromLocalStorage('userId');
                                    deleteFromLocalStorage('image');
                                    window.location.reload();
                                }}
                            >
                                Leave Chatroom 🏃🏽
                            </button>

                            <button onClick={() => changeTheme('')}>
                                Default Theme 🧁
                            </button>
                            <button onClick={() => changeTheme('theme-1')}>
                                Theme 🌌
                            </button>
                            <button onClick={() => changeTheme('theme-2')}>
                                Theme 🦄
                            </button>
                            <button onClick={() => changeTheme('theme-3')}>
                                Theme 🥝
                            </button>
                            <button onClick={() => changeTheme('theme-4')}>
                                Theme 🌺
                            </button>
                            <button onClick={() => changeTheme('theme-5')}>
                                Theme 🌲
                            </button>
                            <button onClick={() => changeTheme('theme-6')}>
                                Theme 🍊
                            </button>
                            <button onClick={() => changeTheme('theme-7')}>
                                Theme 🍇
                            </button>
                            <button onClick={() => changeTheme('theme-8')}>
                                Theme 🌼
                            </button>
                            <button onClick={() => changeTheme('theme-9')}>
                                Theme 🛸
                            </button>
                            <button onClick={() => changeTheme('theme-10')}>
                                Theme 🚀
                            </button>
                        </div>
                        <div
                            className="chatroom__dropdown__wrapper hide"
                            onClick={() => {
                                document
                                    .getElementsByClassName(
                                        'chatroom__dropdown__wrapper'
                                    )[0]
                                    .classList.add('hide');
                                document
                                    .getElementsByClassName(
                                        'chatroom__dropdown'
                                    )[0]
                                    .classList.add('hide');
                                document
                                    .getElementsByClassName('chatroom__icon')[0]
                                    .classList.remove('active');
                            }}
                        ></div>
                    </div>
                </nav>
                <div className="chatroom__body" ref={chatroomBodyRef}>
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
                    {
                        // Typing users
                        connectedUsers &&
                            connectedUsers.map((user: any, index: number) => {
                                if (user.id !== myId && user.isTyping) {
                                    return (
                                        <div
                                            className="chatroom__typing"
                                            key={index}
                                        >
                                            <p>{user.name} is typing...</p>
                                        </div>
                                    );
                                }
                            })
                    }
                </div>
                <div className="chatroom__foot">
                    <textarea
                        className="chatroom__textarea"
                        value={message}
                        maxLength={2000}
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
                            if (!message.trim() || message.length < 1)
                                return null;

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

                            // Reset the message text area
                            setMessage('');
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatroom;
