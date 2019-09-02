import {observable} from 'mobx';
import korail from '../api/korail';

class UserStore {
    @observable isLoggedIn = false;
    @observable userInfo = {};

    setLoggedIn = (logined) => {
        if (logined){
            this.userInfo = {
                username: korail.name,
                membershipNumber: korail.membership_number,
            }
        } else {
            this.userInfo = {};
        }
        this.isLoggedIn = logined;
    }
}

export default new UserStore();