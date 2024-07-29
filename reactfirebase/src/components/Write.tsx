import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import TrashIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Button as ButtonM,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Snackbar,
  Switch,
  TextField,
} from "@mui/material";
import {
  equalTo,
  get,
  getDatabase,
  orderByChild,
  push,
  query,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import app from "../firebaseConfig";
import AverageRating from "./AverageRating";
import ConfirmButton from "./ConfirmButton";
import { useGlobalState } from "./GlobalStates";
import {
  DataSelectDifficulty,
  DataSelectImages,
  Zutat,
  replaceUndefinedWithNull,
} from "./Helpers";
import _ from "lodash";

type Severity = "success" | "error" | "warning" | "info";
interface ShowMessageParams {
  detail: string;
  severity: Severity;
}

function Write() {
  const navigate = useNavigate();
  const { firebaseId } = useParams();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [title, setTitle] = React.useState<string | undefined>(undefined);
  const [description, setDescription] = React.useState<string | undefined>(
    undefined
  );
  const [duration, setDuration] = React.useState(15);
  const [rating, setRating] = React.useState<number | undefined>(0);
  const [difficulty, setDifficulty] = React.useState<number>(1);
  const [persons, setPersons] = React.useState<number>(4);
  const [image, setImage] = React.useState<string | undefined>("noImage.webp");
  const [isVegi, setIsVegi] = React.useState<boolean>(false);
  const [manual, setManual] = React.useState<string[]>([]);
  const [currentStep, setCurrentStep] = React.useState<string>("");
  const [ingredients, setIngredients] = React.useState<Zutat[]>([]);
  const [currentIngredient, setCurrentIngredient] = React.useState<Zutat>({
    text: "",
    amount: undefined,
    unit: undefined,
  });
  const [editStepIndex, setEditStepIndex] = React.useState<number | null>(null);
  const [editIngredientIndex, setEditIngredientIndex] = React.useState<
    number | null
  >(null);
  const [isLoggedIn] = useGlobalState("userIsLoggedIn");
  const [isAdmin] = useGlobalState("userIsAdmin");
  const mayEdit = isLoggedIn && isAdmin;

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    React.useState<Severity>("success");

  const showMessage = ({ detail, severity }: ShowMessageParams) => {
    setSnackbarMessage(detail);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDuration = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setDuration(value !== null ? parseFloat(value) : 0);
  };

  const handlePersons = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setPersons(value !== null ? parseFloat(value) : 0);
  };

  React.useEffect(() => {
    if (firebaseId) {
      const db = getDatabase(app);
      const recipeRef = ref(db, `recipes/${firebaseId}`);
      get(recipeRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setTitle(data.title);
            setDescription(data.description);
            setDuration(data.duration);
            setRating(data.rating);
            setDifficulty(data.difficulty);
            setPersons(data.persons);
            setImage(data.image);
            setIsVegi(data.isVegi);
            setManual(data.manual);
            setIngredients(data.ingredients);
          } else {
            alert("Data not found");
            navigate("/");
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Error loading data");
          navigate("/");
        });
    } else {
      setTitle("");
      setDescription("");
      setDuration(15);
      setRating(0);
      setDifficulty(1);
      setPersons(4);
      setImage(undefined);
      setIsVegi(false);
      setManual([]);
      setIngredients([]);
    }
  }, [firebaseId, navigate]);

  const saveData = async () => {
    const db = getDatabase(app);
    const cleanedData = replaceUndefinedWithNull({
      title,
      description,
      manual,
      ingredients,
      duration,
      rating,
      difficulty,
      persons,
      image,
      isVegi,
    });

    const recipeRef = firebaseId
      ? ref(db, `recipes/${firebaseId}`)
      : push(ref(db, "recipes"));
    const saveMethod = firebaseId ? update : set;

    saveMethod(recipeRef, cleanedData)
      .then(() => {
        showMessage({
          severity: "success",
          detail: firebaseId
            ? "Rezept erfolgreich geändert"
            : "Rezept erfolgreich angelegt",
        });

        setTimeout(() => {
          navigate("/read");
        }, 3000);
      })
      .catch((error) => {
        showMessage({
          severity: "error",
          detail: `Fehler beim Speichern des Rezepts: ${error.message}`,
        });
      });
  };

  const addOrUpdateStep = () => {
    const newManual = [...manual];
    if (editStepIndex !== null) {
      newManual[editStepIndex] = currentStep;
    } else if (currentStep.trim() !== "") {
      newManual.push(currentStep);
    }
    setManual(newManual);
    setCurrentStep("");
    setEditStepIndex(null);
  };

  const addOrUpdateIngredient = () => {
    const newIngredients = [...ingredients];
    if (editIngredientIndex !== null) {
      newIngredients[editIngredientIndex] = currentIngredient;
    } else if (currentIngredient.text.trim() !== "") {
      newIngredients.push(currentIngredient);
    }
    setIngredients(newIngredients);
    setCurrentIngredient({ text: "", amount: undefined, unit: undefined });
    setEditIngredientIndex(null);
  };

  const deleteIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
    if (index === editIngredientIndex) {
      setEditIngredientIndex(null);
      setCurrentIngredient({ text: "", amount: undefined, unit: undefined });
    }
  };

  const editIngredient = (index: number) => {
    setCurrentIngredient(ingredients[index]);
    setEditIngredientIndex(index);
  };

  const cancelEditIngredient = () => {
    setEditIngredientIndex(null);
    setCurrentIngredient({ text: "", amount: undefined, unit: undefined });
  };

  const deleteStep = (index: number) => {
    const newManual = manual.filter((_, i) => i !== index);
    setManual(newManual);
    if (index === editStepIndex) {
      setEditStepIndex(null);
      setCurrentStep("");
    }
  };

  const editStep = (index: number) => {
    setCurrentStep(manual[index]);
    setEditStepIndex(index);
    setTimeout(() => {
      inputRef.current && inputRef.current.focus();
    }, 0);
  };

  const cancelEdit = () => {
    setEditStepIndex(null);
    setCurrentStep("");
  };

  const addIngredient = () => {
    if (currentIngredient.text.trim() !== "") {
      const newIngredient: Zutat = {
        text: currentIngredient.text,
        amount: currentIngredient.amount || null,
        unit: currentIngredient.unit || null,
      };
      setIngredients([...ingredients, newIngredient]);
      setCurrentIngredient({ text: "", amount: undefined, unit: undefined });
    }
  };

  const handleIngredientChange = (
    field: keyof Zutat,
    value: string | number | null
  ) => {
    setCurrentIngredient({
      ...currentIngredient,
      [field]: value === "" ? null : value,
    });
  };

  const handleChangeMenge = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    handleIngredientChange("amount", value !== null ? parseFloat(value) : null);
  };

  const deleteRezept = async (rezParam: string) => {
    const db = getDatabase();
    const rezeptRef = ref(db, "recipes/" + rezParam);
    const commentsRef = query(
      ref(db, "comments"),
      orderByChild("rezeptId"),
      equalTo(rezParam)
    );

    try {
      const commentsSnapshot = await get(commentsRef);

      if (commentsSnapshot.exists()) {
        const comments = commentsSnapshot.val();
        for (const commentKey in comments) {
          const commentRef = ref(db, "comments/" + commentKey);
          await remove(commentRef);
        }
      }
      await remove(rezeptRef);
      navigate("/read");
    } catch (error) {
      console.error(
        "Fehler beim Löschen des Rezepts und seiner Kommentare: ",
        error
      );
    }
  };

  const saveable =
    title &&
    description &&
    duration !== undefined &&
    difficulty > 0 &&
    persons > 0 &&
    manual.length > 0 &&
    ingredients.length > 0;

  if (!mayEdit)
    return (
      <h3 className="missing">
        Du musst als Admin eingelogged sein um neue Rezepte anzulegen
      </h3>
    );
  return (
    <div style={{ padding: 40 }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <h2>{firebaseId ? "Edit Rezept" : "Add Rezept"}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "max-content 1fr max-content",
          gap: "10px 20px",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div>Gericht</div>
        <div>
          <TextField
            label="Gericht"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            color={title ? "success" : undefined}
            style={{ width: "100%" }}
            error={!title}
            autoFocus
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
        <div>
          {!title && (
            <span
              className="exclamation-circle"
              style={{ color: "#D13438", fontSize: "1.5rem" }}
            />
          )}
        </div>

        <div>Beschreibung</div>
        <div>
          <TextField
            label="Beschreibung"
            variant={!description ? "filled" : "outlined"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            color={!description ? "error" : undefined}
            style={{ width: "100%" }}
            error={!description}
            required
          />
        </div>
        <div>
          {!description && (
            <span
              className="exclamation-circle"
              style={{ color: "#D13438", fontSize: "1.5rem" }}
            />
          )}
        </div>

        <div>Arbeitsschritte</div>
        {manual.map((m, i) =>
          editStepIndex === i ? (
            <React.Fragment key={i}>
              <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                <TextField
                  label="Arbeitsschritte"
                  variant={!currentStep ? "filled" : "outlined"}
                  value={currentStep}
                  onChange={(e) => setCurrentStep(e.target.value)}
                  ref={inputRef}
                  style={{ width: "100%" }}
                  error={!currentStep}
                  required
                />
              </div>
              <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
                <ButtonM
                  onClick={addOrUpdateStep}
                  color="success"
                  variant="contained"
                  startIcon={<CheckIcon />}
                  style={{ marginRight: 5 }}
                  disabled={!currentStep}
                >
                  update
                </ButtonM>
                <ButtonM
                  onClick={cancelEdit}
                  color="error"
                  startIcon={<CancelIcon />}
                ></ButtonM>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment key={i}>
              <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                <TextField
                  label="Arbeitsschritte neu"
                  variant={"filled"}
                  value={`Step ${i + 1}: ${m}`}
                  style={{ width: "100%" }}
                  disabled
                />
              </div>
              <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
                <ButtonM
                  onClick={() => editStep(i)}
                  color="info"
                  style={{ marginRight: 5 }}
                  startIcon={<EditIcon />}
                >
                  edit
                </ButtonM>
                <ButtonM
                  onClick={() => deleteStep(i)}
                  startIcon={<TrashIcon />}
                  color="error"
                ></ButtonM>
              </div>
            </React.Fragment>
          )
        )}
        {editStepIndex === null && (
          <>
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
              <TextField
                label="Arbeitsschritte"
                variant={manual.length === 0 ? "filled" : undefined}
                value={currentStep}
                placeholder={
                  manual.length === 0
                    ? undefined
                    : `Step ${manual.length + 1} (optional)`
                }
                onChange={(e) => setCurrentStep(e.target.value)}
                style={{ width: "100%" }}
                error={manual.length === 0}
                required
              />
            </div>

            <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
              {currentStep !== "" ? (
                <ButtonM
                  onClick={addOrUpdateStep}
                  color="success"
                  variant="contained"
                  startIcon={<CheckIcon />}
                >
                  apply
                </ButtonM>
              ) : (
                <div>
                  {!description && manual.length === 0 && (
                    <span
                      className="exclamation-circle"
                      style={{ color: "#D13438", fontSize: "1.5rem" }}
                    />
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div>Zutaten</div>
        {ingredients.map((ingredient, index) => {
          const amount = ingredient.amount ?? "";
          const unit = ingredient.unit ?? "";
          const text = ingredient.text;
          const label =
            (amount ? amount + " " : "") + (unit ? unit + " " : "") + text;
          return editIngredientIndex === index ? (
            <React.Fragment key={index}>
              <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                <div className="inputgroup">
                  <TextField
                    label="Zutaten"
                    variant={!currentStep ? "filled" : "outlined"}
                    value={currentIngredient.text}
                    onChange={(e) =>
                      handleIngredientChange("text", e.target.value)
                    }
                    autoFocus={true}
                    placeholder={
                      manual.length === 0
                        ? undefined
                        : `Step ${manual.length + 1} (optional)`
                    }
                    style={{ width: "50%" }}
                    error={!currentStep || currentStep === ""}
                    required
                  />
                  <TextField
                    label="Einheit"
                    variant="outlined"
                    value={currentIngredient.unit || ""}
                    onChange={(e) =>
                      handleIngredientChange("unit", e.target.value)
                    }
                    autoFocus={true}
                    placeholder="Einheit"
                    style={{ width: "50px", margin: "0 5px" }}
                    required
                  />
                </div>
              </div>
              <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
                <ButtonM
                  onClick={addOrUpdateIngredient}
                  color="success"
                  startIcon={<CheckIcon />}
                  disabled={currentIngredient.text === null}
                  style={{ marginRight: 5 }}
                >
                  update
                </ButtonM>
                <ButtonM
                  onClick={cancelEditIngredient}
                  color="error"
                  startIcon={<CancelIcon />}
                ></ButtonM>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment key={index}>
              <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                <TextField
                  label={`Zutat ${index + 1}`}
                  variant="filled"
                  value={label}
                  style={{ width: "100%" }}
                  disabled
                />
              </div>
              <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
                <ButtonM
                  onClick={() => editIngredient(index)}
                  style={{ marginRight: 5 }}
                  color="warning"
                  startIcon={<EditIcon />}
                >
                  edit
                </ButtonM>
                <ButtonM
                  onClick={() => deleteIngredient(index)}
                  color="error"
                  startIcon={<TrashIcon />}
                ></ButtonM>
              </div>
            </React.Fragment>
          );
        })}

        {editIngredientIndex === null && (
          <>
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 200px",
                  columnGap: 10,
                }}
              >
                <TextField
                  label="Zutat"
                  variant="outlined"
                  value={currentIngredient.text}
                  placeholder={`Zutat ${
                    ingredients.length > 0 ? "(optional)" : ""
                  }`}
                  onChange={(e) =>
                    handleIngredientChange("text", e.target.value)
                  }
                  error={currentIngredient.text === ""}
                  fullWidth
                  required
                />
                <TextField
                  label="Einheit"
                  variant="outlined"
                  value={currentIngredient.unit || ""}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(e) =>
                    handleIngredientChange(
                      "unit",
                      e.target.value ? e.target.value : null
                    )
                  }
                />

                <TextField
                  value={currentIngredient.amount}
                  variant="outlined"
                  onChange={handleChangeMenge}
                  fullWidth
                  required
                  label="Menge"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {currentIngredient.unit}
                      </InputAdornment>
                    ),
                  }}
                  error={currentIngredient.amount === undefined}
                />
              </div>
            </div>
            <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
              {currentIngredient.text !== "" ? (
                <>
                  <ButtonM
                    onClick={addIngredient}
                    color="success"
                    startIcon={<CheckIcon />}
                  >
                    apply
                  </ButtonM>
                </>
              ) : (
                <div>
                  {!description && ingredients.length === 0 && (
                    <span
                      className="exclamation-circle"
                      style={{ color: "#D13438", fontSize: "1.5rem" }}
                    />
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>
          Benötigte Zeit
        </div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <TextField
            value={duration}
            variant="outlined"
            onChange={handleDuration}
            fullWidth
            required
            label="Benötigte Zeit"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">Min</InputAdornment>,
              inputProps: {
                min: 15,
                step: 15,
              },
            }}
          />
        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>
          Aktuelles Rating
        </div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <TextField
            fullWidth
            label="Aktuelles Rating"
            disabled
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: <AverageRating firebaseId={firebaseId ?? ""} />,
            }}
          />
        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>
          Schwierigkeit
        </div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <TextField
            select
            label="Schwierigkeitsgrad"
            defaultValue="leicht"
            style={{ width: "100%" }}
          >
            {_.map(DataSelectDifficulty, (option, i) => (
              <MenuItem key={i} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>
          Personenanzahl
        </div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <TextField
            value={persons}
            variant="outlined"
            onChange={handlePersons}
            fullWidth
            required
            label="Personenanzahl"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {persons === 1 ? " Person" : " Personen"}
                </InputAdornment>
              ),
              inputProps: {
                min: 1,
                max: 99,
              },
            }}
          />
        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Bild</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <TextField
            value={image}
            select
            label="Bild"
            defaultValue="noImage.webp"
            style={{ width: "100%" }}
          >
            {_.map(DataSelectImages, (option, i) => (
              <MenuItem key={i} value={option.value}>
                <div
                  style={{ display: "flex", alignItems: "center", height: 40 }}
                >
                  <div
                    style={{
                      height: 35,
                      width: 35,
                      padding: 0,
                      marginLeft: -7,
                      marginRight: 10,
                      backgroundImage: `url("${process.env.PUBLIC_URL}/images/rezepte/${option.value}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center center",
                    }}
                  />
                  <div>{option.value}</div>
                </div>
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Vegetarisch?</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <TextField
            fullWidth
            label="Vegetarisch?"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <FormControlLabel
                  control={
                    <Switch
                      onChange={() => setIsVegi(!isVegi)}
                      checked={isVegi}
                    />
                  }
                  label={isVegi ? "ja" : "nein"}
                />
              ),
            }}
          />
        </div>
        <div
          style={{
            gridColumnStart: 1,
            gridColumnEnd: 4,
            background: "#323130",
            height: 1,
          }}
        />
        <div>
          {firebaseId && (
            <div className="inputgroup" style={{ width: "100%" }}>
              <ConfirmButton
                action={() => deleteRezept(firebaseId)}
                style={{ float: "left" }}
                text="Rezept löschen"
              />
            </div>
          )}
        </div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <ButtonM
            onClick={() => navigate("/read")}
            style={{ float: "right" }}
            color="secondary"
          >
            Abbrechen
          </ButtonM>
        </div>
        <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
          <ButtonM
            onClick={saveData}
            disabled={!saveable}
            style={{ width: "100%" }}
            color={saveable ? "success" : "error"}
            variant="outlined"
          >
            {saveable ? "SAVE DATA" : "MISSING DATA"}
          </ButtonM>
        </div>
      </div>
    </div>
  );
}
export default Write;
