import * as React from 'react';
import styled from 'styled-components';
import { colors } from './Helpers';

const OuterContainer = styled.div<{ height?: number, width?: string, backgroundColor?: string, rounded?: boolean }>`
    height: ${p => p.height ?? 40}px;
    width: ${p => p.width ?? "100%"};
    background-color: ${p => p.backgroundColor ?? colors.greyVeryLight};
    border-radius: ${p => p.rounded ? (p.height ?? 40 / 2) : 0}px;
    position: relative;
    *{
        transition: all 0.5s ease-out;
    }
`;

const Bar = styled.div<{ value: number, height?: number, barColor?: string, rounded?: boolean }>`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: ${p => p.value}%;
    background-color: ${p => p.barColor ?? colors.greyLight};
    border-radius: ${p => p.rounded ? (p.height ?? 40 / 2) : 0}px;
`;

interface ProgressProps {
    value: number;
    height?: number;
    width?: string;
    backgroundColor?: string;
    barColor?: string;
    unit?: string;
    showValue?: boolean;
    label?: string;
    rounded?: boolean;

}

const Progress = (p: ProgressProps) => {
    const { height, width, backgroundColor, barColor, value, unit, showValue, label, rounded } = p;
    const percent = 100 - value >= 0 ? 100 - value : 0;
    return (
        <OuterContainer
            height={height}
            width={width}
            backgroundColor={backgroundColor}
            rounded={rounded}
        >
            <Bar
                value={percent}
                height={height}
                barColor={barColor}
                rounded={rounded}
            >


            </Bar>
        </OuterContainer>
    );
}
export default Progress;