import React from 'react';
import {createStackNavigator, createBottomTabNavigator} from 'react-navigation';
import {BottomTabBar} from 'react-navigation-tabs';
import Icon from 'react-native-vector-icons/FontAwesome5';

import * as Screen from '../screens';
//import AdMobBanner from '../components/AdMobBanner';

const TrainSearchStack = createStackNavigator(
  {
    TrainSearch: Screen.TrainSearchScreen,
    StationSelect: Screen.StationSelectScreen,
    Calendar: Screen.CalendarScreen,
  },
  {
    mode: 'modal',
    headerMode: 'none',
    navigationOptions: {
      title: '열차조회',
    },
  },
);

const TrainStack = createStackNavigator(
  {
    TrainSearch: TrainSearchStack,
    TrainList: Screen.TrainListScreen,
  },
  {
    initialRouteName: 'TrainSearch',
  },
);
TrainStack.navigationOptions = {
  title: '열차조회',
};

const MacroStack = createStackNavigator(
  {
    MacroList: Screen.MacroListScreen,
    MacroDetail: Screen.MacroDetailScreen,
  },
  {
    initialRouteName: 'MacroList',
  },
);
MacroStack.navigationOptions = {
  title: '매크로',
};

const MypageStack = createStackNavigator({
  Mypage: Screen.MypageScreen,
});
MypageStack.navigationOptions = {
  title: '마이페이지',
};

export default createBottomTabNavigator(
  {
    TrainStack,
    MacroStack,
    MypageStack,
  },
  {
    //initialRouteName: 'MypageStack',
    defaultNavigationOptions: ({navigation}) => ({
      tabBarIcon: ({focused, horizontal, tintColor}) => {
        const {routeName} = navigation.state;
        if (routeName === 'TrainStack') {
          return <Icon name={'train'} size={25} color={tintColor} solid />;
        } else if (routeName === 'MacroStack') {
          return <Icon name={'retweet'} size={25} color={tintColor} solid />;
        } else if (routeName === 'MypageStack') {
          return <Icon name={'user'} size={25} color={tintColor} regular />;
        }
      },
    }),
    tabBarComponent: props => (
      <>
        {/* <AdMobBanner /> */}
        <BottomTabBar {...props} />
      </>
    ),
    tabBarOptions: {
      activeTintColor: '#334F70',
      inactiveTintColor: 'gray',
    },
  },
);
