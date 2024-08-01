import TimesIcon from "@mui/icons-material/CancelOutlined";
import { Box, Button as ButtonMui } from "@mui/material";
import * as React from "react";
import ConfirmButton from "../../components/ConfirmButton";
import { colors } from "../../components/Helpers";
import CheckPasswordMM from "./CheckPassword_MM";
import Rechner from "./Rechner";
import Button from "../../components/Button/Button";
import EditIcon from "@mui/icons-material/Edit";


export type Comps = "Calc" | "CheckPasswordMM" | "Confirmbutton" | undefined;

interface SpielwieseProps { }

const Spielwiese = (p: SpielwieseProps) => {
  const [comp, setcomp] = React.useState<Comps>(undefined);

  const onAction = React.useMemo(
    () => () => {
      console.log("...clicked");
    },
    []
  );

  return (
    <div style={{ padding: 40 }}>
      <h1>Spielwiese</h1>
      <div
        style={{
          display: "flex",
          gap: 5,
          marginBottom: 20,
          justifyContent: "flex-end",
        }}
      >
        <div style={{ marginRight: "auto", display: "flex", gap: 5 }}>
          <ButtonMui
            onClick={() => setcomp("Calc")}
            variant={comp !== "Calc" ? "outlined" : "contained"}
          >
            Rechner
          </ButtonMui>
          <ButtonMui
            onClick={() => setcomp("CheckPasswordMM")}
            variant={comp !== "CheckPasswordMM" ? "outlined" : "contained"}
          >
            Check Password MM
          </ButtonMui>
          <ButtonMui
            onClick={() => setcomp("Confirmbutton")}
            variant={comp !== "Confirmbutton" ? "outlined" : "contained"}
          >
            Confirm Button
          </ButtonMui>
        </div>
        {comp !== undefined && (
          <ButtonMui
            onClick={() => setcomp(undefined)}
            variant={"contained"}
            color="error"
            style={{}}
          >
            <TimesIcon />
          </ButtonMui>
        )}
      </div>
      {comp !== undefined ?
        <Box
          sx={{
            borderRadius: 1,
            border: "1px solid " + colors.greyMiddleLight,
            p: 4,
          }}
        >
          {comp === "Calc" && <Rechner />}
          {comp === "CheckPasswordMM" && <CheckPasswordMM />}
          {comp === "Confirmbutton" && (
            <ConfirmButton action={onAction} text="Löschen" />
          )}
        </Box>
        :
        <Box
          sx={{
            borderRadius: 1,
            border: "1px solid " + colors.greyMiddleLight,
            p: 4,
          }}
        >
          <Button
            icon={<EditIcon />}
            text="test"
            width="50%"
            textAlign="left"
          />

          <Button
            icon={<EditIcon />}
            text="test"
            width="50%"
            textAlign="left"
            disabled
          />
        </Box>
      }
    </div>
  );
};
export default Spielwiese;
