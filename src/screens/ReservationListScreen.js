import React from 'react';
import {FlatList, Alert} from 'react-native';
import styled from 'styled-components/native';
import {observer, inject} from 'mobx-react';
import dayjs from 'dayjs';

import korail from '../api/korail';
import Text from '../components/MyText';
import {dayOfWeek} from '../utils/date';

class ReservationListScreen extends React.Component {
  static navigationOptions = {
    title: '예약 목록',
  };

  state = {
    myReservations: [],
  };

  componentDidMount = async () => {
    this.subs = [
      this.props.navigation.addListener('didFocus', this.componentDidFocus),
    ];
    await this.fetchMyReservations();
  };

  componentWillUnmount = () => {
    this.subs.forEach(sub => sub.remove());
  };

  componentDidFocus = async () => {
    await this.fetchMyReservations();
  };

  fetchMyReservations = async () => {
    try {
      if (this.props.userStore.isLoggedIn) {
        let myReservations = await korail.myReservations();
        myReservations = myReservations.map(rsv => {
          return Object.assign(rsv, {key: rsv.rsvId});
        });
        this.setState({myReservations});
      }
    } catch (e) {
      console.log(e);
    }
  };

  handleCancelReservation = rsv => {
    Alert.alert('예약 취소', '이 열차의 예약을 취소하시겠습니까?', [
      {
        text: '예',
        onPress: async () => {
          await korail.cancelReservation(rsv);
          await this.fetchMyReservations();
        },
      },
      {text: '아니오', style: 'cancel'},
    ]);
  };

  render() {
    return (
      <>
        {this.state.myReservations.length > 0 ? (
          <FlatList
            data={this.state.myReservations}
            renderItem={({item}) => {
              const departure = dayjs(item.departure);
              const arrival = dayjs(item.arrival);
              const buyLimit = dayjs(item.buyLimit);
              return (
                <ReservationWrapper>
                  <TrainInfoView>
                    <Text>
                      {departure.format(
                        `YYYY년 MM월 DD일 (${
                          dayOfWeek[departure.format('ddd')]
                        })`,
                      )}
                    </Text>
                    <Text>{`[${item.trainTypeName}] ${
                      item.depName
                    } ${departure.format('HH:mm')} -> ${
                      item.arrName
                    } ${arrival.format('HH:mm')}`}</Text>
                    <Text>{`${item.seatNoCount}매 (${parseInt(
                      item.price,
                    )}원)`}</Text>
                    {item.isWaiting ? (
                      <Text>예약대기</Text>
                    ) : (
                      <Text>{`결제기한: ${buyLimit.format(
                        'YYYY년 MM월 DD일 HH:mm',
                      )}`}</Text>
                    )}
                  </TrainInfoView>
                  <CancelButtonView>
                    <CancelButton
                      onPress={() => this.handleCancelReservation(item)}>
                      <Text color="white" fontSize={15}>
                        예약취소
                      </Text>
                    </CancelButton>
                  </CancelButtonView>
                </ReservationWrapper>
              );
            }}
          />
        ) : (
          <EmptyView>
            <Text>예약내역이 없습니다.</Text>
          </EmptyView>
        )}
      </>
    );
  }
}

const ReservationWrapper = styled.View`
  flex: 1;
  flex-direction: row;
  width: 100%;
  height: 100;
  padding-horizontal: 10;
  border-bottom-width: 1;
  border-bottom-color: #d1d1d1;
`;

const TrainInfoView = styled.View`
  width: 70%;
  height: 100%;
  justify-content: center;
`;

const CancelButtonView = styled.View`
  width: 30%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const CancelButton = styled.TouchableOpacity`
  width: 90%;
  height: 70%;
  border-radius: 15;
  background-color: #334f70;
  align-items: center;
  justify-content: center;
`;

const EmptyView = styled.View`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

export default inject('userStore')(observer(ReservationListScreen));
