import React from 'react';
import {View, Text, FlatList, Button, Alert, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import Toast from 'react-native-easy-toast';
import {ReserveOptions} from 'korailjs';
import dayjs from 'dayjs';

import MacroJob from '../macro';
import {dayOfWeek} from '../utils/date';


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

    render(){
        return (
            <View>
                {
                    this.state.macroJobs.length > 0
                    ?
                    <View>
                        <Text>{`${this.state.macroJobs.length}건의 매크로가 실행중입니다.`}</Text>
                        <FlatList data={this.state.macroJobs}
                            renderItem={({item}) => {
                                const train = item.train;
                                const depDate = dayjs(train.getDeparture());
                                const arrDate = dayjs(train.getArrival());

                                const dateText = depDate.format(`YYYY년 MM월 DD일 (${dayOfWeek[depDate.format('ddd')]})`);
                                const trainText = 
                                    `[${train.trainTypeName}] ${train.depName} (${depDate.format('HH:mm')})` + 
                                    ` -> ${train.arrName} (${arrDate.format('HH:mm')})`;

                                return (
                                    <MacroJobWrapper onPress={() => {this.handleTouchMacro(item);}}>
                                        <MacroJobRow>
                                            <MacroJobDateView>
                                                <MacroJobDateText>{dateText}</MacroJobDateText>
                                            </MacroJobDateView>
                                            <MacroJobCountView>
                                                <MacroJobCountText>{`${item.passengers}매`}</MacroJobCountText>
                                            </MacroJobCountView>
                                        </MacroJobRow>
                                        <MacroJobRow>
                                            <MacroJobTrainText>{trainText}</MacroJobTrainText>
                                        </MacroJobRow>
                                        {/* <Button title="매크로 취소" onPress={() => {this.handleCancelMacro(item);}}></Button> */}
                                    </MacroJobWrapper>
                                )
                            }}
                        />
                    </View>
                    :
                    <View>
                        <Text>실행중인 매크로가 없습니다.</Text>
                    </View>
                }
                <Toast ref="toast" positionValue={200} opacity={0.9}/>
            </View>
        )
    }
}

const MacroJobWrapper = styled.TouchableOpacity`
    border-width: 1;
    flex-direction: column;
    height: 100;
`;

const MacroJobRow = styled.View`
    width: 100%;
    height: 30;
    flex-direction: row;
    align-items: center;
	justify-content: center;
`;

const MacroJobDateView = styled.View`
    width: 50%;
    height: 30;
`

const MacroJobDateText = styled.Text`
    text-align: left;
`

const MacroJobCountView = styled.View`
    width: 50%;
    height: 30;
`

const MacroJobCountText = styled.Text`
    text-align: right;
`

const MacroJobTrainText = styled.Text`
    text-align: center;
`

export default MacroListScreen;
