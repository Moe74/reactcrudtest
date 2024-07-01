import CancelIcon from "@mui/icons-material/CancelOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UserIcon from "@mui/icons-material/Group";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  TextField,
  Typography
} from "@mui/material";
import Card from "@mui/material/Card";
import { get, getDatabase, ref } from "firebase/database";
import _ from "lodash";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import app from "../firebaseConfig";
import AverageRating from "./AverageRating";
import Comments from "./Comments";
import { setGlobalState, useGlobalState } from "./GlobalStates";
import {
  Rezept,
  chefHatActive,
  chefHatInactive,
  colors,
  convertUnits,
  formatMinuteToHours,
  useElementWidth,
} from "./Helpers";



function Single() {
  const { firebaseId } = useParams();
  const [recipe, setRecipe] = React.useState<Rezept | null>(null);
  const divRef = React.useRef<HTMLDivElement>(null);
  const contentWidth = useElementWidth(divRef);
  const [personen, setPersonen] = React.useState(recipe?.persons ?? 4);
  const handlePersonCount = React.useMemo(
    () => (p: number) => {
      setPersonen(p);
      setGlobalState("defaultPersons", p);
    },
    []
  );
  const handleResetPersonCount = () => {
    setPersonen(recipe?.persons ?? 4);
    setGlobalState("defaultPersons", 7);
  };
  const [personCount] = useGlobalState("defaultPersons");

  React.useEffect(() => {
    const fetchData = async () => {
      const db = getDatabase(app);
      const dbRef = ref(db, `recipes/${firebaseId}`);
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        setRecipe(snapshot.val() as Rezept);
      } else {
        alert("Keine Daten gefunden!");
      }
    };
    fetchData();
  }, [firebaseId]);

  const navigate = useNavigate();

  const rImage = recipe ? recipe.image ?? "noImage.webp" : "noImage.webp";
  const imagePath = `${process.env.PUBLIC_URL}/images/rezepte/${rImage}`;

  return (
    <div ref={divRef}>
      {/* <Header /> */}
      {recipe && (
        <Card variant="outlined">
          <CardMedia sx={{ height: 140 }} image={imagePath} />
          <CardContent
            /* title={recipe.title}
            subTitle={recipe.description} */
            /* header={header}
            footer={footer} */
            style={{ marginBottom: 50 }}
            component="div"
          >
            <Typography
              variant="h6"
              style={{ fontWeight: "bold", marginBottom: 5 }}
              color="text.primary"
            >
              {recipe.title}
            </Typography>
            <Typography color="text.secondary" style={{ marginBottom: 10 }}>
              {recipe.description}
            </Typography>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "20px",
                marginBottom: 12.5,
              }}
            >
              <AverageRating firebaseId={firebaseId ?? ""} />

              <Rating
                defaultValue={recipe.difficulty}
                icon={chefHatActive}
                emptyIcon={chefHatInactive}
                max={3}
                readOnly
                sx={{ pl: 4 }}
              />

              <div style={{ display: "flex", alignItems: "center" }}>
                <span
                  style={{ marginRight: 5, paddingLeft: "30px" }}
                  className="pi pi-stopwatch"
                ></span>
                <div>{formatMinuteToHours(recipe.duration)} </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: colors.greenDark,
                  paddingLeft: "35px",
                }}
              >
                {recipe.isVegi === true && (
                  <>
                    <span
                      className="pi pi-apple"
                      style={{ marginRight: 5, fontWeight: "bolder" }}
                    />
                    vegi
                  </>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: contentWidth <= 700 ? undefined : "auto",
                }}
              >
                <UserIcon sx={{ mr: 2 }} />
                <div style={{ position: "relative" }}>
                  <TextField
                    label="Personen"
                    variant="outlined"
                    value={personen}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      handlePersonCount(
                        value === "" ? 1 : parseInt(value, 10) < 1 ? 1 : parseInt(value, 10)
                      );
                    }}
                    type="number"
                  />

                  {recipe.persons !== personen && (
                    <Button
                      onClick={handleResetPersonCount}
                      color="error"
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 20,
                        transform: "scale(0.8)",
                      }}
                      size={"small"}
                    >
                      <CancelIcon />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  Zutaten
                </AccordionSummary>
                <AccordionDetails>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(150px, max-content) 1fr" /*Geandert Ay */,
                      columnGap: 10,
                    }}
                  >
                    {_.sortBy(recipe.ingredients, [
                      (x) => x.amount === undefined || x.unit === undefined,
                    ]).map((x, index) => {
                      const originalPersons = recipe.persons;
                      const personsFactor =
                        (personCount ?? originalPersons) / originalPersons;
                      const isAmountHidden =
                        x.amount === undefined || x.unit === undefined;
                      const temp = x.amount ? x.amount * personsFactor : 0;
                      const calc = convertUnits(temp, x.unit ?? "");

                      let roundedValue = Math.round(calc.value * 10) / 10;
                      if (roundedValue < 0.5) {
                        roundedValue = 0.5;
                      }

                      return (
                        <React.Fragment key={index}>
                          {!isAmountHidden && (
                            <div>
                              <span
                                style={{
                                  fontSize: 10,
                                  marginRight: 10,
                                  float: "left",
                                  marginTop: 6,
                                }}
                                className="pi pi-arrow-right"
                              />
                              {roundedValue} {calc.unit}
                            </div>
                          )}
                          <div
                            style={{
                              gridColumnStart: isAmountHidden ? 1 : 2,
                              gridColumnEnd: 3,
                            }}
                          >
                            {isAmountHidden ? (
                              <>
                                <span
                                  style={{
                                    fontSize: 10,
                                    marginRight: 10,
                                    float: "left",
                                    marginTop: 6,
                                  }}
                                  className="pi pi-arrow-right"
                                />{" "}
                                {x.text}
                              </>
                            ) : (
                              x.text
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
            <div>
              <Accordion defaultExpanded style={{ marginTop: 20 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  Anleitung
                </AccordionSummary>
                <AccordionDetails>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "max-content 1fr",
                      columnGap: 10,
                      rowGap: 5,
                    }}
                  >
                    {_.map(recipe.manual, (m, i) => {
                      return (
                        <React.Fragment key={i}>
                          <div>{i + 1}</div>
                          <div> {m}</div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
            {/* <AccordionPR activeIndex={[0, 1, 2]} multiple={true}> */}
          </CardContent>
          <CardActions>
            <Button onClick={() => navigate(-1)}>go back</Button>
          </CardActions>
        </Card>
      )}
      {recipe ? (

        <Comments />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
export default Single;
