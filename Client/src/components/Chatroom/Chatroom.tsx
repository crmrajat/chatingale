import { useEffect, useRef, useState } from 'react';
import './Chatroom.scss';
import avatar1 from '../../../src/assets/images/avatar1.png';
import avatar2 from '../../../src/assets/images/avatar2.png';

// Interface for the message props
interface MessageComponent {
    message: string;
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

// Chatroom component
const Chatroom = () => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { message: 'Your Message 🐱‍🐉', isMine: false },
        { message: 'My Message 🐲', isMine: true },
    ]); // store the chat history
    const chatroomBodyRef = useRef<HTMLDivElement>(null); // store the chatroom body ref

    useEffect(() => {
        // scroll to the bottom of the chatroom body
        if (chatroomBodyRef.current) {
            chatroomBodyRef.current.scrollTop =
                chatroomBodyRef.current.scrollHeight;
        }
    }, [chatHistory]);

    return (
        <div className="chatroom">
            <div className="chatroom__head">
                <h1>Chatingale</h1>
            </div>
            <div className="chatroom__body">
                <div className="chatroom__wrapper" ref={chatroomBodyRef}>
                    {chatHistory.map((item, index) => {
                        if (item.isMine) {
                            return (
                                <MyMessage message={item.message} key={index} />
                            );
                        }
                        return (
                            <OthersMessage message={item.message} key={index} />
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
                        setChatHistory((prevState) => {
                            // append the new message to the chat history
                            if (message.length < 1) return prevState;
                            return [...prevState, { message, isMine: true }];
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
