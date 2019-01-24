import {createStackNavigator, createBottomTabNavigator} from 'react-navigation';
import * as Screen from '../screens';

const TrainSearchStack = createStackNavigator({
	TrainSearch: Screen.TrainSearchScreen,
	StationSelect: Screen.StationSelectScreen,
	Calendar: Screen.CalendarScreen,
}, {
	mode: 'modal',
	headerMode: 'none',
	navigationOptions: {
		title: '열차조회'
	}
});

const TrainStack = createStackNavigator({
	TrainSearch: TrainSearchStack,
	TrainList: Screen.TrainListScreen,
}, {
	initialRouteName: 'TrainSearch',
});
TrainStack.navigationOptions = {
	title: '열차조회',
}

const MacroStack = createStackNavigator({
	MacroList: Screen.MacroListScreen,
	MacroDetail: Screen.MacroDetailScreen,
}, {
	initialRouteName: 'MacroList',
});
MacroStack.navigationOptions = {
	title: '매크로',
}

const MypageStack = createStackNavigator({
	Mypage: Screen.MypageScreen,
})
MypageStack.navigationOptions = {
	title: '마이페이지'
}

export default createBottomTabNavigator({
	TrainStack,
	MacroStack,
	MypageStack,
});

