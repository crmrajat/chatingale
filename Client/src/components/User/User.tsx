import { useEffect, useRef, useState } from 'react';
import './User.scss';
import {
    saveToLocalStorage,
    getFromLocalStorage,
    deleteFromLocalStorage,
} from '../../Utilities/localStorage';

// User component
const User = ({ props }: any) => {
    const [name, setName] = useState(''); // name of the user

    // Mount the User component
    useEffect(() => {
        //  Chek if local storage has the name of the user
        const localStorageName = getFromLocalStorage('name');
        if (localStorageName) {
            // Local storage has the name use it to set the name state
            setName(localStorageName);
            // now navigate to the chat room 🐱‍🐉
            props.setShowChatroom(true);
        }

        return () => {
            // Unmount the User component
        };
    }, []);

    return (
        <div className="user">
            <div className="user__body">
                <label>Enter your Name 🐣</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
                <input
                    type="button"
                    onClick={() => {
                        //    name was empty or only white spaces
                        if (!name.trim() || name.length < 1) return null;

                        // Save the name to local storage
                        saveToLocalStorage('name', name.trim());
                        // now navigate to the chat room 🐱‍🐉
                        props.setShowChatroom(true);
                    }}
                    value="Click me"
                />
            </div>
        </div>
    );
};

export default User;
