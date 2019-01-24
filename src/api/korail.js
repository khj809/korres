import Korail from 'korailjs';
import {AsyncStorage} from 'react-native';

const korail = Korail;

const initLogin = async () => {
    try {
        const korailId = await AsyncStorage.getItem('@korres:korailId');
        const korailPw = await AsyncStorage.getItem('@korres:korailPw');
        if (!!korailId && !!korailPw){
            const loginResult = await korail.login(korailId, korailPw);
            if (!loginResult){
                await AsyncStorage.removeItem('@korres:korailId');
                await AsyncStorage.removeItem('@korres:korailPw');
            }
        }
    } catch(e){
        console.log(e);
    }
}

export default korail;
export {
    initLogin,
}
