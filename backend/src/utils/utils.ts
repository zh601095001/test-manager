import moment from "moment-timezone";
import {format} from 'date-fns';

function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getDateInUTC8() {
    return moment().tz('Asia/Shanghai').toDate();
}

function formatDate(date: Date): string {
    return format(date, 'yyyy/MM/dd HH:mm:ss');
}

export {
    formatDuration,
    getDateInUTC8,
    formatDate
}