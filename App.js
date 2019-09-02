import React from 'react';
import {View, StyleSheet, AppState} from 'react-native';
import {Provider} from 'mobx-react';

import AppNavigator from './src/navigation';
import {login} from './src/api/korail';
import MacroJob from './src/macro';
import {MacroJobStore, UserStore} from './src/stores';

class App extends React.Component {
  state = {
    appState: '',
  };

  componentDidMount = async () => {
    AppState.addEventListener('change', this._handleAppStateChange);
  };

  componentWillUnmount = () => {
    AppState.removeEventListener('change', this._handleAppStateChange);
  };

  _handleAppStateChange = async nextAppState => {
    if (this.state.appState === '' && nextAppState === 'active') {
      console.log('App is launching!');
      await login();
      await MacroJob.initMacroJobs();
    }
    this.setState({appState: nextAppState});
  };

  render() {
    return (
      <Provider macroStore={MacroJobStore} userStore={UserStore}>
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
