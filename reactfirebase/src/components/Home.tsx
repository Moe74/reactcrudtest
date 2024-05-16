import React from "react";
import styled from "styled-components";
import {
  Rezept,
  breakpoints,
  imageRezeptUrlPrefix,
  useElementWidth,
} from "./Helpers";
import { useNavigate } from "react-router-dom";
import { get, getDatabase, ref } from "firebase/database";
import app from "../firebaseConfig";
import _ from "lodash";
import AverageRating from "./AverageRating";

interface HomeProps {}

const OuterContainer = styled.div<{ shownPanes: number }>`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(${(p) => p.shownPanes}, 1fr);
  gap: 25px;
  margin-top: 20px;
`;
const Pane = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 40px;
  box-shadow: 0 6px 8px -6px #000;
  cursor: pointer;
  transition: all 0.2s ease-out;
  &:hover {
    transform: scale(1.03);
  }
`;
const PaneImage = styled.div<{ image: string }>`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: green;
  background-image: url("${(p) => p.image}");
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: relative;
`;
const PaneText = styled.div`
  line-height: 40px;
  padding: 0 10px;
`;

const RatingContainer = styled.div`
  padding: 10px 10px;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  svg {
    color: #fff;
    opacity: 0.8;
  }
`;

const Ueberschrift = styled.div`
  font-size: 25px;
  color: darkred;
  font-weight: bold;
`;

/* const HomePage: React.FunctionComponent<HomePageProps> = (p) => { */

const Home = (p: HomeProps) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const contentWidth = useElementWidth(divRef);

  const [rezepte, setRezepte] = React.useState<Rezept[]>([]);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const db = getDatabase(app);
    const dbRef = ref(db, "recipes");
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const myData = snapshot.val();
      const tempArray = Object.keys(myData).map((myFireId) => {
        return {
          ...myData[myFireId],
          rezeptId: myFireId,
        };
      });
      setRezepte(tempArray);
    } else {
      alert("error");
    }
  };

  const sorted = _.sortBy(rezepte, (a) => a.rating);
  /* const sorted = rezepte; */
  const shownPanes =
    contentWidth <= breakpoints.mobile
      ? 1
      : contentWidth > breakpoints.mobile && contentWidth <= breakpoints.tablet
      ? 2
      : 3;

  let navigate = useNavigate();

  return (
    <>
      <div>
        <h1>Home</h1>
      </div>
      <div ref={divRef}>
        <Ueberschrift>Keine Gerichtideen?</Ueberschrift>
        <p style={{ marginBottom: "20px" }}>
          Hier haben wir euch unsere leckersten und einfachsten Lieblingsrezepte
          zusammengestellt, die ihr ganz leicht nach Schwierigkeitsgrad und
          Aufwand filtern könnt.
        </p>
        <p style={{ marginBottom: "30px" }}>Viel Spaß beim Nachkochen!</p>
        <OuterContainer shownPanes={shownPanes}>
          {_.map(sorted, (r, i) => {
            if (i + 1 <= shownPanes)
              return (
                <Pane key={i} onClick={() => navigate("/single/" + r.rezeptId)}>
                  <PaneImage
                    image={imageRezeptUrlPrefix + (r.image ?? "noImage.webp")}
                  >
                    <RatingContainer>
                      <AverageRating firebaseId={r.rezeptId ?? ""} />
                    </RatingContainer>
                  </PaneImage>
                  <PaneText>{r.title}</PaneText>
                </Pane>
              );
          })}
        </OuterContainer>
      </div>
    </>
  );
};

export default Home;
