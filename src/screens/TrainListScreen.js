import React from 'react';
import {View, Text, ScrollView, FlatList, Alert, Picker} from 'react-native';
import {NavigationActions} from 'react-navigation';
import Toast from 'react-native-easy-toast';
import styled from 'styled-components/native';
import dayjs from 'dayjs';
import {TrainTypes, ReserveOptions, AdultPassenger} from 'korailjs';

import korail from '../api/korail';
import MacroJob from '../macro';
import {dayOfWeek} from '../utils/date';

export default class TrainListScreen extends React.Component {
    static navigationOptions = {
        title: '열차조회 목록'
	}
	
	constructor(props, context){
		super(props, context);

		let searchDate = this.props.navigation.getParam('depDate');
		if (searchDate.isBefore(dayjs())) searchDate = dayjs();

		this.state = {
			trains: [],
			searchDate,
			searchDepName: this.props.navigation.getParam('depName'),
			searchArrName: this.props.navigation.getParam('arrName'),
			passengers: this.props.navigation.getParam('passengers'),
			trainType: TrainTypes.ALL,
			reachedEnd: false,
			isFetching: false,
		};
	}

	componentDidMount = async () => {
		await this.fetchTrains(); 
	}

	fetchTrains = async () => {
		if (this.state.reachedEnd || this.state.isFetching) return;

		this.setState({isFetching: true});

		let lastTime = null;
		if (this.state.trains.length > 0){
			lastTime = String(Number(this.state.trains[this.state.trains.length-1].depTime) + 100).padStart(6, '0');
		} else {
			if (this.state.searchDate.isSame(dayjs(), 'date')){
				lastTime = this.state.searchDate.format('HHmmss');
			} else {
				lastTime = '000000';
			}
		}

		let trains = await korail.searchTrain(
			this.state.searchDepName,
			this.state.searchArrName,
			{
				date: this.state.searchDate.format('YYYYMMDD'),
				time: lastTime,
				trainType: this.state.trainType,
				includeNoSeats: true
			}
		);
		trains = trains.map(train => {return Object.assign(train, {key: train.trainNo})});

		this.setState({
			trains: this.state.trains.concat(trains),
			isFetching: false,
			reachedEnd: trains.length < 10,
		});
	}

	searchOtherDay = (isNext) => {
		this.setState({
			trains: [],
			reachedEnd: false,
			searchDate: isNext ?
				this.state.searchDate.add(1, 'day') :
				this.state.searchDate.subtract(1, 'day'),
		}, async () => {
			await this.fetchTrains();
		});
	}

	onClickTrain = (train, rsvOption) => {
		if (!korail.logined){
			Alert.alert(
				'로그인 필요',
				'열차 예매를 위해 코레일 계정으로 로그인이 필요합니다.',
				[
					{text: '확인', onPress: ()=>{
						this.props.navigation.dispatch(NavigationActions.navigate({
							routeName: 'MypageStack'
						}));
					}}
				]
			)
			return;
		}

		const hasSeat = (rsvOption === ReserveOptions.GENERAL_FIRST && train.hasGeneralSeat) || 
			(rsvOption === ReserveOptions.SPECIAL_FIRST && train.hasSpecialSeat);

		if (hasSeat){
			Alert.alert(
				'예약하기',
				'이 열차를 예약하시겠습니까?',
				[
					{text: '예', onPress: async () => {
						try {
							console.log(this.state.passengers);
							const rsvResult = await korail.reserve(train, {
								passengers: [new AdultPassenger({count: this.state.passengers})],
								reserveOption: rsvOption
							});
							if (!!rsvResult){
								this.refs.toast.show('예약이 성공적으로 완료되었습니다.');
							} else {
								this.refs.toast.show('예약에 실패하였습니다.');
							}
						} catch(e){
							console.log(e);
						}
					}},
					{text: '아니오', style: 'cancel'}
				]
			)
		} else {
			Alert.alert(
				'예약하기',
				'이 열차의 예약 매크로를 실행하시겠습니까?',
				[
					{text: '예', onPress: async () => {
						try {
							const macroJob = new MacroJob();
							macroJob.init({
								train: train, 
								passengers: this.state.passengers,
								reserveOption: rsvOption,
							});
							await macroJob.run();
							this.refs.toast.show('새로운 매크로가 등록되었습니다.');
						} catch(e){
							console.log(e);
						}
					}},
					{text: '아니오', style: 'cancel'}
				]
			);
		}
	}

	handleChangeTrainType = (trainType) => {
		this.setState({
			trainType,
			trains: [],
			reachedEnd: false
		}, async () => {
			await this.fetchTrains();
		});
	}

