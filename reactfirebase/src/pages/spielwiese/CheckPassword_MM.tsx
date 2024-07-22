import "primeicons/primeicons.css"; // Icons
import { Column as ColumnPR } from "primereact/column";
import { DataTable as DataTablePR } from "primereact/datatable";
import { InputText as InputTextPR } from "primereact/inputtext";
import "primereact/resources/primereact.min.css"; // Core CSS
import "primereact/resources/themes/saga-blue/theme.css"; // Theme
import React, { useState } from "react";
import { colors } from "../../components/Helpers";
import ProgressMM from "../../components/Progress_MM";
import { Box, TextField } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";

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

  const iconTemplate = (rowData: PasswordCriteria) => {
    return strength && strength[rowData.key] ? (
      <span className="pi pi-check" style={{ color: "green" }} />
    ) : (
      <span className="pi pi-times" style={{ color: "red" }} />
    );
  };

  const resultText =
    strength &&
    (strength.isStrong === true
      ? "Sehr gutes Passwort"
      : strength.isStrong === false
      ? "Das Passwort ist schwach"
      : undefined);

  /*  const rows = rezepte.map((rezept) => ({
      id: rezept.rezeptId,
      image: rezept.image,
      title: rezept.title,
      description: rezept.description,
      duration: rezept.duration,
      vegi: rezept.isVegi,
      difficulty: rezept.difficulty,
      rating: rezept.rating,
    })); */

  const columns: GridColDef[] = [
    {
      field: "label",
      sortable: false,
      filterable: false,
      headerName: "Kriterium",
      width: 300,
    },
    {
      field: "image",
      sortable: false,
      filterable: false,
      headerName: "Status",
      width: 70,
      renderCell: (params) => (
        <img
          src={`${process.env.PUBLIC_URL}/images/rezepte/${params.value}`}
          alt={params.row.title}
          style={{ width: "40px", height: "40px", marginTop: 5 }}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="p-float-label" style={{ marginBottom: 10 }}>
        {/* <InputText
            id="password"
            value={password}
            onChange={handlePasswordChange}
            style={{ width: "100%" }}
            invalid={!strength?.isStrong}
          />
          <label htmlFor="password">
            {resultText ?? "Passwort eingeben zum Checken"}
          </label> */}
        <TextField
          label={resultText ?? "Passwort eingeben zum Checken"}
          variant="outlined"
          id="password"
          value={password}
          onChange={handlePasswordChange}
          /* color={title ? "success" : undefined} */
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
          <DataTablePR value={passwordCriteria} size="small" stripedRows>
            <ColumnPR field="label" header="Kriterium" />
            <ColumnPR body={iconTemplate} header="Status" />
          </DataTablePR>

          {/* <div style={{ padding: 40 }}>
              <Box sx={{ width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  autoHeight
                  sx={{ width: "100%" }}
                  disableRowSelectionOnClick
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10,
                      },
                    },
                  }}
                  pageSizeOptions={[10]}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                    },
                  }}
                />
              </Box>
            </div> */}
        </div>
      )}
    </div>
  );
};

export default CheckPasswordMM;
