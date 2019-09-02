import {createMaterialTopTabNavigator} from 'react-navigation';

import ReservationListScreen from '../screens/ReservationListScreen';
import TicketListScreen from '../screens/TicketListScreen';


export default createMaterialTopTabNavigator({
    ReservationListScreen,
    TicketListScreen,
}, {
    tabBarOptions: {
        style: {
            backgroundColor: 'white'
        },
        labelStyle: {
            color: 'black'
        },
        indicatorStyle: {
            backgroundColor: '#334F70'
        }
    }
});