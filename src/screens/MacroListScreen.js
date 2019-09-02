import React from 'react';
import {FlatList, Alert} from 'react-native';
import styled from 'styled-components/native';
import Toast from 'react-native-easy-toast';
import dayjs from 'dayjs';

import MacroJob from '../macro';
import Text from '../components/MyText';
import colors from '../constants/colors';
import {dayOfWeek} from '../utils/date';


const MacroListItem = ({macro, onTouchMacro, onCancelMacro}) => {
    const train = macro.train;
    const depDate = dayjs(train.departure);
    const arrDate = dayjs(train.arrival);
    const dateText = depDate.format(`YYYY년 MM월 DD일 (${dayOfWeek[depDate.format('ddd')]})`);

    return (
        <MacroJobWrapper>
            <MacroInfoView>
                <Text>{dateText}</Text>
                <MacroStationWrapper>
                    <MacroTrainTypeView>
                        <Text>{train.trainTypeName}</Text>
                    </MacroTrainTypeView>
                    <MacroStationView>
                        <Text color={colors.main} fontSize={20}>{train.depName}</Text>
                        <Text>{depDate.format('HH:mm')}</Text>
                    </MacroStationView>
                    <MacroStationView>
                        <Text color={colors.main} fontSize={20}>{train.arrName}</Text>
                        <Text>{arrDate.format('HH:mm')}</Text>
                    </MacroStationView>
                </MacroStationWrapper>
            </MacroInfoView>
            <MacroButtonView>
                <MacroButton onPress={() => onTouchMacro(macro)}>
                    <Text color='white' fontSize={15}>상세보기</Text>
                </MacroButton>
                <MacroButton onPress={() => onCancelMacro(macro)}>
                    <Text color='white' fontSize={15}>취소하기</Text>
                </MacroButton>
            </MacroButtonView>
        </MacroJobWrapper>
    )
}


class MacroListScreen extends React.Component {
    static navigationOptions = {
        title: '매크로 목록'
    }

    state = {
        macroJobs: [],
    }

    componentDidMount = () => {
        this.subs = [
            this.props.navigation.addListener('didFocus', this.componentDidFocus)
        ]
    }

    componentWillUnmount = () => {
        this.subs.forEach(sub => sub.remove());
    }

    componentDidFocus = async () => {
        await this.fetchMacroJobs();
    }

    fetchMacroJobs = async () => {
        const macroJobs = await MacroJob.loadMacroJobs();
        this.setState({macroJobs: macroJobs.map(job => {return {...job, key: job.uuid}})});
    }

    handleTouchMacro = (macroJob) => {
        this.props.navigation.navigate('MacroDetail', {
            macroJob,
        });
    }

    handleCancelMacro = (macroJob) => {
        Alert.alert(
            '매크로 취소',
            '정말 매크로를 취소하시겠습니까?',
            [
                {text: '예', onPress: async () => {
                    await macroJob.stop();
                    await this.fetchMacroJobs();
                }},
                {text: '아니오', style: 'cancel'}
            ]
        )
    }

    render(){
        return (
            <RootView>
                <MacroNumView>
                    <Text fontSize={20}>
                    {
                        this.state.macroJobs.length > 0 ?
                        <>
                            <Text fontSize={20} color={colors.main}>{this.state.macroJobs.length}</Text>
                            건의 매크로가 실행중입니다.
                        </> : 
                        '실행중인 매크로가 없습니다.'
                    }
                    </Text>
                </MacroNumView>

                <FlatList data={this.state.macroJobs}
                    renderItem={({item}) => 
                        <MacroListItem macro={item} onTouchMacro={this.handleTouchMacro} onCancelMacro={this.handleCancelMacro}/>
                    }
                />
                <Toast ref="toast" positionValue={200} opacity={0.9}/>
            </RootView>
        )
    }
}

const RootView = styled.View`
    flex: 1;
    width: 100%;
    height: 100%;
`

const MacroNumView = styled.View`
    width: 100%;
    height: 15%;
    align-items: center;
    justify-content: center;
    border-bottom-width: 1;
    border-bottom-color: black;
`

const MacroJobWrapper = styled.View`
    flex-direction: row;
    height: 100;
    padding-vertical: 10;
    padding-horizontal: 10;
    border-bottom-width: 1;
    border-bottom-color: black;
`;

const MacroInfoView = styled.View`
    width: 70%;
    height: 100%;
    justify-content: space-around;
    align-items: center;
`

const MacroStationWrapper = styled.View`
    width: 100%;
    height: 70%;
    flex-direction: row;
`

const MacroTrainTypeView = styled.View`
    width: 30%;
    height: 100%;
    align-items: center;
    justify-content: center;
`

const MacroStationView = styled.View`
    width: 35%;
    height: 100%;
    align-items: center;
    justify-content: center;
`

const MacroButtonView = styled.View`
    width: 30%;
    height: 100%;
    align-items: center;
    justify-content: space-around;
`

const MacroButton = styled.TouchableOpacity`
    width: 90%;
    height: 40%;
    border-radius: 10;
    align-items: center;
    justify-content: center;
    background-color: #334F70;
`

export default MacroListScreen;
