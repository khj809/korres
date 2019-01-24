import uuidv4 from 'uuid/v4';
import dayjs from 'dayjs';
import {AsyncStorage} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import {Train, AdultPassenger, KorailError, SoldOutError, NeedToLoginError} from 'korailjs';

import korailClient, {initLogin} from '../api/korail';
import {MacroJobStore} from '../stores';
import {sendLocalNotification} from '../utils/notification';


const MACRO_JOBS_KEY = '@korres:macroJobs';

class MacroJob {
    constructor(data){
        this.uuid = uuidv4();
        this.train = data.train;
        this.passengers = data.passengers;
        this.reserveOption = data.reserveOption;
        this.intervalId = null;
    }

    run = async () => {
        if (!!this.intervalId){
            BackgroundTimer.clearInterval(this.intervalId);
        }

        const intervalId = BackgroundTimer.setInterval(async ()=>{
            const train = this.train;
            if (dayjs(train.getDeparture()).isBefore(dayjs())){
                this._log('열차가 이미 출발하였습니다. 매크로를 삭제합니다..');
                await this.stop();
                return;
            }

            this._log(`열차 예약을 시도하는 중...`);
            let rsvResult = null;
            try {
                rsvResult = await this._tryReserve();
            } catch(e){
                if (e instanceof SoldOutError){
                    this._log('잔여석이 없습니다. 5초 뒤에 다시 시도..');
                } else if (e instanceof NeedToLoginError){
                    this._log('로그인 세션이 만료되어 재로그인합니다..');
                    await initLogin();
                } else if (e instanceof KorailError){
                    this._log(e.msg);
                } else {
                    this._log(e.toString());
                }
                return;
            }

            if (!!rsvResult){
                console.log(rsvResult);
                this._log(`열차 예약에 성공하였습니다!`);
                sendLocalNotification(
                    '매크로 예약 완료!', 
                    `열차 예약이 완료되었습니다. 코레일 앱에서 예매를 완료해 주세요.`
                );
                await this.stop();
            }
        }, 5000);

        this.intervalId = intervalId;
        await this._register();
    }

    stop = async () => {
        BackgroundTimer.clearInterval(this.intervalId);
        await this._unregister();
    }

    _log = (message) => {
        MacroJobStore.addLog(this.uuid, message);
        console.log(message);
    }

    _register = async () => {
        let macroJobs = await MacroJob.loadMacroJobs();
        if (macroJobs.some(job => job.uuid === this.uuid)){
            const index = macroJobs.findIndex(job => job.uuid === this.uuid);
            macroJobs[index] = this;
        } else {
            macroJobs.push(this);
        }
        await MacroJob.storeMacroJobs(macroJobs);
    }

    _unregister = async () => {
        let macroJobs = await MacroJob.loadMacroJobs();
        macroJobs = macroJobs.filter(job => job.uuid !== this.uuid);
        await MacroJob.storeMacroJobs(macroJobs);
    }

    _tryReserve = async () => {
        const rsvResult = await korailClient.reserve(this.train, {
            passengers: [new AdultPassenger({count: this.passengers})], 
            reserveOption: this.reserveOption,
            timeout: 3000,
        });
        return rsvResult;
    }
}

MacroJob.fromJson = (jsonData) => {
    const job = new MacroJob({});
    job.uuid = jsonData.uuid;
    job.train = Train.fromJson(jsonData.train);
    job.passengers = jsonData.passengers;
    job.reserveOption = jsonData.reserveOption;
    job.intervalId = jsonData.intervalId;
    return job;
}

MacroJob.loadMacroJobs = async () => {
    let macroJobs = await AsyncStorage.getItem(MACRO_JOBS_KEY) || '[]';
    macroJobs = JSON.parse(macroJobs);
    macroJobs = macroJobs.map(jsonData => MacroJob.fromJson(jsonData));
    return macroJobs;
}

MacroJob.storeMacroJobs = async (macroJobs) => {
    await AsyncStorage.setItem(MACRO_JOBS_KEY, JSON.stringify(macroJobs));
}

MacroJob.initMacroJobs = async () => {
    let macroJobs = await MacroJob.loadMacroJobs();
    macroJobs.forEach(async (job) => {
        await job.run();
    });
}

MacroJob.clearMacroJobs = async () => {
    await MacroJob.storeMacroJobs([]);
}

export default MacroJob;