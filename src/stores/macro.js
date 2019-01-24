import {observable} from 'mobx';
import dayjs from 'dayjs';

class MacroJobStore {
    @observable jobLogs = {};

    addLog = (uuid, message) => {
        this.jobLogs[uuid] = this.jobLogs[uuid] || [];
        this.jobLogs[uuid].unshift({
            message,
            datetime: dayjs(),
        });
        this.jobLogs[uuid] = this.jobLogs[uuid].slice(0, 10);
    }

    clearLog = (uuid) => {
        this.jobLogs[uuid] = [];
    }
}

export default new MacroJobStore();
