import '../Utilities/themes.scss';
import { saveToLocalStorage } from '../Utilities/localStorage';

export const changeTheme = (theme: string) => {
    const element = document.getElementById('root');
    if (element) {
        element.classList.value = theme;
        saveToLocalStorage('theme', theme);
    }
};
