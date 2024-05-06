import { getDatabase, push, ref, set, update, get, remove, query, orderByChild, equalTo, } from "firebase/database";
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import app from "../firebaseConfig";
import { Zutat, replaceUndefinedWithNull } from "./Helpers";
import Header from "./Header";
import { useAuth } from "./AuthContext";

function Write() {
  const navigate = useNavigate();
  const { firebaseId } = useParams();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [title, setTitle] = React.useState<string | undefined>(undefined);
  const [description, setDescription] = React.useState<string | undefined>(undefined);
  const [duration, setDuration] = React.useState<number | undefined>(15);
  const [rating, setRating] = React.useState<number | undefined>(0);
  const [difficulty, setDifficulty] = React.useState<number>(1);
  const [persons, setPersons] = React.useState<number>(4);
  const [image, setImage] = React.useState<string | undefined>(undefined);
  const [isVegi, setIsVegi] = React.useState<boolean>(false);
  const [manual, setManual] = React.useState<string[]>([]);
  const [currentStep, setCurrentStep] = React.useState<string>('');
  const [ingredients, setIngredients] = React.useState<Zutat[]>([]);
  const [currentIngredient, setCurrentIngredient] = React.useState<Zutat>({ text: '', amount: undefined, unit: undefined });
  const [editStepIndex, setEditStepIndex] = React.useState<number | null>(null);
  const [editIngredientIndex, setEditIngredientIndex] = React.useState<number | null>(null);
  const { isLoggedIn, isAdmin } = useAuth();
  const mayEdit = isLoggedIn && isAdmin;

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
        // alert("Data saved successfully");
        navigate("/");
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
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
      navigate("/");
    } catch (error) {
      console.error("Fehler beim Löschen des Rezepts und seiner Kommentare: ", error);
    }
  }

  const saveable = title && description && duration !== undefined && difficulty > 0 && persons > 0 && manual.length > 0 && ingredients.length > 0;

  if (!mayEdit)
    return (
      <>
        <Header />
        <h3 className="missing">Du musst als Admin eingelogged sein um neue Rezepte anzulegen</h3>
      </>
    );
  return (
    <div>
      <Header />
      <h2>Write.tsx {firebaseId ? "(Edit)" : "(Neu)"}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "10px 20px", alignItems: "center" }}>

        <div>Title</div>
        <div><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={title ? "success" : "error"} /></div>

        <div>Description</div>
        {/* <div><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={description ? "success" : "error"} /></div> */}
        <div><textarea value={description} onChange={(e) => setDescription(e.target.value)} className={description ? "success" : "error"} /></div>

        <div>Arbeitsschritte</div>
        {manual.map((m, i) => (
          editStepIndex === i ? (
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }} key={i}>
              <input type="text" value={currentStep} onChange={(e) => setCurrentStep(e.target.value)} ref={inputRef} />
              <button onClick={addOrUpdateStep} className="btn ml2">Update</button>
              <button onClick={cancelEdit} className="btn ml2">Cancel</button>
            </div>
          ) : (
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }} key={i}>
              <div style={{ background: "rgba(0,255,0,0.1)", border: "1px solid rgba(0,0,0,0.1)", width: "auto", float: "left", height: 38, padding: "0 10px", lineHeight: "40px", userSelect: "none" }}>step {i + 1}: {m}</div>
              <button onClick={() => editStep(i)} className="btn ml2">EDIT</button>
              <button onClick={() => deleteStep(i)} className="btn ml2">DELETE</button>
            </div>
          )
        ))}

        {editStepIndex === null && (
          <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
            <input
              type="text"
              value={currentStep}
              onChange={(e) => setCurrentStep(e.target.value)}
              placeholder={manual.length === 0 ? undefined : "optional"}
              className={manual.length === 0 ? "error" : currentStep ? "success" : undefined}
            />
            {currentStep !== "" ?
              <button onClick={addOrUpdateStep} className="btn apply">APPLY</button>
              :
              manual.length > 0 ?
                <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRight: "none", width: "auto", float: "left", height: 38, padding: "0 10px", lineHeight: "40px", userSelect: "none" }}>step {manual.length + 1}: </div>
                :
                <div />}
          </div>
        )}

        <div>Zutaten</div>
        {ingredients.map((ingredient, index) => (
          editIngredientIndex === index ? (
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }} key={index}>
              <input type="text" value={currentIngredient.text} onChange={(e) => handleIngredientChange('text', e.target.value)} autoFocus={true} />
              <input type="number" value={currentIngredient.amount || ''} onChange={(e) => handleIngredientChange('amount', e.target.value ? Number(e.target.value) : null)} />
              <input type="text" value={currentIngredient.unit || ''} onChange={(e) => handleIngredientChange('unit', e.target.value)} />
              <button onClick={addOrUpdateIngredient} className="btn ml2">Update</button>
              <button onClick={cancelEditIngredient} className="btn ml2">Cancel</button>
            </div>
          ) : (
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }} key={index}>
              {ingredient.amount &&
                <div style={{ background: "rgba(0,255,0,0.1)", border: "1px solid rgba(0,0,0,0.1)", width: "auto", float: "left", height: 38, padding: "0 10px", lineHeight: "40px", userSelect: "none", borderRight: "none", textAlign: "right" }}> {ingredient.amount}
                </div>
              }
              {ingredient.unit &&
                <div style={{ background: "rgba(0,255,0,0.1)", border: "1px solid rgba(0,0,0,0.1)", width: "auto", float: "left", height: 38, padding: 0, lineHeight: "40px", userSelect: "none", borderRight: "none", borderLeft: "none" }}>{ingredient.unit}
                </div>
              }
              <div style={{
                background: "rgba(0,255,0,0.1)",
                border: "1px solid rgba(0,0,0,0.1)",
                width: "auto",
                float: "left",
                height: 38,
                padding: "0 10px",
                lineHeight: "40px",
                userSelect: "none",
                borderLeft: (ingredient.unit && ingredient.amount) ? undefined : "1px solid rgba(0,0,0,0.1)"
              }}>{ingredient.text}
              </div>

              <button onClick={() => editIngredient(index)} className="btn ml2">EDIT</button>
              <button onClick={() => deleteIngredient(index)} className="btn ml2">DELETE</button>
            </div>
          )
        ))}

        {editIngredientIndex === null && (
          <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
            <input
              type="text"
              placeholder="Zutat"
              value={currentIngredient.text}
              onChange={(e) => handleIngredientChange('text', e.target.value)}
              style={{ marginRight: 2, }}
              className={(currentIngredient.text !== undefined && ingredients.length === 0) ? "error" : undefined}
            />
            <input
              type="number"
              placeholder="Menge"
              value={currentIngredient.amount || ''}
              onChange={(e) => handleIngredientChange('amount', e.target.value ? Number(e.target.value) : null)}
              style={{ marginRight: 2 }}
            />
            <input
              type="text"
              placeholder="Einheit"
              value={currentIngredient.unit || ''}
              onChange={(e) => handleIngredientChange('unit', e.target.value ? e.target.value : null)}
            />
            {currentIngredient.text !== "" && (
              <button onClick={addIngredient} className="btn apply">APPLY</button>
            )}
          </div>
        )}

        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>duration</div>
        <div><input type="number" value={duration} min={0} step={15} onChange={(e) => setDuration(Number(e.target.value))} className={duration ? "success" : "error"} /></div>
        <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>rating</div>
        <div><input type="number" value={rating} readOnly className={"success"} /></div>

        <div>Schwierigkeit</div>
        <div><select onChange={(e) => setDifficulty(Number(e.target.value))} className={difficulty >= 1 ? "success" : "error"} >
          <option value="1" selected={difficulty === 1}>leicht</option>
          <option value="2" selected={difficulty === 2}>mittel</option>
          <option value="3" selected={difficulty === 3}>schwer</option>
        </select></div>

        <div>Personenanzahl</div>
        <div><input type="number" value={persons} min={1} max={99} onChange={(e) => setPersons(Number(e.target.value))} className={persons ? "success" : "error"} /></div>

        <div>Bild</div>
        <div>
          <select onChange={(e) => setImage(e.target.value)} style={{ float: "left" }}>
            <option selected={image === "noImage.webp"} value="noImage.webp">Kein Bild</option>
            <option selected={image === "ApfelZimtPorridge.webp"} value="ApfelZimtPorridge.webp" >ApfelZimtPorridge.webp</option>
            <option selected={image === "BurgerMitHausgemachtenPommes.webp"} value="BurgerMitHausgemachtenPommes.webp" >BurgerMitHausgemachtenPommes.webp</option>
            <option selected={image === "CaesarSalad.webp"} value="CaesarSalad.webp" >CaesarSalad.webp</option>
            <option selected={image === ".webp"} value="EnteAlaOrange.webp" >EnteAlaOrange.webp</option>
            <option selected={image === "EnteAlaOrange.webp"} value="GemueseCurryKokosmilch.webp" >GemueseCurryKokosmilch.webp</option>
            <option selected={image === "GriechischerSalat.webp"} value="GriechischerSalat.webp" >GriechischerSalat.webp</option>
            <option selected={image === "HaehnchenbrustMitKraeuterkruste.webp"} value="HaehnchenbrustMitKraeuterkruste.webp" >HaehnchenbrustMitKraeuterkruste.webp</option>
            <option selected={image === "Kuerbissuppe.webp"} value="Kuerbissuppe.webp" >Kuerbissuppe.webp</option>
            <option selected={image === "PastaCarbonara.webp"} value="PastaCarbonara.webp" >PastaCarbonara.webp</option>
            <option selected={image === "QuicheLorraine.webp"} value="QuicheLorraine.webp" >QuicheLorraine.webp</option>
            <option selected={image === "Ratatouille.webp"} value="Ratatouille.webp" >Ratatouille.webp</option>
            <option selected={image === "SpaghettiBolognese.webp"} value="SpaghettiBolognese.webp" >SpaghettiBolognese.webp</option>
          </select>
        </div>

        <div>Vegetarisch?</div>
        <div><input type="checkbox" checked={isVegi} onChange={() => setIsVegi(!isVegi)} /></div>

      </div>

      <br />
      <div>
        <button onClick={saveData} disabled={!saveable} className="btn" style={{ float: "left" }}>
          {saveable ? "SAVE DATA" : "MISSING DATA"}
        </button>
        {firebaseId &&
          <div><button onClick={() => deleteRezept(firebaseId)} className='btn' style={{ float: "right" }}>DELETE REZEPT</button></div>
        }
      </div>
    </div>
  );
}
export default Write;