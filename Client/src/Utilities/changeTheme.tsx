import '../Utilities/themes.scss';
import {
    getFromLocalStorage,
    saveToLocalStorage,
    deleteFromLocalStorage,
} from '../Utilities/localStorage';

export const changeTheme = (theme: string) => {
    const element = document.getElementById('root');
    if (element) {
        element.classList.value = theme;
        saveToLocalStorage('theme', theme);
        console.log('👨‍👨‍👦‍👦', element.classList.value);
    }
};
