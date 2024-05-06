import { get, getDatabase, ref } from "firebase/database";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import app from "../firebaseConfig";
import AverageRating from "./AverageRating";
import Comments from "./Comments";
import Header from "./Header";
import {
    Rezept,
    chefHatActive,
    chefHatInactive,
    colors,
    convertUnits,
    imageRezeptUrlPrefix,
    useElementWidth,
} from "./Helpers";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import styled from "styled-components";
import { Rating } from "primereact/rating";
import {
    InputNumber,
    InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { Accordion, AccordionTab } from "primereact/accordion";
import { setGlobalState, useGlobalState } from "./GlobalStates";
import _ from "lodash";

const HeaderContainer = styled.div<{ imageUrl: string }>`
  width: 100%;
  height: 100px;
  background-image: ${(p) => `url("${p.imageUrl}")`};
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
`;

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

    const header = (
        <div>
            <HeaderContainer imageUrl={imageRezeptUrlPrefix + rImage} />
        </div>
    );

    const footer = (
        <div>
            <Button label="go back" onClick={() => navigate(-1)} />
        </div>
    );

    return (
        <div ref={divRef}>
            <Header />
            {recipe && (
                <Card
                    title={recipe.title}
                    subTitle={recipe.description}
                    header={header}
                    footer={footer}
                    style={{ marginBottom: 50 }}
                >
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
                            value={recipe.difficulty}
                            readOnly
                            cancel={false}
                            onIcon={chefHatActive}
                            stars={3}
                            offIcon={chefHatInactive}
                            style={{ paddingLeft: "30px" }}
                        />

                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span
                                style={{ marginRight: 5, paddingLeft: "30px" }}
                                className="pi pi-stopwatch"
                            ></span>
                            <div>{recipe.duration}m </div>
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
                            <span style={{ marginRight: 5 }} className="pi pi-users" />
                            <div style={{ position: "relative" }}>
                                <InputNumber
                                    value={personen}
                                    onValueChange={(e: InputNumberValueChangeEvent) =>
                                        handlePersonCount(e.value ?? 5)
                                    }
                                    showButtons
                                    min={1}
                                />

                                {recipe.persons !== personen && (
                                    <Button
                                        icon="pi pi-times"
                                        rounded
                                        size="small"
                                        text
                                        severity="danger"
                                        onClick={handleResetPersonCount}
                                        tooltip="zurücksetzen"
                                        style={{
                                            position: "absolute",
                                            top: 8,
                                            right: 45,
                                            width: 24,
                                            height: 24,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <Accordion activeIndex={[0, 1, 2]} multiple={true}>
                        <AccordionTab header="Zutaten">
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
                                                    {calc.value} {calc.unit}
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
                        </AccordionTab>
                        <AccordionTab header="Anleitung">
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
                        </AccordionTab>
                    </Accordion>
                </Card>
            )}
            {recipe ? (
                <>
                    <div
                        style={{
                            padding: 10,
                            border: "1px double rgba(0,0,0,0.2)",
                            marginTop: 10,
                        }}
                    >
                        <Comments />
                    </div>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
export default Single;
