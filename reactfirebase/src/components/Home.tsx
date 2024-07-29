import { Box } from "@mui/material";
import React from "react";
import CarouselHome from "./CarouselHome";
import { colors, useElementWidth } from "./Helpers";
import { Ueberschrift } from "./LayoutSC";

interface HomeProps {}

const Home = (p: HomeProps) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const contentWidth = useElementWidth(divRef);

  return (
    <div style={{ padding: 40 }}>
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
        <Box
          sx={{
            width: contentWidth,
            borderRadius: 1,
            border: "1px solid " + colors.greyMiddleLight,
          }}
        >
          <CarouselHome cWidth={contentWidth} />
        </Box>
      </div>
    </div>
  );
};

export default Home;
