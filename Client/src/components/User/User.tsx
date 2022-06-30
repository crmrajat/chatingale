import { useEffect, useRef, useState } from 'react';
import './User.scss';
import {
    saveToLocalStorage,
    getFromLocalStorage,
    deleteFromLocalStorage,
} from '../../Utilities/localStorage';

import background from '../../assets/background.svg';

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
            // now navigate to the chat room 🐱
            props.setShowChatroom(true);
        }

        return () => {
            // Unmount the User component
        };
    }, []);

    return (
        <div className="user">
            <div className="user__background">
                <div className="user__placeholder">
                    <h1>Chatingale</h1>
                </div>

                <div className="user__body">
                    <label className="user__label">Enter your Name</label>
                    <input
                        className="user__input"
                        type="text"
                        maxLength={30}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />
                    <input
                        className="user__button"
                        type="button"
                        onClick={() => {
                            //    name was empty or only white spaces
                            if (!name.trim() || name.length < 1) return null;

                            // Save the name to local storage
                            saveToLocalStorage('name', name.trim());
                            // now navigate to the chat room 🐱
                            props.setShowChatroom(true);
                        }}
                        value="Start Now"
                    />
                </div>
                <div className="user__placeholder"></div>
            </div>
        </div>
    );
};

export default User;
