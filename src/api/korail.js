import Korail from 'korailjs';
import {AsyncStorage} from 'react-native';

import {UserStore} from '../stores';

const korail = Korail;
const KORAIL_ID_KEY = '@korres:korailId';
const KORAIL_PW_KEY = '@korres:korailPw';

const login = async (_korailId, _korailPw) => {
    try {
        const korailId = _korailId || await AsyncStorage.getItem(KORAIL_ID_KEY);
        const korailPw = _korailPw || await AsyncStorage.getItem(KORAIL_PW_KEY);
        if (!!korailId && !!korailPw){
            const loginResult = await korail.login(korailId, korailPw);
            if (!loginResult){
                await AsyncStorage.removeItem(KORAIL_ID_KEY);
                await AsyncStorage.removeItem(KORAIL_PW_KEY);
            } else {
                await AsyncStorage.setItem(KORAIL_ID_KEY, korailId);
                await AsyncStorage.setItem(KORAIL_PW_KEY, korailPw);
            }
            UserStore.setLoggedIn(korail.logined);
            return korail.logined;
        }
    } catch(e){
        console.log(e);
    }
}

const logout = async () => {
    try {
        await AsyncStorage.removeItem(KORAIL_ID_KEY);
        await AsyncStorage.removeItem(KORAIL_PW_KEY);
        UserStore.setLoggedIn(false);
    } catch(e){
        console.log(e);
    }
}

export default korail;
export {
    login,
    logout,
}
