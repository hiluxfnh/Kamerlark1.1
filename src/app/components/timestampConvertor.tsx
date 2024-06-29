const TimeStampConvertor=(timestamp)=>{
    let time:any = new Date(timestamp);
    time = time.toLocaleString();
    return time;
};
export default TimeStampConvertor;