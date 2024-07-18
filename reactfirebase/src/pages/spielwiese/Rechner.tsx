import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { InputNumberChangeEvent } from 'primereact/inputnumber';
import * as React from 'react';
import Figure from './Figure';

export type Operators = "add" | "minus" | "times" | "divide";


interface RechnerProps {
}

const Rechner = (p: RechnerProps) => {
    const [number1, setNumber1] = React.useState<number>(0);
    const [number2, setNumber2] = React.useState<number>(0);
    const [operator, setOperator] = React.useState<Operators>("add");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOperator((event.target as HTMLInputElement).value as Operators);
    };

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

            <FormControl component="fieldset">
                <RadioGroup aria-label="operator" name="operator" value={operator} onChange={handleChange} row>
                    <FormControlLabel value="add" control={<Radio />} label="Add" />
                    <FormControlLabel value="minus" control={<Radio />} label="Subtract" />
                    <FormControlLabel value="times" control={<Radio />} label="Multiply" />
                    <FormControlLabel value="divide" control={<Radio />} label="Divide" />
                </RadioGroup>
            </FormControl>
            <hr />
            <b>ERGEBNiS: {calc(operator)}</b>
        </div>
    );
}
export default Rechner;