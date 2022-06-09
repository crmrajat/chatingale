// add key value pairs to the local storage
export const saveToLocalStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// get key value pairs from the local storage
export const getFromLocalStorage = (key: string) => {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
};

// delete key value pairs from the local storage
export const deleteFromLocalStorage = (key: string) => {
    localStorage.removeItem(key);
};
