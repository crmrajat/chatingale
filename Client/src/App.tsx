import { useState } from 'react';
import './App.scss';
import Chatroom from './components/Chatroom/Chatroom';
import User from './components/User/User';

function App() {
    const [showChatroom, setShowChatroom] = useState(false); //Toggle between the chat room and the user form

    return (
        <div className="app">
            {showChatroom ? (
                <Chatroom />
            ) : (
                <User props={{ setShowChatroom: setShowChatroom }} />
            )}
        </div>
    );
}

export default App;
