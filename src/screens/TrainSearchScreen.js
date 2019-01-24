import React from 'react';
import {View, Text, Button, AsyncStorage} from 'react-native';
import styled from 'styled-components/native';
import dayjs from 'dayjs';
import {dayOfWeek} from '../utils/date';

const RECENT_DEP_NAME_KEY = '@korres:recentDepName';
const RECENT_ARR_NAME_KEY = '@korres:recentArrName';
const DEFAULT_DEP_NAME = '서울';
const DEFAULT_ARR_NAME = '부산';

export default class TrainSearchScreen extends React.Component {
    constructor(props, context){
        super(props, context);
        this.state = {
            depName: DEFAULT_DEP_NAME,
            arrName: DEFAULT_ARR_NAME,
            depDate: dayjs(),
            passengers: 1,
        }
        AsyncStorage.getItem(RECENT_DEP_NAME_KEY).then((recentDepName) => {
            this.setState({depName: recentDepName || DEFAULT_DEP_NAME});
        });
        AsyncStorage.getItem(RECENT_ARR_NAME_KEY).then((recentArrName) => {
            this.setState({arrName: recentArrName || DEFAULT_ARR_NAME});
        });
    }

    handleChangeStation = (stationType) => {
        const stationKey = `${stationType}Name`;
        this.props.navigation.navigate('StationSelect', {
            station: this.state[stationKey],
            onStationSelected: (station) => {
                this.setState({[stationKey]: station});
            }
        });
    }

    handleSwitchStation = () => {
        this.setState({
            depName: this.state.arrName,
            arrName: this.state.depName,
        });
    }

    handleChangeDateTime = () => {
        this.props.navigation.navigate('Calendar', {
            onDateSelected: (date) => {this.setState({depDate: dayjs(date.toDate())})}
        });
    }

    handleChangePassengers = (isInc) => {
        let passengers = this.state.passengers;
        if (isInc && passengers < 9){
            passengers += 1;
        } else if (!isInc && passengers > 1){
            passengers -= 1;
        }
        this.setState({passengers});
    }
    
    handleSearchTrain = async () => {
        await AsyncStorage.setItem(RECENT_DEP_NAME_KEY, this.state.depName);
        await AsyncStorage.setItem(RECENT_ARR_NAME_KEY, this.state.arrName);
        this.props.navigation.navigate('TrainList', {...this.state});
    }

    render(){
        return (
            <RootView>
                <StationContainer>
                    <DepartureView onPress={() => this.handleChangeStation('dep')}>
                        <Text>출발</Text>
                        <StationText>{this.state.depName}</StationText>
                    </DepartureView>
                    <StationSwitchView onPress={this.handleSwitchStation}>
                        <Text>{'<->'}</Text>
                    </StationSwitchView>
                    <ArrivalView onPress={() => this.handleChangeStation('arr')}>
                        <Text>도착</Text>
                        <StationText>{this.state.arrName}</StationText>
                    </ArrivalView>
                </StationContainer>
                <DateTimeContainer>
                    <Text>출발일</Text>
                    <DateTimeView onPress={this.handleChangeDateTime}>
                        <DateTimeText>{this.state.depDate.format(`YYYY년 MM월 DD일 (${dayOfWeek[this.state.depDate.format('ddd')]}) HH:mm`)}</DateTimeText>
                    </DateTimeView>
                </DateTimeContainer>
                <PassengerContainer>
                    <Text>승객수</Text>
                    <PassengerCountView>
                        <Button title="-" onPress={() => {this.handleChangePassengers(false);}}></Button>
                        <Text>{this.state.passengers}명</Text>
                        <Button title="+" onPress={() => {this.handleChangePassengers(true);}}></Button>
                    </PassengerCountView>
                </PassengerContainer>
                <SearchButton title="열차조회" onPress={this.handleSearchTrain}></SearchButton>
            </RootView>
        );
    }
}

const RootView = styled.View`
    flex: 1;
    width: 100%;
    height: 200;
    background-color: #fff;
`

const StationContainer = styled.View`
    flex: 1;
    flex-direction: row;
    height: 100;
`;

const DepartureView = styled.TouchableOpacity`
    width: 40%;
    height: auto;
	justify-content: center;
	align-items: center;
`;

const StationSwitchView = styled.TouchableOpacity`
    width: 20%;
    justify-content: center;
    align-items: center;
`

const ArrivalView = styled.TouchableOpacity`
    width: 40%;
    height: auto;
	justify-content: center;
	align-items: center;
`

const StationText = styled.Text`
    font-size: 30;
`

const DateTimeContainer = styled.View`
    flex: 1;
    height: 100;
	align-items: center;
`

const DateTimeView = styled.TouchableOpacity`
    width: 100%;
    align-items: center;
`

const DateTimeText = styled.Text`
    font-size: 25;
`

const PassengerContainer = styled.View`
    flex: 1;
    height: 100;
    align-items: center;
`

const PassengerCountView = styled.View`
    flex: 1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 50%;
`

const SearchButton = styled.Button`
    width: 80%;
    position: absolute;
    bottom: 0;
`