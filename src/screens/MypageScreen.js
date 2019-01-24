import React from 'react';
import {View, Text, AsyncStorage, TextInput, Button, FlatList, Alert} from 'react-native';
import dayjs from 'dayjs';
import Toast from 'react-native-easy-toast';
import styled from 'styled-components/native';
import korail from '../api/korail';
import {dayOfWeek} from '../utils/date';

export default class MypageScreen extends React.Component {
    static navigationOptions = {
        title: '마이페이지',
    }

    state = {
        isLogined: false,
        username: null,
        korailIdInput: '',
        korailPwInput: '',
        myReservations: [],
    }

    componentDidMount = () => {
        this.subs = [
            this.props.navigation.addListener('didFocus', this.componentDidFocus)
        ];
        this.setState({isLogined: korail.logined, username: korail.name}, async () => {
            await this.fetchMyReservations();
        });
    }

    componentWillUnmount = () => {
        this.subs.forEach(sub => sub.remove());
    }

    componentDidFocus = async () => {
        await this.fetchMyReservations();
    }

    fetchMyReservations = async () => {
        try {
            if (this.state.isLogined){
                let myReservations = await korail.myReservations();
                myReservations = myReservations.map(rsv => {return Object.assign(rsv, {key: rsv.rsvId})});
                this.setState({myReservations});
            }
        } catch(e){
            console.log(e);
        }
    }

    handleLogin = async () => {
        try {
            const {korailIdInput, korailPwInput} = this.state;
            const loginResult = await korail.login(korailIdInput, korailPwInput);
            if (loginResult){
                await AsyncStorage.setItem('@korres:korailId', korailIdInput);
                await AsyncStorage.setItem('@korres:korailPw', korailPwInput);
                this.setState({isLogined: true, username: korail.name}, async() => {
                    await this.componentDidFocus();
                });
            } else {
                this.refs.toast.show('로그인 실패');
            }
        } catch(e){
            console.log(e);
        }
    }

    handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('@korres:korailId');
            await AsyncStorage.removeItem('@korres:korailPw');
            this.setState({isLogined: false, username: null});
        } catch(e){
            console.log(e);
        }
    }

    handleCancelReservation = (rsv) => {
        Alert.alert(
            '예약 취소',
            '이 열차의 예약을 취소하시겠습니까?',
            [
                {text: '예', onPress: async () => {
                    await korail.cancelReservation(rsv);
                    this.refs.toast.show('예약이 취소되었습니다.');
                    await this.fetchMyReservations();
                }},
                {text: '아니오', style: 'cancel'}
            ]
        );
    }

    render(){
        return (
            <View>
                {
                    !this.state.isLogined 
                    ?
                    <View>
                        <Text>코레일 계정 로그인이 필요합니다.</Text>
                        <KorailIdInput 
                            placeholder="코레일 ID"
                            onChangeText={text => this.setState({korailIdInput: text})}
                        />
                        <KorailPwInput 
                            placeholder="코레일 PW"
                            secureTextEntry={true}
                            onChangeText={text => this.setState({korailPwInput: text})}
                        />
                        <Button onPress={this.handleLogin} title="로그인"></Button>
                    </View>  
                    :
                    <View>
                        <Text>{`${this.state.username}님 환영합니다.`}</Text>
                        <Button onPress={this.handleLogout} title="로그아웃"></Button>

                        <Text>예약 목록</Text>
                        <FlatList 
                            data={this.state.myReservations}
                            renderItem={({item}) => {
                                const departure = dayjs(item.departure);
                                const arrival = dayjs(item.arrival);
                                const buyLimit = dayjs(item.buyLimit);
                                return (
                                    <View>
                                        <Text>{departure.format(`YYYY년 MM월 DD일 (${dayOfWeek[departure.format('ddd')]})`)}</Text>
                                        <Text>{`[${item.trainTypeName}] ${item.depName} ${departure.format('HH:mm')} -> ${item.arrName} ${arrival.format('HH:mm')}`}</Text>
                                        <Text>{`${item.seatNoCount}매 (${parseInt(item.price)}원)`}</Text>
                                        {
                                            item.isWaiting
                                            ?
                                            <Text>예약대기</Text>
                                            :
                                            <Text>{`결제기한: ${buyLimit.format('YYYY년 MM월 DD일 HH:mm')}`}</Text>
                                        }
                                        <Button title="예약 취소" onPress={() => this.handleCancelReservation(item)}></Button>
                                    </View>
                                );
                            }}
                        />
                    </View>
                }
                <Toast ref="toast" positionValue={200} opacity={0.9}/>
            </View>
        )
    }
}

const KorailIdInput = styled.TextInput`
    height: 40;
`;

const KorailPwInput = styled.TextInput`
    height: 40;
`