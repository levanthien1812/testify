export const shorten = (str, max_length = 50) => {
    if (str.length > max_length) {
        return str.slice(0, max_length) + "...";
    }
    return str;
};
