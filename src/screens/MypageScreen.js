import React from 'react';
import {observer, inject} from 'mobx-react';
import Toast from 'react-native-easy-toast';
import styled from 'styled-components/native';

import {login, logout} from '../api/korail';
import Text from '../components/MyText';
import MypageNavigator from '../navigation/MypageNavigator';
import colors from '../constants/colors';

class MypageScreen extends React.Component {
  static navigationOptions = {
    title: '마이페이지',
  };
  static router = MypageNavigator.router;

  state = {
    korailIdInput: '',
    korailPwInput: '',
  };

  handleLogin = async () => {
    try {
      const {korailIdInput, korailPwInput} = this.state;
      const loginResult = await login(korailIdInput, korailPwInput);
      if (!loginResult) {
        this.refs.toast.show('로그인 실패');
      }
    } catch (e) {
      console.log(e);
    }
  };

  handleLogout = async () => {
    await logout();
    this.setState({myReservations: []});
  };

  render() {
    return (
      <RootView>
        {!this.props.userStore.isLoggedIn ? (
          <LoginContainer>
            <Text>코레일 계정으로 로그인이 필요합니다.</Text>
            <LoginInputWrapper>
              <LoginInputLabelView>
                <Text>회원번호</Text>
              </LoginInputLabelView>
              <LoginInputView>
                <KorailIdInput
                  placeholder="회원번호를 입력해 주세요."
                  onChangeText={text => this.setState({korailIdInput: text})}
                />
              </LoginInputView>
            </LoginInputWrapper>
            <LoginInputWrapper>
              <LoginInputLabelView>
                <Text>비밀번호</Text>
              </LoginInputLabelView>
              <LoginInputView>
                <KorailPwInput
                  placeholder="비밀번호를 입력해 주세요."
                  secureTextEntry={true}
                  onChangeText={text => this.setState({korailPwInput: text})}
                />
              </LoginInputView>
            </LoginInputWrapper>

            <LoginButton onPress={this.handleLogin}>
              <Text color="white" fontSize={20}>
                로그인
              </Text>
            </LoginButton>
          </LoginContainer>
        ) : (
          <>
            <UserInfoContainer>
              <UserInfoView>
                <Text fontSize={15}>
                  <Text
                    color={colors.main}
                    fontSize={
                      20
                    }>{`${this.props.userStore.userInfo.username}`}</Text>
                  {` 님 (${this.props.userStore.userInfo.membershipNumber})`}
                </Text>
              </UserInfoView>
              <LogoutButtonView>
                <LogoutButton onPress={this.handleLogout}>
                  <Text color="white">로그아웃</Text>
                </LogoutButton>
              </LogoutButtonView>
            </UserInfoContainer>

            <MypageNavigator navigation={this.props.navigation} />
          </>
        )}
        <Toast ref="toast" positionValue={200} opacity={0.9} />
      </RootView>
    );
  }
}

export default inject('userStore')(observer(MypageScreen));

const RootView = styled.View`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const LoginContainer = styled.View`
  width: 100%;
  height: 300;
  align-items: center;
  padding-vertical: 30;
  padding-horizontal: 20;
`;

const LoginInputWrapper = styled.View`
  flex-direction: row;
  width: 100%;
  height: 20%;
`;

const LoginInputLabelView = styled.View`
  width: 30%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const LoginInputView = styled.View`
  width: 70%;
  height: 100%;
  justify-content: center;
`;

const KorailIdInput = styled.TextInput`
  width: 100%;
  height: 30;
  border-width: 1;
  padding-vertical: 0;
`;

const KorailPwInput = styled.TextInput`
  width: 100%;
  height: 30;
  border-width: 1;
  padding-vertical: 0;
`;

const LoginButton = styled.TouchableOpacity`
  width: 80%;
  height: 50;
  align-items: center;
  justify-content: center;
  border-radius: 15;
  background-color: #334f70;
`;

const UserInfoContainer = styled.View`
  flex-direction: row;
  width: 100%;
  height: 10%;
  margin-vertical: 25;
`;

const UserInfoView = styled.View`
  flex-direction: row;
  width: 70%;
  align-items: center;
  justify-content: center;
`;

const LogoutButtonView = styled.View`
  flex-direction: row;
  width: 30%;
  align-items: center;
`;

const LogoutButton = styled.TouchableOpacity`
  width: 90%;
  height: 70%;
  border-radius: 10;
  background-color: #334f70;
  align-items: center;
  justify-content: center;
`;
