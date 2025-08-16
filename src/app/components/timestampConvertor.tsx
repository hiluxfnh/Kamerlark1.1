const TimeStampConvertor = (timestamp: any) => {
    try {
        let date: any;
        if (timestamp?.toDate) {
            date = timestamp.toDate();
        } else if (typeof timestamp === 'number') {
            date = new Date(timestamp);
        } else if (typeof timestamp === 'string') {
            const n = Number(timestamp);
            date = isNaN(n) ? new Date(timestamp) : new Date(n);
        } else {
            date = new Date();
        }
        return date.toLocaleString();
    } catch (e) {
        return '';
    }
};
export default TimeStampConvertor;