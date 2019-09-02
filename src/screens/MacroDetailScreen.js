import React from 'react';
import {FlatList, Alert} from 'react-native';
import styled from 'styled-components/native';
import dayjs from 'dayjs';
import {toJS} from 'mobx';
import {observer, inject} from 'mobx-react';
import {ReserveOptions} from 'korailjs';

import Text from '../components/MyText';
import {dayOfWeek} from '../utils/date';
import colors from '../constants/colors';

class MacroDetailScreen extends React.Component {
  static navigationOptions = {
    title: '매크로 상세',
  };

  handleCancelMacro = macroJob => {
    Alert.alert('매크로 취소', '정말 매크로를 취소하시겠습니까?', [
      {
        text: '예',
        onPress: async () => {
          await macroJob.stop();
          this.props.navigation.goBack();
        },
      },
      {text: '아니오', style: 'cancel'},
    ]);
  };

  render() {
    const macroJob = this.props.navigation.getParam('macroJob');
    let macroJobLogs = toJS(this.props.macroStore.jobLogs)[macroJob.uuid] || [];
    macroJobLogs = macroJobLogs.map((log, idx) =>
      Object({...log, key: String(idx)}),
    );

    const train = macroJob.train;
    const depDate = dayjs(train.departure);
    const arrDate = dayjs(train.arrival);
    const dateText = depDate.format(
      `YYYY년 MM월 DD일 (${dayOfWeek[depDate.format('ddd')]})`,
    );

    const rsvOptionText =
      macroJob.reserveOption === ReserveOptions.GENERAL_FIRST
        ? '일반실'
        : '특실';

    return (
      <RootView>
        <MacroInfoView>
          <MacroDateView>
            <Text fontSize={15}>{dateText}</Text>
          </MacroDateView>
          <MacroStationWrapper>
            <MacroStationView>
              <Text fontSize={20} color={colors.main}>
                {train.depName}
              </Text>
              <Text>{depDate.format('HH:mm')}</Text>
            </MacroStationView>
            <MacroStationView>
              <Text fontSize={20} color={colors.main}>
                {train.arrName}
              </Text>
              <Text>{arrDate.format('HH:mm')}</Text>
            </MacroStationView>
            <MacroOptionView>
              <Text>{rsvOptionText}</Text>
              <Text>{`예약 매수: ${macroJob.passengers}매`}</Text>
            </MacroOptionView>
          </MacroStationWrapper>
        </MacroInfoView>

        <MacroLogView>
          <Text>로그 기록 (최근 10건까지 표시)</Text>
          <FlatList
            data={macroJobLogs}
            renderItem={({item}) => {
              return (
                <Text>{`[${item.datetime.format('HH:mm:ss')}] ${
                  item.message
                }`}</Text>
              );
            }}
          />
        </MacroLogView>
      </RootView>
    );
  }
}

const RootView = styled.View`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const MacroInfoView = styled.View`
  width: 100%;
  height: 30%;
`;

const MacroDateView = styled.View`
  width: 100%;
  height: 25%;
  align-items: center;
  justify-content: center;
`;

const MacroStationWrapper = styled.View`
  width: 100%;
  height: 50%;
  flex-direction: row;
`;

const MacroStationView = styled.View`
  width: 25%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const MacroOptionView = styled.View`
  width: 50%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const MacroLogView = styled.View`
  width: 100%;
  height: 70%;
  padding-horizontal: 10;
`;

export default inject('macroStore')(observer(MacroDetailScreen));
