import React from 'react';
import styled from 'styled-components/native';
// import {AdMobBanner} from 'react-native-admob';

export default ({props}) => {
  return (
    <RootView>
      {/* <AdMobBanner 
                adSize="smartBanner"
                adUnitID="ca-app-pub-5746222375872196/8876248246"
                onAdFailedToLoad={err => console.log(err)}
                {...props}
            /> */}
    </RootView>
  );
};

const RootView = styled.View`
  width: 100%;
  height: 50;
`;
