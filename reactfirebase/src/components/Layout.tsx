import * as React from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import { breakpoints } from './Helpers';
import {
    ContentContainer,
    FooterContainer,
    HeaderContainer,
    HeaderContainerText,
    LeftSidebarContainer,
    MainContainer,
    MainGrid,
    MenuContainer,
    OuterContainer,
    RightSidebarContainer
} from './LayoutSC';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';

interface LayoutProps { }

const Layout: React.FunctionComponent<LayoutProps> = (p) => {
    const [browserWidth, setBrowserWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => {
            setBrowserWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const showLeftSideBar = browserWidth > breakpoints.smallDesktop;
    const showLRightSideBar = browserWidth >= breakpoints.tablet;
    // const sidebarWidth = browserWidth >= breakpoints.largeDesktop ? 350 : 300;
    const sidebarWidth = 0;
    const contentWidth = browserWidth >= breakpoints.largeDesktop ? 1800 : 1440;
    const location = useLocation();
    const pathName = location.pathname;

    const { id } = useParams();

    // const home = { icon: 'pi pi-home', url: '/' };
    // const isRoot = pathName === '/';

    const isRezept = !id && pathName.includes('/rezepte');
    const isRezeptDetail = id && pathName.includes('/rezepte/');
    const isZutaten = !id && pathName.includes('/zutaten');

    const visitedSite = isRezept ? 'rezepte' : isRezeptDetail ? 'rezepteDetail' : isZutaten ? 'zutaten' : undefined;

    return (
        <OuterContainer>
            <MainContainer contentWidth={contentWidth}>
                <MainGrid>
                    <MenuContainer><Header /></MenuContainer>
                    <HeaderContainer image={"image"}>
                        <HeaderContainerText>{"Headline"}</HeaderContainerText>
                    </HeaderContainer>
                    <LeftSidebarContainer className={showLeftSideBar ? undefined : 'hidden'} sidebarWidth={sidebarWidth}>
                        <SidebarLeft site={visitedSite} />
                    </LeftSidebarContainer>
                    <ContentContainer>
                        <Outlet />
                    </ContentContainer>
                    <RightSidebarContainer className={showLRightSideBar ? undefined : 'hidden'} sidebarWidth={sidebarWidth}>
                        <SidebarRight site={visitedSite} />
                    </RightSidebarContainer>
                    <FooterContainer>
                        <Footer />
                    </FooterContainer>
                </MainGrid>
            </MainContainer>
        </OuterContainer>
    );
};
export default Layout;
