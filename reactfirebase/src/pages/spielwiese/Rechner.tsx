import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import * as React from "react";

export type Operators = "add" | "minus" | "times" | "divide";

interface RechnerProps {}

const Rechner = (p: RechnerProps) => {
  const [number1, setNumber1] = React.useState<number>(0);
  const [number2, setNumber2] = React.useState<number>(0);
  const [operator, setOperator] = React.useState<Operators>("add");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOperator((event.target as HTMLInputElement).value as Operators);
  };

  const handleZahl1 = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setNumber1(value !== null ? parseFloat(value) : 0);
  };
  const handleZahl2 = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setNumber2(value !== null ? parseFloat(value) : 0);
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
      <div
        style={{
          width: 300,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: 10,
          marginTop: 20,
        }}
      >
        <TextField
          value={number1}
          variant="outlined"
          onChange={handleZahl1}
          required
          label="Zahl 1"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          value={number2}
          variant="outlined"
          onChange={handleZahl2}
          required
          label="Zahl 2"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
      <FormControl component="fieldset">
        <RadioGroup
          aria-label="operator"
          name="operator"
          value={operator}
          onChange={handleChange}
          row
        >
          <FormControlLabel value="add" control={<Radio />} label="Add" />
          <FormControlLabel
            value="minus"
            control={<Radio />}
            label="Subtract"
          />
          <FormControlLabel
            value="times"
            control={<Radio />}
            label="Multiply"
          />
          <FormControlLabel value="divide" control={<Radio />} label="Divide" />
        </RadioGroup>
      </FormControl>
      <p>
        <TextField
          value={calc(operator)}
          variant="filled"
          color="success"
          label="Ergebnis"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </p>
    </div>
  );
};
export default Rechner;
