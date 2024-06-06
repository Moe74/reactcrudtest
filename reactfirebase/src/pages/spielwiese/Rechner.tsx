import { InputNumberChangeEvent } from 'primereact/inputnumber';
import * as React from 'react';
import Figure from './Figure';
import { RadioButton } from 'primereact/radiobutton';

export type Operators = "add" | "minus" | "times" | "divide";


interface RechnerProps {
}

const Rechner = (p: RechnerProps) => {
    const [number1, setNumber1] = React.useState<number>(0);
    const [number2, setNumber2] = React.useState<number>(0);
    const [operator, setOperator] = React.useState<Operators>("add");

    const handleNr1Change = (e: InputNumberChangeEvent) => {
        if (e.value !== null) {
            setNumber1(e.value);
        } else {
            setNumber1(0);
        }
    };
    const handleNr2Change = (e: InputNumberChangeEvent) => {
        if (e.value !== null) {
            setNumber2(e.value);
        } else {
            setNumber2(0);
        }
    };

    const calc = (operator: Operators) => {
        switch (operator) {
            case "add":
                return number1 + number2;
            case "minus":
                return number1 - number2;
            case "times":
                return number1 * number2;
            case "divide":
                return number1 / number2;
            default:
                return null;
        }
    };
    return (
        <div>
            <div style={{ width: "100%", height: 40, marginTop: 20 }}>
                <Figure
                    value={number1}
                    onChange={handleNr1Change}
                    label='Zahl 1'
                />
                <span> </span>
                <Figure
                    value={number2}
                    onChange={handleNr2Change}
                    label='Zahl 2'
                />
            </div>

            <div style={{ width: "100%", height: 40, marginTop: 20 }}>
                <div style={{ float: "left", marginRight: 20 }}>
                    <RadioButton inputId="ingredient1" name="operator" value="add" onChange={(e) => setOperator(e.value)} checked={operator === 'add'} />
                    <label htmlFor="ingredient1" style={{ marginLeft: 10 }}>add</label>
                </div>
                <div style={{ float: "left", marginRight: 20 }}>
                    <RadioButton inputId="ingredient2" name="operator" value="minus" onChange={(e) => setOperator(e.value)} checked={operator === 'minus'} />
                    <label htmlFor="ingredient2" style={{ marginLeft: 10 }}>minus</label>
                </div>
                <div style={{ float: "left", marginRight: 20 }}>
                    <RadioButton inputId="ingredient3" name="operator" value="times" onChange={(e) => setOperator(e.value)} checked={operator === 'times'} />
                    <label htmlFor="ingredient3" style={{ marginLeft: 10 }}>times</label>
                </div>
                <div style={{ float: "left", marginRight: 20 }}>
                    <RadioButton inputId="ingredient4" name="operator" value="divide" onChange={(e) => setOperator(e.value)} checked={operator === 'divide'} />
                    <label htmlFor="ingredient4" style={{ marginLeft: 10 }}>divide</label>
                </div>
            </div>
            <hr />
            Number 1: {number1}<br />
            Number 2: {number2}<br />
            Operator: {operator}<br />
            <hr />
            <b>{calc(operator)}</b>
        </div>
    );
}
export default Rechner;