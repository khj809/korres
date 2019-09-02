import React from 'react';
import {FlatList} from 'react-native';
import styled from 'styled-components/native';
import dayjs from 'dayjs';
import {observer, inject} from 'mobx-react';

import korail from '../api/korail';
import Text from '../components/MyText';
import {dayOfWeek} from '../utils/date';

class TicketListScreen extends React.Component {
  static navigationOptions = {
    title: '티켓 목록',
  };

  state = {
    myTickets: [],
  };

  componentDidMount = async () => {
    this.subs = [
      this.props.navigation.addListener('didFocus', this.componentDidFocus),
    ];
    await this.fetchMyTickets();
  };

  componentWillUnmount = () => {
    this.subs.forEach(sub => sub.remove());
  };

  componentDidFocus = async () => {
    await this.fetchMyTickets();
  };

  fetchMyTickets = async () => {
    try {
      if (this.props.userStore.isLoggedIn) {
        let myTickets = await korail.myTickets();
        myTickets = myTickets.map(ticket => {
          return Object.assign(ticket, {key: ticket.ticketNo});
        });
        this.setState({myTickets});
      }
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    return (
      <>
        {this.state.myTickets.length > 0 ? (
          <FlatList
            data={this.state.myTickets}
            renderItem={({item}) => {
              const departure = dayjs(item.departure);
              const arrival = dayjs(item.arrival);

              return (
                <TicketWrapper>
                  <TicketNumberView>
                    <Text>승차권번호 : {item.ticketNo}</Text>
                  </TicketNumberView>
                  <TicketDateView>
                    <Text>
                      {departure.format(
                        `YYYY년 MM월 DD일 (${
                          dayOfWeek[departure.format('ddd')]
                        })`,
                      )}
                    </Text>
                  </TicketDateView>
                  <TicketInfoView>
                    <TicketTrainTypeView>
                      <Text>{item.trainTypeName}</Text>
                    </TicketTrainTypeView>
                    <TicketStationView>
                      <Text>{item.depName}</Text>
                      <Text>{departure.format('HH:mm')}</Text>
                    </TicketStationView>
                    <TicketStationView>
                      <Text>{item.arrName}</Text>
                      <Text>{arrival.format('HH:mm')}</Text>
                    </TicketStationView>
                    <TicketSeatView>
                      <Text>차량</Text>
                      <Text>{`${item.carNo}호차`}</Text>
                    </TicketSeatView>
                    <TicketSeatView>
                      <Text>좌석</Text>
                      <Text>{`${item.seatNo.replace(/^0+/, '')}석`}</Text>
                    </TicketSeatView>
                  </TicketInfoView>
                </TicketWrapper>
              );
            }}
          />
        ) : (
          <EmptyView>
            <Text>발권한 티켓이 없습니다.</Text>
          </EmptyView>
        )}
      </>
    );
  }
}

const TicketWrapper = styled.View`
  flex: 1;
  width: 100%;
  height: 100;
  padding-horizontal: 10;
  border-bottom-width: 1;
  border-bottom-color: #d1d1d1;
`;

const TicketNumberView = styled.View`
  flex-direction: row;
  width: 100%;
  height: 20%;
`;

const TicketDateView = styled.View`
  flex-direction: row;
  width: 100%;
  height: 20%;
`;

const TicketInfoView = styled.View`
  flex-direction: row;
  width: 100%;
  height: 60%;
`;

const TicketTrainTypeView = styled.View`
  width: 20%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const TicketStationView = styled.View`
  width: 20%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const TicketSeatView = styled.View`
  width: 20%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const EmptyView = styled.View`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

export default inject('userStore')(observer(TicketListScreen));
