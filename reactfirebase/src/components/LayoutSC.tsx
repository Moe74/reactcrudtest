import styled from 'styled-components';
import { colors, imageLayouttUrlPrefix, themeSettings } from './Helpers';

export const OuterContainer = styled.div`
    position: fixed;
    inset: 0;
    background: ${themeSettings.mainBackgroundColor};
    color: ${themeSettings.mainTextColor};
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 14px;
    .p-breadcrumb-list {
        font-size: 14px;
        a {
            text-decoration: none;
            color: ${colors.black};
        }
    }
    .p-breadcrumb {
        border: none;
        border-radius: 0;
        margin-top: -40px;
        padding-left: 0;
        padding-right: 0;
    }
`;
export const MainContainer = styled.div<{ contentWidth: number }>`
    width: 100%;
    height: 100%;
    overflow-y: hidden;
    overflow-x: hidden;
    background: white;
    transition: width 0.1s ease-out;
    max-width: ${(p) => p.contentWidth}px;
    margin: auto;
    background-color: ${themeSettings.menuBackgroundColor};
`;
export const MainGrid = styled.div`
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    grid-template-rows: max-content 100px 1fr 60px;
    width: 100%;
    height: 100%;
`;
export const MenuContainer = styled.div`
    width: 100%;
    grid-row-start: 1;
    grid-row-end: 2;
    grid-column-start: 2;
    grid-column-end: 3;
    padding: 10px 0;
    background-color: ${themeSettings.menuBackgroundColor};
`;
export const HeaderContainer = styled.div<{ image: string }>`
    width: 100%;
    grid-row-start: 2;
    grid-row-end: 3;
    grid-column-start: 1;
    grid-column-end: 4;
    background: ${colors.greyVeryLight};
    background-image: ${(p) => `url("${imageLayouttUrlPrefix + p.image}")`};
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    position: relative;
`;
export const HeaderContainerText = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    background: rgba(0, 0, 0, 0.4);
    text-align: center;
    font-size: 2em;
    padding: 0 40px;
    transform: translateY(-50%);
    color: white;
    line-height: 40px;
`;
export const ContentContainer = styled.div`
    width: 100%;
    height: 100%;
    grid-row-start: 3;
    grid-row-end: 4;
    grid-column-start: 2;
    grid-column-end: 3;
    background: ${themeSettings.menuBackgroundColor};
    overflow-y: auto;
`;
export const FooterContainer = styled.div`
    width: 100%;
    grid-row-start: 4;
    grid-row-end: 5;
    grid-column-start: 2;
    grid-column-end: 3;
    background: ${themeSettings.menuBackgroundColor};
    border-top: 1px solid ${colors.greyVeryLight};
`;
export const LeftSidebarContainer = styled.div<{ sidebarWidth: number }>`
    width: ${(p) => p.sidebarWidth}px;
    grid-row-start: 3;
    grid-row-end: 5;
    grid-column-start: 1;
    grid-column-end: 2;
    background: ${themeSettings.sidebarLeftBackgroundColor};
    color: ${themeSettings.sidebarLeftFontColor};
    transition: width 0.1s ease-out;
    padding: 0px;
    overflow: hidden;
    overflow-y: auto;
    &.hidden {
        width: 0;
        padding: 0;
    }
`;

export const ZutatContainer = styled.div`
    display: inline-block;
    margin-left: 10px;
    margin-bottom: 10px;
    border: 1px solid ${colors.greyMiddleLight};
    padding: 0 10px;
    line-height: 20px;
    border-radius: 10px;
    font-size: 12px;
    .pi:hover {
        color: ${colors.redDark};
    }
    .pi {
        margin-right: 5px;
        font-size: 0.9em;
        float: right;
        margin-top: 6px;
        margin-left: 5px;
        cursor: pointer;
    }
`;
export const RightSidebarContainer = styled.div<{ sidebarWidth: number }>`
    width: ${(p) => p.sidebarWidth}px;
    grid-row-start: 3;
    grid-row-end: 5;
    grid-column-start: 3;
    grid-column-end: 4;
    background: ${themeSettings.sidebarRightBackgroundColor};
    color: ${themeSettings.sidebarRightFontColor};
    transition: width 0.1s ease-out;
    padding: 0px;
    overflow: hidden;
    overflow-y: auto;
    &.hidden {
        width: 0;
        padding: 0;
    }
