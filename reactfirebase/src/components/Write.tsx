import { equalTo, get, getDatabase, orderByChild, push, query, ref, remove, set, update, } from "firebase/database";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputNumber, InputNumberChangeEvent } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Rating } from "primereact/rating";
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import app from "../firebaseConfig";
import { useGlobalState } from "./GlobalStates";
import { Zutat, replaceUndefinedWithNull } from "./Helpers";
import { Toast } from "primereact/toast";
import ConfirmButton from "./ConfirmButton";
import { TextField } from "@mui/material";


// interface ShowMessageParams {
//   ref: React.RefObject<Toast>;
// }
type Severity = 'success' | 'info' | 'warn' | 'error';
interface ShowMessageParams {
  detail: string;
  ref: React.RefObject<Toast>;
  severity: Severity;
}

function Write() {
  const navigate = useNavigate();
  const { firebaseId } = useParams();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [title, setTitle] = React.useState<string | undefined>(undefined);
  const [description, setDescription] = React.useState<string | undefined>(undefined);
  const [duration, setDuration] = React.useState(15);
  const [rating, setRating] = React.useState<number | undefined>(0);
  const [difficulty, setDifficulty] = React.useState<number>(1);
  const [persons, setPersons] = React.useState<number>(4);
  const [image, setImage] = React.useState<string | undefined>("noImage.webp");
  const [isVegi, setIsVegi] = React.useState<boolean>(false);
  const [manual, setManual] = React.useState<string[]>([]);
  const [currentStep, setCurrentStep] = React.useState<string>('');
  const [ingredients, setIngredients] = React.useState<Zutat[]>([]);
  const [currentIngredient, setCurrentIngredient] = React.useState<Zutat>({ text: '', amount: undefined, unit: undefined });
  const [editStepIndex, setEditStepIndex] = React.useState<number | null>(null);
  const [editIngredientIndex, setEditIngredientIndex] = React.useState<number | null>(null);
  const [isLoggedIn] = useGlobalState("userIsLoggedIn");
  const [isAdmin] = useGlobalState("userIsAdmin");
  const mayEdit = isLoggedIn && isAdmin;

  const toastCenter = React.useRef(null);


  const showMessage = ({ ref, severity, detail }: ShowMessageParams) => {
    ref.current?.show({
      severity: severity,
      summary: severity === 'error' ? 'Fehler' : 'Info',
      detail: detail,
      life: 3000
    });
  };

  const handleDurationChange = (e: InputNumberChangeEvent) => {
    if (e.value !== null) {
      setDuration(e.value);
    } else {
      setDuration(0);
    }
  };
  const handlePersonsChange = (e: InputNumberChangeEvent) => {
    if (e.value !== null) {
      setPersons(e.value);
    } else {
      setPersons(4);
    }
  };

  React.useEffect(() => {
    if (firebaseId) {
      const db = getDatabase(app);
      const recipeRef = ref(db, `recipes/${firebaseId}`);
      get(recipeRef).then((snapshot) => {
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
      }).catch((error) => {
        console.error(error);
        alert("Error loading data");
        navigate("/");
      });
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
      isVegi
    });

    const recipeRef = firebaseId ? ref(db, `recipes/${firebaseId}`) : push(ref(db, "recipes"));
    const saveMethod = firebaseId ? update : set;

    saveMethod(recipeRef, cleanedData)
      .then(() => {
        showMessage({
          ref: toastCenter,
          severity: 'success',
          detail: firebaseId ? 'Rezept erfolgreich geändert' : 'Rezept erfolgreich angelegt'
        });

        setTimeout(() => {
          navigate("/read");
        }, 3000);
      })
      .catch((error) => {
        showMessage({
          ref: toastCenter,
          severity: 'error',
          detail: `Fehler beim Speichern des Rezepts: ${error.message}`
        });
      });
  };

  const addOrUpdateStep = () => {
    const newManual = [...manual];
    if (editStepIndex !== null) {
      newManual[editStepIndex] = currentStep;
    } else if (currentStep.trim() !== '') {
      newManual.push(currentStep);
    }
    setManual(newManual);
    setCurrentStep('');
    setEditStepIndex(null);
  };

  const addOrUpdateIngredient = () => {
    const newIngredients = [...ingredients];
    if (editIngredientIndex !== null) {
      newIngredients[editIngredientIndex] = currentIngredient;
    } else if (currentIngredient.text.trim() !== '') {
      newIngredients.push(currentIngredient);
    }
    setIngredients(newIngredients);
    setCurrentIngredient({ text: '', amount: undefined, unit: undefined });
    setEditIngredientIndex(null);
  };

  const deleteIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
    if (index === editIngredientIndex) {
      setEditIngredientIndex(null);
      setCurrentIngredient({ text: '', amount: undefined, unit: undefined });
    }
  };

  const editIngredient = (index: number) => {
    setCurrentIngredient(ingredients[index]);
    setEditIngredientIndex(index);
  };

  const cancelEditIngredient = () => {
    setEditIngredientIndex(null);
    setCurrentIngredient({ text: '', amount: undefined, unit: undefined });
  };

  const deleteStep = (index: number) => {
    const newManual = manual.filter((_, i) => i !== index);
    setManual(newManual);
    if (index === editStepIndex) {
      setEditStepIndex(null);
      setCurrentStep('');
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
    setCurrentStep('');
  };

  const addIngredient = () => {
    if (currentIngredient.text.trim() !== '') {
      const newIngredient: Zutat = {
        text: currentIngredient.text,
        amount: currentIngredient.amount || null,
        unit: currentIngredient.unit || null
      };
      setIngredients([...ingredients, newIngredient]);
      setCurrentIngredient({ text: '', amount: undefined, unit: undefined });
    }
  };

  const handleIngredientChange = (field: keyof Zutat, value: string | number | null) => {
    setCurrentIngredient({ ...currentIngredient, [field]: value === '' ? null : value });
  };


  const deleteRezept = async (rezParam: string) => {
    const db = getDatabase();
    const rezeptRef = ref(db, "recipes/" + rezParam);
    const commentsRef = query(ref(db, "comments"), orderByChild('rezeptId'), equalTo(rezParam));

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
      console.error("Fehler beim Löschen des Rezepts und seiner Kommentare: ", error);
    }
  }

  const onDifficultyChange = (e: { value: number }) => {
    setDifficulty(e.value);
  };
  const onImageChange = (e: { value: string }) => {
    setImage(e.value);
  };


  const selectedRezeptOptionTemplate = (option: any) => {
    if (option) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            height: 35,
            width: 35,
            padding: 0,
            margin: -7,
            marginRight: 10,
            backgroundImage: `url("${process.env.PUBLIC_URL}/images/rezepte/${option.value}")`,
            backgroundSize: "cover",
            backgroundPosition: "center center"
          }} />
          <div>{option.value}</div>
        </div>
      );
    }
  };
  const selectedRezeptOptionTemplateX = (option: any) => {
    if (option) {
      return (
        <div style={{ display: "flex", alignItems: "center", height: 21 }}>
          <div style={{
            height: 35,
            width: 35,
            padding: 0,
            marginLeft: -7,
            marginRight: 10,
            backgroundImage: `url("${process.env.PUBLIC_URL}/images/rezepte/${option.value}")`,
            backgroundSize: "cover",
            backgroundPosition: "center center"
          }} />
          <div>{option.value}</div>
        </div>
      );
    }
  };

  const saveable = title && description && duration !== undefined && difficulty > 0 && persons > 0 && manual.length > 0 && ingredients.length > 0;

  if (!mayEdit)
    return (
      <>
        {/* <Header /> */}
        <h3 className="missing">Du musst als Admin eingelogged sein um neue Rezepte anzulegen</h3>
      </>
    );
  return (
    <div style={{ padding: 40 }}>
      <Toast ref={toastCenter} position="center" />
      {/* <Header /> */}
      <h2>{firebaseId ? "Edit Rezept" : "Add Rezept"}</h2>







      {/* NEW START */}
      <h1>NEW</h1>
      <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr max-content", gap: "10px 20px", alignItems: "center", width: "100%" }}>
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
            required
          />
        </div>
        <div>
          {!title && <span className="pi pi-exclamation-circle" style={{ color: '#D13438', fontSize: '1.5rem' }} />}
        </div>

        <div>Beschreibung</div>
        <div>
          <InputTextarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%" }} invalid={!description} variant={!description ? "filled" : undefined} />
        </div>
        <div>
          {!description && <span className="pi pi-exclamation-circle" style={{ color: '#D13438', fontSize: '1.5rem' }} />}
        </div>

        <div>Arbeitsschritte</div>
        {manual.map((m, i) => (
          editStepIndex === i ? (
            <React.Fragment key={i}>
              <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                <InputText style={{ width: "100%" }} value={currentStep} onChange={(e) => setCurrentStep(e.target.value)} ref={inputRef} invalid={!currentStep} variant={!currentStep ? "filled" : undefined} />
              </div>
              <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
                <Button onClick={addOrUpdateStep} label="update" severity="success" icon="pi pi-check" disabled={!currentStep} style={{ marginRight: 5 }} />
                <Button onClick={cancelEdit} icon="pi pi-times" severity="secondary" />
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment key={i}>
              <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                <InputText style={{ width: "100%", color: "#323130" }} value={`Step ${i + 1}: ${m}`} disabled variant="filled" />
              </div>
              <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
                <Button onClick={() => editStep(i)} label="edit" severity="warning" icon="pi pi-pen-to-square" style={{ marginRight: 5 }} />
                <Button onClick={() => deleteStep(i)} icon="pi pi-trash" severity="danger" />
              </div>
            </React.Fragment>
          )
        ))}
        {editStepIndex === null && (
          <>
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
              <InputText
                style={{ width: "100%" }}
                invalid={manual.length === 0} variant={manual.length === 0 ? "filled" : undefined}
                value={currentStep}
                placeholder={manual.length === 0 ? undefined : `Step ${manual.length + 1} (optional)`}
                onChange={(e) => setCurrentStep(e.target.value)}
              />
            </div>

            <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>

              {currentStep !== "" ?
                <Button onClick={addOrUpdateStep} label="apply" severity="success" icon="pi pi-check" />
                :

                <div>
                  {!description && manual.length === 0 && <span className="pi pi-exclamation-circle" style={{ color: '#D13438', fontSize: '1.5rem' }} />}
                </div>
              }
            </div>
          </>
        )}








        <div>Zutaten</div>
        {ingredients.map((ingredient, index) => {
          const amount = ingredient.amount ?? "";
          const unit = ingredient.unit ?? "";
          const text = ingredient.text;
          const label = (amount ? amount + " " : "") + (unit ? unit + " " : "") + text;
          return (
            editIngredientIndex === index ? (
              <React.Fragment key={index}>
                <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }} >
                  <div className="p-inputgroup">
                    <InputText
                      style={{ width: "50%" }}
                      invalid={!currentStep || currentStep === ""}
                      variant={!currentStep ? "filled" : undefined}
                      value={currentIngredient.text}
                      placeholder={manual.length === 0 ? undefined : `Step ${manual.length + 1} (optional)`}
                      onChange={(e) => handleIngredientChange('text', e.target.value)}
                      autoFocus={true}
                    />
                    <InputText
                      style={{ width: "50px", margin: "0 5px" }}
                      value={currentIngredient.unit || ''}
                      placeholder="Einheit"
                      onChange={(e) => handleIngredientChange('unit', e.target.value)}
                      min={0}
                    />
                    <InputNumber
                      showButtons
                      value={currentIngredient.amount}
                      onChange={(e: InputNumberChangeEvent) => handleIngredientChange('amount', e.value !== null ? e.value : null)}
                      placeholder="Menge"
                      style={{ width: "100px" }}
                      step={0.25}
                      minFractionDigits={2}
                      locale="de-DE"
                      suffix={" " + currentIngredient.unit ?? undefined}
                    />
                  </div>
                </div>
                <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }} >
                  <Button onClick={addOrUpdateIngredient} label="update" severity="success" icon="pi pi-check" disabled={currentIngredient.text === null} style={{ marginRight: 5 }} />
                  <Button onClick={cancelEditIngredient} severity="secondary" icon="pi pi-times" />
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment key={index}>
                <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                  <InputText
                    style={{ width: "100%", color: "#323130" }}
                    value={label}
                    disabled
                  />
                </div>
                <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }} >
                  <Button onClick={() => editIngredient(index)} label="edit" severity="warning" icon="pi pi-pen-to-square" style={{ marginRight: 5 }} />
                  <Button onClick={() => deleteIngredient(index)} icon="pi pi-trash" severity="danger" />
                </div>
              </React.Fragment>
            )
          );
        })}

        {editIngredientIndex === null && (
          <>
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
              <div className="p-inputgroup">
                <InputText
                  style={{ width: "50%" }}
                  value={currentIngredient.text}
                  placeholder={`Zutat ${ingredients.length > 0 ? "(optional)" : ""}`}
                  onChange={(e) => handleIngredientChange('text', e.target.value)}
                  invalid={ingredients.length === 0}
                  variant={ingredients.length === 0 ? "filled" : undefined}

                />
                <InputText
                  style={{ width: "50px", margin: "0 5px" }}
                  value={currentIngredient.unit || ''}
                  placeholder="Einheit"
                  onChange={(e) => handleIngredientChange('unit', e.target.value ? e.target.value : null)}
                />
                <InputNumber
                  showButtons
                  placeholder="Menge"
                  value={currentIngredient.amount}
                  onChange={(e: InputNumberChangeEvent) => handleIngredientChange('amount', e.value !== null ? e.value : null)}
                  minFractionDigits={2}
                  locale="de-DE"
                  style={{
                    float: "left",
                    width: "70px",
                    borderColor: (currentIngredient.text !== undefined && ingredients.length === 0) ? "red" : undefined,
                    background: (currentIngredient.text !== undefined && ingredients.length === 0) ? "rgba(255,0,0,0.05)" : undefined
                  }}
                  suffix={" " + currentIngredient.unit ?? undefined}
                />
              </div>
            </div>
            <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
              {currentIngredient.text !== "" ? (
                <Button onClick={addIngredient} label="apply" severity="success" icon="pi pi-check" />
              )
                :
                <div>
                  {!description && ingredients.length === 0 && <span className="pi pi-exclamation-circle" style={{ color: '#D13438', fontSize: '1.5rem' }} />}
                </div>
              }
            </div>
          </>
        )}















        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Benötigte Zeit</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <InputNumber
            showButtons
            min={15} step={15}
            locale="de-DE"
            value={duration}
            onChange={handleDurationChange}
            suffix=" min"
            style={{
              width: "100%",
              borderColor: duration > 0 ? "green" : "red",
              background: duration > 0 ? "green" : "red",
            }}
            invalid={duration === 0}
          />
        </div>


        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Aktuelles Rating</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <Rating value={rating} readOnly cancel={false} disabled />
        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Schwierigkeit</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <Dropdown
            value={difficulty}
            options={[
              { label: 'leicht', value: 1 },
              { label: 'mittel', value: 2 },
              { label: 'schwer', value: 3 }
            ]}
            onChange={onDifficultyChange}
            optionLabel="label"
            highlightOnSelect={true}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Personenanzahl</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <InputNumber
            showButtons
            min={1} max={99}
            locale="de-DE"
            value={persons}
            onChange={handlePersonsChange}
            suffix={persons === 1 ? " Person" : " Personen"}
            style={{ width: "100%" }}
            invalid={persons === 0}
          />
        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Bild</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <Dropdown
            value={image}
            options={[
              { label: 'noImage.webp', value: 'noImage.webp' },
              { label: 'ApfelZimtPorridge.webp', value: 'ApfelZimtPorridge.webp' },
              { label: 'BurgerMitHausgemachtenPommes.webp', value: 'BurgerMitHausgemachtenPommes.webp' },
              { label: 'CaesarSalad.webp', value: 'CaesarSalad.webp' },
              { label: 'EnteAlaOrange.webp', value: 'EnteAlaOrange.webp' },
              { label: 'EnteAlaOrange.webp', value: 'EnteAlaOrange.webp' },
              { label: 'GriechischerSalat.webp', value: 'GriechischerSalat.webp' },
              { label: 'HaehnchenbrustMitKraeuterkruste.webp', value: 'HaehnchenbrustMitKraeuterkruste.webp' },
              { label: 'Kuerbissuppe.webp', value: 'Kuerbissuppe.webp' },
              { label: 'PastaCarbonara.webp', value: 'PastaCarbonara.webp' },
              { label: 'QuicheLorraine.webp', value: 'QuicheLorraine.webp' },
              { label: 'Ratatouille.webp', value: 'Ratatouille.webp' },
              { label: 'SpaghettiBolognese.webp', value: 'SpaghettiBolognese.webp' },
            ]}
            onChange={onImageChange}
            optionLabel="label"
            highlightOnSelect={true}
            style={{ width: "100%" }}
            valueTemplate={selectedRezeptOptionTemplate}
            itemTemplate={selectedRezeptOptionTemplateX}
          />


        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Vegetarisch?</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <Checkbox onChange={() => setIsVegi(!isVegi)} checked={isVegi} />
            </span>
            <InputText value={isVegi ? "ja" : "nein"} style={{ width: "100%", color: "#323130", pointerEvents: "none" }} variant="filled" />
          </div>
        </div>
        <div style={{ gridColumnStart: 1, gridColumnEnd: 4, background: "#323130", height: 1 }} />
        <div>
          {firebaseId &&
            <div className="p-inputgroup" style={{ width: "100%" }}>
              <ConfirmButton action={() => deleteRezept(firebaseId)} style={{ float: "left" }} text="Rezept löschen" />
            </div>
          }
        </div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }} >
          <Button onClick={() => navigate("/read")} style={{ float: "right" }} label="Abbrechen" severity="secondary" />
        </div>
        <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
          <Button onClick={saveData} disabled={!saveable} style={{ width: "100%" }} label={saveable ? "SAVE DATA" : "MISSING DATA"} severity={saveable ? "success" : "danger"} outlined={!saveable} />
        </div>

      </div>
      {/* NEW ENDE */}


























      <h1>OLD</h1>
      <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr max-content", gap: "10px 20px", alignItems: "center", width: "100%" }}>
        <div>Gericht</div>
        <div>
          <InputText style={{ width: "100%" }} value={title} onChange={(e) => setTitle(e.target.value)} invalid={!title} variant={!title ? "filled" : undefined} />
        </div>
        <div>
          {!title && <span className="pi pi-exclamation-circle" style={{ color: '#D13438', fontSize: '1.5rem' }} />}
        </div>

        <div>Beschreibung</div>
        <div>
          <InputTextarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%" }} invalid={!description} variant={!description ? "filled" : undefined} />
        </div>
        <div>
          {!description && <span className="pi pi-exclamation-circle" style={{ color: '#D13438', fontSize: '1.5rem' }} />}
        </div>

        <div>Arbeitsschritte</div>
        {manual.map((m, i) => (
          editStepIndex === i ? (
            <React.Fragment key={i}>
              <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                <InputText style={{ width: "100%" }} value={currentStep} onChange={(e) => setCurrentStep(e.target.value)} ref={inputRef} invalid={!currentStep} variant={!currentStep ? "filled" : undefined} />
              </div>
              <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
                <Button onClick={addOrUpdateStep} label="update" severity="success" icon="pi pi-check" disabled={!currentStep} style={{ marginRight: 5 }} />
                <Button onClick={cancelEdit} icon="pi pi-times" severity="secondary" />
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment key={i}>
              <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                <InputText style={{ width: "100%", color: "#323130" }} value={`Step ${i + 1}: ${m}`} disabled variant="filled" />
              </div>
              <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
                <Button onClick={() => editStep(i)} label="edit" severity="warning" icon="pi pi-pen-to-square" style={{ marginRight: 5 }} />
                <Button onClick={() => deleteStep(i)} icon="pi pi-trash" severity="danger" />
              </div>
            </React.Fragment>
          )
        ))}
        {editStepIndex === null && (
          <>
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
              <InputText
                style={{ width: "100%" }}
                invalid={manual.length === 0} variant={manual.length === 0 ? "filled" : undefined}
                value={currentStep}
                placeholder={manual.length === 0 ? undefined : `Step ${manual.length + 1} (optional)`}
                onChange={(e) => setCurrentStep(e.target.value)}
              />
            </div>

            <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>

              {currentStep !== "" ?
                <Button onClick={addOrUpdateStep} label="apply" severity="success" icon="pi pi-check" />
                :

                <div>
                  {!description && manual.length === 0 && <span className="pi pi-exclamation-circle" style={{ color: '#D13438', fontSize: '1.5rem' }} />}
                </div>
              }
            </div>
          </>
        )}








        <div>Zutaten</div>
        {ingredients.map((ingredient, index) => {
          const amount = ingredient.amount ?? "";
          const unit = ingredient.unit ?? "";
          const text = ingredient.text;
          const label = (amount ? amount + " " : "") + (unit ? unit + " " : "") + text;
          return (
            editIngredientIndex === index ? (
              <React.Fragment key={index}>
                <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }} >
                  <div className="p-inputgroup">
                    <InputText
                      style={{ width: "50%" }}
                      invalid={!currentStep || currentStep === ""}
                      variant={!currentStep ? "filled" : undefined}
                      value={currentIngredient.text}
                      placeholder={manual.length === 0 ? undefined : `Step ${manual.length + 1} (optional)`}
                      onChange={(e) => handleIngredientChange('text', e.target.value)}
                      autoFocus={true}
                    />
                    <InputText
                      style={{ width: "50px", margin: "0 5px" }}
                      value={currentIngredient.unit || ''}
                      placeholder="Einheit"
                      onChange={(e) => handleIngredientChange('unit', e.target.value)}
                      min={0}
                    />
                    <InputNumber
                      showButtons
                      value={currentIngredient.amount}
                      onChange={(e: InputNumberChangeEvent) => handleIngredientChange('amount', e.value !== null ? e.value : null)}
                      placeholder="Menge"
                      style={{ width: "100px" }}
                      step={0.25}
                      minFractionDigits={2}
                      locale="de-DE"
                      suffix={" " + currentIngredient.unit ?? undefined}
                    />
                  </div>
                </div>
                <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }} >
                  <Button onClick={addOrUpdateIngredient} label="update" severity="success" icon="pi pi-check" disabled={currentIngredient.text === null} style={{ marginRight: 5 }} />
                  <Button onClick={cancelEditIngredient} severity="secondary" icon="pi pi-times" />
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment key={index}>
                <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                  <InputText
                    style={{ width: "100%", color: "#323130" }}
                    value={label}
                    disabled
                  />
                </div>
                <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }} >
                  <Button onClick={() => editIngredient(index)} label="edit" severity="warning" icon="pi pi-pen-to-square" style={{ marginRight: 5 }} />
                  <Button onClick={() => deleteIngredient(index)} icon="pi pi-trash" severity="danger" />
                </div>
              </React.Fragment>
            )
          );
        })}

        {editIngredientIndex === null && (
          <>
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
              <div className="p-inputgroup">
                <InputText
                  style={{ width: "50%" }}
                  value={currentIngredient.text}
                  placeholder={`Zutat ${ingredients.length > 0 ? "(optional)" : ""}`}
                  onChange={(e) => handleIngredientChange('text', e.target.value)}
                  invalid={ingredients.length === 0}
                  variant={ingredients.length === 0 ? "filled" : undefined}

                />
                <InputText
                  style={{ width: "50px", margin: "0 5px" }}
                  value={currentIngredient.unit || ''}
                  placeholder="Einheit"
                  onChange={(e) => handleIngredientChange('unit', e.target.value ? e.target.value : null)}
                />
                <InputNumber
                  showButtons
                  placeholder="Menge"
                  value={currentIngredient.amount}
                  onChange={(e: InputNumberChangeEvent) => handleIngredientChange('amount', e.value !== null ? e.value : null)}
                  minFractionDigits={2}
                  locale="de-DE"
                  style={{
                    float: "left",
                    width: "70px",
                    borderColor: (currentIngredient.text !== undefined && ingredients.length === 0) ? "red" : undefined,
                    background: (currentIngredient.text !== undefined && ingredients.length === 0) ? "rgba(255,0,0,0.05)" : undefined
                  }}
                  suffix={" " + currentIngredient.unit ?? undefined}
                />
              </div>
            </div>
            <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
              {currentIngredient.text !== "" ? (
                <Button onClick={addIngredient} label="apply" severity="success" icon="pi pi-check" />
              )
                :
                <div>
                  {!description && ingredients.length === 0 && <span className="pi pi-exclamation-circle" style={{ color: '#D13438', fontSize: '1.5rem' }} />}
                </div>
              }
            </div>
          </>
        )}















        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Benötigte Zeit</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <InputNumber
            showButtons
            min={15} step={15}
            locale="de-DE"
            value={duration}
            onChange={handleDurationChange}
            suffix=" min"
            style={{
              width: "100%",
              borderColor: duration > 0 ? "green" : "red",
              background: duration > 0 ? "green" : "red",
            }}
            invalid={duration === 0}
          />
        </div>


        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Aktuelles Rating</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <Rating value={rating} readOnly cancel={false} disabled />
        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Schwierigkeit</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <Dropdown
            value={difficulty}
            options={[
              { label: 'leicht', value: 1 },
              { label: 'mittel', value: 2 },
              { label: 'schwer', value: 3 }
            ]}
            onChange={onDifficultyChange}
            optionLabel="label"
            highlightOnSelect={true}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Personenanzahl</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <InputNumber
            showButtons
            min={1} max={99}
            locale="de-DE"
            value={persons}
            onChange={handlePersonsChange}
            suffix={persons === 1 ? " Person" : " Personen"}
            style={{ width: "100%" }}
            invalid={persons === 0}
          />
        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Bild</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <Dropdown
            value={image}
            options={[
              { label: 'noImage.webp', value: 'noImage.webp' },
              { label: 'ApfelZimtPorridge.webp', value: 'ApfelZimtPorridge.webp' },
              { label: 'BurgerMitHausgemachtenPommes.webp', value: 'BurgerMitHausgemachtenPommes.webp' },
              { label: 'CaesarSalad.webp', value: 'CaesarSalad.webp' },
              { label: 'EnteAlaOrange.webp', value: 'EnteAlaOrange.webp' },
              { label: 'EnteAlaOrange.webp', value: 'EnteAlaOrange.webp' },
              { label: 'GriechischerSalat.webp', value: 'GriechischerSalat.webp' },
              { label: 'HaehnchenbrustMitKraeuterkruste.webp', value: 'HaehnchenbrustMitKraeuterkruste.webp' },
              { label: 'Kuerbissuppe.webp', value: 'Kuerbissuppe.webp' },
              { label: 'PastaCarbonara.webp', value: 'PastaCarbonara.webp' },
              { label: 'QuicheLorraine.webp', value: 'QuicheLorraine.webp' },
              { label: 'Ratatouille.webp', value: 'Ratatouille.webp' },
              { label: 'SpaghettiBolognese.webp', value: 'SpaghettiBolognese.webp' },
            ]}
            onChange={onImageChange}
            optionLabel="label"
            highlightOnSelect={true}
            style={{ width: "100%" }}
            valueTemplate={selectedRezeptOptionTemplate}
            itemTemplate={selectedRezeptOptionTemplateX}
          />


        </div>

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>Vegetarisch?</div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <Checkbox onChange={() => setIsVegi(!isVegi)} checked={isVegi} />
            </span>
            <InputText value={isVegi ? "ja" : "nein"} style={{ width: "100%", color: "#323130", pointerEvents: "none" }} variant="filled" />
          </div>
        </div>
        <div style={{ gridColumnStart: 1, gridColumnEnd: 4, background: "#323130", height: 1 }} />
        <div>
          {firebaseId &&
            <div className="p-inputgroup" style={{ width: "100%" }}>
              <ConfirmButton action={() => deleteRezept(firebaseId)} style={{ float: "left" }} text="Rezept löschen" />
            </div>
          }
        </div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }} >
          <Button onClick={() => navigate("/read")} style={{ float: "right" }} label="Abbrechen" severity="secondary" />
        </div>
        <div style={{ gridColumnStart: 3, gridColumnEnd: 4 }}>
          <Button onClick={saveData} disabled={!saveable} style={{ width: "100%" }} label={saveable ? "SAVE DATA" : "MISSING DATA"} severity={saveable ? "success" : "danger"} outlined={!saveable} />
        </div>

      </div>
    </div>
  );
}
export default Write;