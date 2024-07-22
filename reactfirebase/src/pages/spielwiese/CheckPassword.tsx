import { TextField } from "@mui/material";
import * as React from "react";
import { colors } from "../../components/Helpers";
import Progress from "../../components/Progress";

const getPasswordStrength = (
  password: string
): { percentage: number; isStrong: boolean } => {
  const criteria = [
    /.{8,}/, // Mindestens 8 Zeichen
    /[A-Z]/, // Mindestens ein Großbuchstabe
    /[a-z]/, // Mindestens ein Kleinbuchstabe
    /\d/, // Mindestens eine Zahl
    /[!@#$%^&*(),.?":{}|<>]/, // Mindestens ein Sonderzeichen
  ];

  const passedCriteria = criteria.reduce(
    (acc, regex) => acc + Number(regex.test(password)),
    0
  );
  const percentage = (passedCriteria / criteria.length) * 100;
  const isStrong = percentage >= 80;

  return { percentage, isStrong };
};

interface CheckPasswordProps { }

const CheckPassword = (p: CheckPasswordProps) => {
  const [password, setPassword] = React.useState<string>("");
  const strength = getPasswordStrength(password);

  return (
    <div>
      <TextField
        value={password}
        variant="outlined"
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
        InputLabelProps={{
          shrink: true,
        }}
        fullWidth
      />
      <div style={{ height: 40 }} />

      <div style={{ position: "relative", width: "100%" }}>
        <Progress
          value={strength.percentage} // Prozentsatz des Passwortes
          height={30}
          width="100%"
          backgroundColor={colors.blueVeryLight}
          barColor={colors.blueLight}
        />
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: strength.isStrong ? colors.greenLight : colors.redLight, // starkes passwor = gruen
            fontWeight: "bold",
          }}
        >
          {`${strength.percentage.toFixed(0)}%`}
        </span>
      </div>

      <span
        id="label_status"
        style={{
          marginTop: 40,
          height: 40,
          color: strength.isStrong ? colors.greenLight : colors.redLight, // starkes passwor = gruen
        }}
      >
        {strength.isStrong
          ? "Your password is strong"
          : "Your password is weak"}
      </span>
    </div>
  );
};

export default CheckPassword;
