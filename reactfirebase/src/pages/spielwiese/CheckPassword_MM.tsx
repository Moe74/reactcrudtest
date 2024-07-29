import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import React, { useState } from "react";
import { colors } from "../../components/Helpers";
import ProgressMM from "../../components/Progress_MM";

interface PasswordStrength {
  percentage: number;
  isStrong: boolean | undefined;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const getPasswordStrength = (password: string): PasswordStrength => {
  const criteria = {
    minLength: /.{8,}/, // Mindestens 8 Zeichen
    upperCase: /[A-Z]/, // Mindestens ein Großbuchstabe
    lowerCase: /[a-z]/, // Mindestens ein Kleinbuchstabe
    number: /\d/, // Mindestens eine Zahl
    specialChar: /[!@#$%^&*(),.?":{}|<>]/, // Mindestens ein Sonderzeichen
  };

  const hasMinLength = criteria.minLength.test(password);
  const hasUpperCase = criteria.upperCase.test(password);
  const hasLowerCase = criteria.lowerCase.test(password);
  const hasNumber = criteria.number.test(password);
  const hasSpecialChar = criteria.specialChar.test(password);

  const passedCriteriaCount = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  ].filter(Boolean).length;
  const percentage = (passedCriteriaCount / Object.keys(criteria).length) * 100;
  const isStrong = percentage < 20 ? undefined : percentage === 100;

  return {
    percentage,
    isStrong,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  };
};

interface PasswordCriteria {
  label: string;
  key: keyof PasswordStrength;
}

const CheckPasswordMM: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [strength, setStrength] = useState<PasswordStrength | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setStrength(getPasswordStrength(newPassword));
  };

  const passwordCriteria: PasswordCriteria[] = [
    { label: "Mindestens 8 Zeichen", key: "hasMinLength" },
    { label: "Mindestens ein Großbuchstabe", key: "hasUpperCase" },
    { label: "Mindestens ein Kleinbuchstabe", key: "hasLowerCase" },
    { label: "Mindestens eine Zahl", key: "hasNumber" },
    { label: "Mindestens ein Sonderzeichen", key: "hasSpecialChar" },
  ];

  const iconTemplate = (key: keyof PasswordStrength) => {
    return strength && strength[key] ? (
      <span className="check" style={{ color: "green" }} />
    ) : (
      <span className="times" style={{ color: "red" }} />
    );
  };

  const resultText =
    strength &&
    (strength.isStrong === true
      ? "Sehr gutes Passwort"
      : strength.isStrong === false
      ? "Das Passwort ist schwach"
      : undefined);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <TextField
          label={resultText ?? "Passwort eingeben zum Checken"}
          variant="outlined"
          id="password"
          value={password}
          onChange={handlePasswordChange}
          style={{ width: "100%" }}
          error={!strength?.isStrong}
          required
        />
      </div>

      {strength && (
        <div>
          <ProgressMM
            value={strength.percentage}
            height={30}
            width="100%"
            backgroundColor={colors.greyVeryLight}
            barColor={
              strength.percentage < 50
                ? colors.redLight
                : strength.percentage >= 50 && strength.percentage < 100
                ? colors.yellowLight
                : colors.greenLight
            }
            textColor={colors.white}
            showValue
            unit="%"
          />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kriterium</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {passwordCriteria.map((criteria) => (
                  <TableRow key={criteria.key}>
                    <TableCell>{criteria.label}</TableCell>
                    <TableCell>{iconTemplate(criteria.key)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
};

export default CheckPasswordMM;
