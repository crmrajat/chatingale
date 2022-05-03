import { Component } from 'react';
import './Chatroom.scss';
class Chatroom extends Component {
    render() {
        return (
            <div className="chatroom">
                <div className="chatroom__head">
                    <h1>Chatingale</h1>
                </div>
                <div className="chatroom__body">
                    <div className="chatroom__message  is-mine debugging">
                        <p>My Message 🐱‍👤</p>
                    </div>
                    <div className="chatroom__message debugging">
                        <p>Your Message 🐱‍🐉</p>
                    </div>
                </div>
                <div className="chatroom__foot">
                    <textarea className="chatroom__textarea" />
                    <button className="chatroom__button">Send</button>
                </div>
            </div>
        );
    }
}

export default Chatroom;
