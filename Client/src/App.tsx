import { useEffect, useState } from 'react';
import './App.scss';
import Chatroom from './components/Chatroom/Chatroom';
import User from './components/User/User';
import { changeTheme } from './Utilities/changeTheme';
import { getFromLocalStorage } from './Utilities/localStorage';

function App() {
    const [showChatroom, setShowChatroom] = useState(false); //Toggle between the chat room and the user form

    useEffect(() => {
        // Get the current theme form the local storage
        const theme = getFromLocalStorage('theme');
        changeTheme(theme);
    }, []);

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
