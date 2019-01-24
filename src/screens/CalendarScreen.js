import React from 'react';
import {View, Text} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import dayjs from 'dayjs';
import moment from 'moment';

export default class CalendarScreen extends React.Component {
    onDateSelected = (date) => {
        if (date.isSame(moment(), 'date')){
            date = moment();
        }

        this.props.navigation.getParam('onDateSelected')(date);
        this.props.navigation.goBack();
    }

    render(){
        const minDate = dayjs().toDate();
        const maxDate = dayjs().add(30, 'day').toDate();

        return (
            <View>
                <CalendarPicker
                    weekdays={['일', '월', '화', '수', '목', '금', '토']}
                    months={['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']}
                    previousTitle='이전달'
                    nextTitle='다음달'
                    minDate={minDate}
                    maxDate={maxDate}
                    onDateChange={this.onDateSelected}
                />
            </View>
        )
    }
}