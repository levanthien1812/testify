export const generateChatName = (memberNames) => {
    const length = memberNames.length;
    if (length === 1) {
        return memberNames[0];
    }
    if (length === 2) {
        return `${memberNames[0]} and ${memberNames[1]}`;
    }
    return `${memberNames[0]}, ${memberNames[1]} and ${length - 2} others`;
};
