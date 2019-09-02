import React from 'react';
import {AsyncStorage} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import styled from 'styled-components/native';
import dayjs from 'dayjs';

import Text from '../components/MyText';
import colors from '../constants/colors';
import {dayOfWeek} from '../utils/date';

const RECENT_DEP_NAME_KEY = '@korres:recentDepName';
const RECENT_ARR_NAME_KEY = '@korres:recentArrName';
const DEFAULT_DEP_NAME = '서울';
const DEFAULT_ARR_NAME = '부산';
const MAX_PASSENGERS = 9;

export default class TrainSearchScreen extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      depName: DEFAULT_DEP_NAME,
      arrName: DEFAULT_ARR_NAME,
      depDate: dayjs(),
      passengers: 1,
    };
    AsyncStorage.getItem(RECENT_DEP_NAME_KEY).then(recentDepName => {
      this.setState({depName: recentDepName || DEFAULT_DEP_NAME});
    });
    AsyncStorage.getItem(RECENT_ARR_NAME_KEY).then(recentArrName => {
      this.setState({arrName: recentArrName || DEFAULT_ARR_NAME});
    });
  }

  handleChangeStation = stationType => {
    const stationKey = `${stationType}Name`;
    this.props.navigation.navigate('StationSelect', {
      station: this.state[stationKey],
      onStationSelected: station => {
        this.setState({[stationKey]: station});
      },
    });
  };

  handleSwitchStation = () => {
    this.setState({
      depName: this.state.arrName,
      arrName: this.state.depName,
    });
  };

  handleChangeDateTime = () => {
    this.props.navigation.navigate('Calendar', {
      onDateSelected: date => {
        this.setState({depDate: dayjs(date.toDate())});
      },
    });
  };

  handleChangePassengers = isInc => {
    let passengers = this.state.passengers;
    if (isInc && passengers < MAX_PASSENGERS) {
      passengers += 1;
    } else if (!isInc && passengers > 1) {
      passengers -= 1;
    }
    this.setState({passengers});
  };

  handleSearchTrain = async () => {
    await AsyncStorage.setItem(RECENT_DEP_NAME_KEY, this.state.depName);
    await AsyncStorage.setItem(RECENT_ARR_NAME_KEY, this.state.arrName);
    this.props.navigation.navigate('TrainList', {...this.state});
  };

  render() {
    return (
      <RootView>
        <StationContainer>
          <DepartureView onPress={() => this.handleChangeStation('dep')}>
            <Text>출발</Text>
            <Text color={colors.main} fontSize={30}>
              {this.state.depName}
            </Text>
          </DepartureView>
          <StationSwitchView onPress={this.handleSwitchStation}>
            <Icon name={'arrows-alt-h'} size={25} />
          </StationSwitchView>
          <ArrivalView onPress={() => this.handleChangeStation('arr')}>
            <Text>도착</Text>
            <Text color={colors.main} fontSize={30}>
              {this.state.arrName}
            </Text>
          </ArrivalView>
        </StationContainer>
        <DateTimeContainer>
          <Text>출발일</Text>
          <DateTimeView onPress={this.handleChangeDateTime}>
            <Text color={colors.main} fontSize={25}>
              {this.state.depDate.format(
                `YYYY년 MM월 DD일 (${
                  dayOfWeek[this.state.depDate.format('ddd')]
                }) HH:mm`,
              )}
            </Text>
          </DateTimeView>
        </DateTimeContainer>
        <PassengerContainer>
          <Text>승객수</Text>
          <PassengerControllerView>
            <PassengerTypeView>
              <Text fontSize={20}>어른(만 14세 이상)</Text>
            </PassengerTypeView>
            <PassengerCountView>
              <PassengerCountButton
                disabled={this.state.passengers <= 1}
                onPress={() => {
                  this.handleChangePassengers(false);
                }}>
                <Text color="white">-</Text>
              </PassengerCountButton>
              <Text color={colors.main} fontSize={20}>
                {this.state.passengers}명
              </Text>
              <PassengerCountButton
                disabled={this.state.passengers >= MAX_PASSENGERS}
                onPress={() => {
                  this.handleChangePassengers(true);
                }}>
                <Text color="white">+</Text>
              </PassengerCountButton>
            </PassengerCountView>
          </PassengerControllerView>
        </PassengerContainer>
        <SearchButtonContainer>
          <SearchButton onPress={this.handleSearchTrain}>
            <Text color="white" fontSize={30}>
              열차 조회하기
            </Text>
          </SearchButton>
        </SearchButtonContainer>
      </RootView>
    );
  }
}

const RootView = styled.View`
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: #fff;
  padding-left: 10;
  padding-right: 10;
`;

const StationContainer = styled.View`
  flex-direction: row;
  height: 25%;
  border-bottom-width: 1;
  border-bottom-color: #d1d1d1;
`;

const DepartureView = styled.TouchableOpacity`
  width: 40%;
  justify-content: center;
  align-items: center;
`;

const StationSwitchView = styled.TouchableOpacity`
  width: 20%;
  justify-content: center;
  align-items: center;
`;

const ArrivalView = styled.TouchableOpacity`
  width: 40%;
  justify-content: center;
  align-items: center;
`;

const DateTimeContainer = styled.View`
  height: 25%;
  align-items: center;
  justify-content: center;
  border-bottom-width: 1;
  border-bottom-color: #d1d1d1;
`;

const DateTimeView = styled.TouchableOpacity`
  width: 100%;
  height: 50%;
  align-items: center;
  justify-content: center;
`;

const PassengerContainer = styled.View`
  height: 30%;
  align-items: center;
  justify-content: center;
`;

const PassengerControllerView = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 50%;
`;

const PassengerTypeView = styled.View`
  flex-direction: row;
  width: 60%;
  align-content: center;
  justify-content: space-around;
`;

const PassengerCountView = styled.View`
  flex-direction: row;
  width: 40%;
  align-items: center;
  justify-content: space-around;
`;

const PassengerCountButton = styled.TouchableOpacity`
  width: 20;
  height: 20;
  background-color: ${props => (props.disabled ? 'gray' : '#334F70')};
  align-items: center;
  justify-content: center;
  border-radius: 10;
`;

const SearchButtonContainer = styled.View`
  height: 20%;
  align-items: center;
  justify-content: center;
`;

const SearchButton = styled.TouchableOpacity`
  background-color: #334f70;
  align-items: center;
  justify-content: center;
  width: 90%;
  height: 90%;
  border-radius: 15;
`;
