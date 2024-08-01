import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '../Helpers';

const fadeIn = keyframes`
    from {opacity: 0;  }
    to {opacity: 1; }
  `;

const Outercontainer = styled.div < { bgColor: string, borderColor: string, width: string, hasIcon: boolean, hasText: boolean, borderRadius: string, disabled: boolean }>`
    height: 40px;
    line-height: 40px;
    border: 1px solid ${p => p.borderColor};
    width: ${p => p.width};
    block-size: ${p => p.width};
    background-color: ${p => p.bgColor};
    display: grid;
    grid-template-columns: ${p => p.hasIcon && p.hasText ? "40px 1fr" : p.hasIcon && !p.hasText ? "40px" : !p.hasIcon && p.hasText ? "1fr" : "max-content"};
    align-items: center;
    cursor: ${p => p.disabled ? "default" : "pointer"};
    position: relative;
    overflow: hidden;
    transition: 0.2s all ease-out;
    border-radius: ${p => p.borderRadius};
    pointer-events: ${p => p.disabled ? "none" : "all"};
    opacity: ${p => p.disabled ? 0.5 : 1};


    &:hover{
        box-shadow: 0 6px 8px -6px ${colors.greyDark};
        
        &::after{
        content:"";
        position: absolute;
        inset: 0px;
        background-color: rgba(0, 0, 0, 0.1);
	    animation: ${fadeIn} 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
    }
    &:active{
        transform: scale(0.99);
    }
    }
`;
const IconContainer = styled.div<{ color: string }>`
    width: 40px;
    height: 40px;
    position: relative;
    svg{
        width: 0.8em;
        height: 0.8em;
        stroke: ${p => p.color};
        fill: ${p => p.color};
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
`;
const TextContainer = styled.div<{ color: string, hasPaddingLeft: boolean; textAlign: "left" | "right" | "center" }>`
    color: ${p => p.color};
    padding-right: 10px;
    padding-left: ${p => p.hasPaddingLeft ? 10 : 5}px;
    text-align: ${p => p.textAlign};
    user-select: none;
`;

interface ButtonProps {
    bgColor?: string;
    borderColor?: string;
    textColor?: string;
    width?: string;
    icon?: React.ReactNode;
    text?: string;
    onClick?: () => void;
    borderRadius?: string;
    textAlign?: "left" | "right" | "center";
    disabled?: boolean;
}

const Button = (p: ButtonProps) => {
    const { bgColor, borderColor, textColor, width, icon, text, onClick, borderRadius, textAlign, disabled } = p;
    return (
        <Outercontainer
            bgColor={bgColor ?? colors.greyVeryLight}
            borderColor={borderColor ?? colors.greyMiddleLight}
            width={width ?? "fit-content"}
            hasIcon={icon !== undefined}
            hasText={text !== undefined}
            onClick={onClick}
            borderRadius={borderRadius ?? "0px"}
            disabled={disabled ?? false}
        >

            {icon && <IconContainer
                color={textColor ?? colors.greyDark}
            >
                {icon}
            </IconContainer>}

            {text && <TextContainer
                color={textColor ?? colors.greyDark}
                hasPaddingLeft={icon === undefined}
                textAlign={textAlign ?? "left"}
            >
                {text}
            </TextContainer>
            }

            {!icon && !text && "n/v"}
        </Outercontainer>
    );
}
export default Button;