`;
export const MenuButton = styled.button<{ isActive: boolean }>`
    width: auto;
    height: 40px;
    line-height: 40px;
    background: transparent;
    border-radius: 0;
    border: none;
    border-bottom: 2px solid ${(p) => (p.isActive ? colors.redDark : 'transparent')};
    cursor: ${(p) => (p.isActive ? 'default' : 'pointer')};
    pointer-events: ${(p) => (p.isActive ? 'none' : 'all')};
    font-weight: ${(p) => (p.isActive ? 'bolder' : 'normal')};
    padding: 0 15px;
    transition: all 0.2s ease-out;
    margin-left: 5px;
    &:hover {
        background: ${colors.greyVeryLight};
        border-bottom: 2px solid ${colors.greyDark};
    }
`;
export const BurgerMenuButton = styled.button<{ isActive: boolean }>`
    display: block;
    width: 100%;
    font-size: 1.5em;
    text-align: right;
    height: 60px;
    line-height: 60px;
    background: linear-gradient(to left, transparent, ${colors.white});
    border-radius: 0;
    border: none;
    border-bottom: 1px solid ${(p) => (p.isActive ? colors.redDark : colors.greyLight)};
    color: ${(p) => (p.isActive ? colors.redDark : colors.black)};
    cursor: ${(p) => (p.isActive ? 'default' : 'pointer')};
    pointer-events: ${(p) => (p.isActive ? 'none' : 'all')};
    font-weight: ${(p) => (p.isActive ? 'bolder' : 'normal')};
    padding: 0 15px;
    transition: all 0.2s ease-out;
`;
export const FooterButton = styled.button<{ isActive: boolean }>`
    width: auto;
    height: 40px;
    line-height: 60px;
    background: transparent;
    border-radius: 0;
    border: none;
    cursor: ${(p) => (p.isActive ? 'default' : 'pointer')};
    pointer-events: ${(p) => (p.isActive ? 'none' : 'all')};
    font-weight: ${(p) => (p.isActive ? 'bolder' : 'normal')};
    padding: 0;
    transition: all 0.2s ease-out;
    padding: 0 10px;
    &:hover {
        color: ${colors.redDark};
    }
`;

export const BurgerMenuContainer = styled.div`
    width: 30px;
    height: 30px;
    float: right;
    margin-top: 5px;
    margin-right: 15px;
    position: relative;
`;

export const BurgerMenuLine = styled.div<{ pos: 'top' | 'center' | 'bottom'; active: boolean }>`
    position: absolute;
    left: 0;
    right: 0;
    top: ${(p) => (p.pos === 'top' ? '2px' : p.pos === 'center' ? '50%' : 'unset')};
    bottom: ${(p) => (p.pos === 'bottom' ? '2px' : 'unset')};
    transform-origin: center;
    transform: translateY(${(p) => (p.pos === 'center' ? '-50%' : 0)});
    height: 5px;
    border-radius: 3px;
    background: ${(p) => (p.active ? colors.redDark : colors.greyDark)};
`;
export const BurgerMenuMenuContainer = styled.div`
    position: fixed;
    top: 60px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: ${colors.greyVeryLight};
    z-index: 10;
`;

export const ZutatenResultGrid = styled.div<{ shownPanes: number }>`
    display: grid;
    grid-template-columns: repeat(${(p) => p.shownPanes}, 1fr);
    gap: 20px;
    margin-top: 20px;
`;

export const Test = styled.div<{ width: number; backgroundColor: string; rounded: boolean }>`
    height: 100px;
    width: ${(p) => p.width}px;
    background-color: ${(p) => p.backgroundColor};
    transition: all 0.2s ease-out;
    border-radius: ${(p) => (p.rounded ? '50px' : 0)};
    position: relative;
    text-align: center;
    overflow: hidden;
`;

export const PlayButton = styled.button<{}>`
    width: auto;
    height: 40px;
    line-height: 60px;
    background: transparent;
    border-radius: 0;
    border: none;
    padding: 0;
    transition: all 0.2s ease-out;
    padding: 0 10px;
    &:hover {
        color: ${colors.redDark};
    }
`;

export const ChangeButton = styled.div`
    background: LightGreen;
    color: white;
    padding: 10px;
    width: 30%;
    text-align: center;
    display: inline-block;
    border-radius: 20px;
    margin-top: 40px;
`;