	render() {
		const date = this.state.searchDate;
		const isToday = date.isSame(dayjs(), 'date');

		return (
			<RootView> 
				<DateView>
					<OtherDateView disabled={isToday} onPress={() => this.searchOtherDay(false)}>
						<YesterdayText isToday={isToday}>이전날</YesterdayText>
					</OtherDateView>
					<TodayView>
						<Text>{`${date.format('YYYY년 MM월 DD일')} (${dayOfWeek[date.format('ddd')]})`}</Text>
					</TodayView>
					<OtherDateView onPress={() => this.searchOtherDay(true)}>
						<Text>다음날</Text>
					</OtherDateView>
				</DateView>

				<SecondContainer>
					<StationView>
						<Text>{`${this.state.searchDepName}  ->  ${this.state.searchArrName}`}</Text>
					</StationView>
					<TrainTypePickerView>
						<TrainTypePicker selectedValue={this.state.trainType} onValueChange={this.handleChangeTrainType}>
							<Picker.Item label="전체" value={TrainTypes.ALL} />
							<Picker.Item label="KTX" value={TrainTypes.KTX} />
							<Picker.Item label="새마을" value={TrainTypes.SAEMAEUL} />
							<Picker.Item label="무궁화" value={TrainTypes.MUGUNGHWA} />
							<Picker.Item label="ITX청춘" value={TrainTypes.ITX_CHEONGCHUN} />
						</TrainTypePicker>
					</TrainTypePickerView>
				</SecondContainer>

				<FlatList 
					data={this.state.trains} 
					onEndReached={async ()=>{await this.fetchTrains()}}
					renderItem={({item})=> 
						<TrainWrapper>
							<TrainTypeView>
								<Text>{item.trainTypeName}</Text>
							</TrainTypeView>
							<TrainTimeView>
								<Text>{item.depTime.substr(0, 2)}:{item.depTime.substr(2, 2)}</Text>
								<Text>{item.depName}</Text>
							</TrainTimeView>
							<TrainTimeView>
								<Text>{item.arrTime.substr(0, 2)}:{item.arrTime.substr(2, 2)}</Text>
								<Text>{item.arrName}</Text>
							</TrainTimeView>
							<TrainGeneralSeatView onPress={() => this.onClickTrain(item, ReserveOptions.GENERAL_FIRST)}>
								<TrainGeneralSeatText soldOut={!item.hasGeneralSeat}>
									{item.hasGeneralSeat ? "일반실" : "매진"}
								</TrainGeneralSeatText>
							</TrainGeneralSeatView>
							<TrainSpecialSeatView onPress={() => this.onClickTrain(item, ReserveOptions.SPECIAL_FIRST)}>
								<TrainSpecialSeatText soldOut={!item.hasSpecialSeat}>
									{item.hasSpecialSeat ? "특실" : "매진"}
								</TrainSpecialSeatText>
							</TrainSpecialSeatView>
						</TrainWrapper>
					}
					ListFooterComponent={
						this.state.reachedEnd &&
						<TomorrowSearchView onPress={() => this.searchOtherDay(true)}>
							<Text>{`다음날 ${date.add(1, 'day').format('(MM월 DD일)')} 조회하기`}</Text>
						</TomorrowSearchView>
					}
				/>
				
                <Toast ref="toast" positionValue={200} opacity={0.9}/>
			</RootView>
		);
	}
}

const RootView = styled.View`
	flex: 1;
	background-color: #fff;
`;

const DateView = styled.View`
	justify-content: center;
	align-items: center;
	height: 50;
	border-width: 1;
	flex-direction: row;
`;

const TodayView = styled.View`
	width: 50%;
	align-items: center;
`;

const OtherDateView = styled.TouchableOpacity`
	width: 25%;
	align-items: center;
`;

const YesterdayText = styled.Text`
	color: ${props => props.isToday ? '#aaa' : '#000'};
`;

const SecondContainer = styled.View`
	flex-direction: row;
	align-items: center;
	height: 50;
	border-width: 1;
`

const StationView = styled.View`
	width: 50%;
	align-items: center;
`

const TrainTypePickerView = styled.View`
	width: 50%;
	align-items: center;
`

const TrainTypePicker = styled.Picker`
	width: 150;
	height: 50;
`

const TrainWrapper = styled.View`
	border-width: 1;
	flex-wrap: wrap;
	flex-direction: row;
	height: 60;
`

const TrainTypeView = styled.View`
	justify-content: center;
	align-items: center;
	width: 20%;
`

const TrainTimeView = styled.View`
	justify-content: center;
	align-items: center;
	width: 20%;
`

const TrainGeneralSeatView = styled.TouchableOpacity`
	justify-content: center;
	align-items: center;
	width: 20%;
`

const TrainGeneralSeatText = styled.Text`
	color: ${props => props.soldOut ? '#f00' : '#000'};
`

const TrainSpecialSeatView = styled.TouchableOpacity`
	justify-content: center;
	align-items: center;
	width: 20%;
`

const TrainSpecialSeatText = styled.Text`
	color: ${props => props.soldOut ? '#f00' : '#000'};
`

const TomorrowSearchView = styled.TouchableOpacity`
	justify-content: center;
	align-items: center;
	height: 60;
`