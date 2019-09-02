import React from 'react';
import styled from 'styled-components/native';

const DEFAULT_FONT_COLOR = 'black';
const DEFAULT_FONT_SIZE = 14;

const Text = styled.Text`
    color: ${props => props.color || DEFAULT_FONT_COLOR};
    font-size: ${props => props.fontSize || DEFAULT_FONT_SIZE};
`
export default ({color, fontSize, ...props}) => (
    <Text color={color} fontSize={fontSize}>
        {props.children}
    </Text>
);