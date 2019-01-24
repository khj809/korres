import React from 'react';
import {View, Text, FlatList, Button, Alert} from 'react-native';
import {toJS} from 'mobx';
import {observer, inject} from 'mobx-react/native';
import {ReserveOptions} from 'korailjs';


@inject('macro')
@observer
class MacroDetailScreen extends React.Component {
    static navigationOptions = {
        title: '매크로 상세'
    }

    handleCancelMacro = (macroJob) => {
        Alert.alert(
            '매크로 취소',
            '정말 매크로를 취소하시겠습니까?',
            [
                {text: '예', onPress: async () => {
                    await macroJob.stop();
                    this.props.navigation.goBack();
                }},
                {text: '아니오', style: 'cancel'}
            ]
        )
    }

    render(){
        const macroJob = this.props.navigation.getParam('macroJob');
        let macroJobLogs = toJS(this.props.macro.jobLogs)[macroJob.uuid] || [];
        macroJobLogs = macroJobLogs.map((log, idx) => {return {...log, key: String(idx)}});

        const rsvOptionText = macroJob.reserveOption === ReserveOptions.GENERAL_FIRST ? '일반실 우선' : '특실 우선'

        return (
            <View>
                <Text>{`매크로 ID: ${macroJob.uuid}`}</Text>
                <Text>{macroJob.train.toString()}</Text>
                <Text>{`예약 매수: ${macroJob.passengers}매`}</Text>
                <Text>{rsvOptionText}</Text>

                <FlatList data={macroJobLogs} renderItem={({item}) => {
                    return (
                        <Text>{`[${item.datetime.format('HH:mm:ss')}] ${item.message}`}</Text>
                    );
                }}/>

                <Button title="매크로 취소" onPress={() => this.handleCancelMacro(macroJob)}></Button>
            </View>
        )
    }
}

export default MacroDetailScreen;