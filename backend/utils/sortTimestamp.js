function sortMessagesByTimestampDescending(messages) {
    return messages.sort((a, b) => {
        const timestampA = a.timestamp;
        const timestampB = b.timestamp;

        const timeA = convertTo24HourFormat(timestampA);
        const timeB = convertTo24HourFormat(timestampB);

        if (timeA > timeB) {
            return -1;
        } else if (timeA < timeB) {
            return 1;
        } else {
            return 0;
        }
    });
}

function convertTo24HourFormat(timestamp) {
    const [time, period] = timestamp.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let convertedHours = hours;

    if (period.toLowerCase() === 'pm' && hours !== 12) {
        convertedHours += 12;
    } else if (period.toLowerCase() === 'am' && hours === 12) {
        convertedHours = 0;
    }

    // Ensure hours and minutes are two digits
    const formattedHours = String(convertedHours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

module.exports = {
    sortMessagesByTimestampDescending,
};
