import React from 'react';
import {View, Text, TextInput, Button} from 'react-native';

export default class StationSelectScreen extends React.Component {
    state = {
        stationName: this.props.navigation.getParam('station', '서울'),
    }

    handleSelectStation = () => {
        this.props.navigation.getParam('onStationSelected')(this.state.stationName);
        this.props.navigation.goBack();
    }

    render(){
        return (
            <View>
                <Text>역을 선택해주세요</Text>
                <TextInput placeholder="역명을 입력해 주세요" 
                    defaultValue={this.state.stationName} 
                    onChangeText={text => this.setState({stationName: text})}
                />
                <Button title="선택" onPress={this.handleSelectStation}/>
            </View>
        );
    }
}