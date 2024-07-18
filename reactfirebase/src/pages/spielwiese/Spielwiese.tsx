import TimesIcon from '@mui/icons-material/CancelOutlined';
import { Box, Button } from '@mui/material';
import * as React from 'react';
import ConfirmButton from '../../components/ConfirmButton';
import { colors } from '../../components/Helpers';
import CheckPassword from './CheckPassword';
import CheckPasswordMM from './CheckPassword_MM';
import Rechner from './Rechner';

export type Comps = "Calc" | "CheckPassword" | "CheckPasswordMM" | "Confirmbutton" | undefined

interface SpielwieseProps {
}

const Spielwiese = (p: SpielwieseProps) => {
    const [comp, setcomp] = React.useState<Comps>(undefined);

    const onAction = React.useMemo(() => () => {
        console.log('...clicked');

    }, []);


    return (
        <div style={{ padding: 40 }}>

            <h1>Spielwiese</h1>
            <div style={{ display: "flex", gap: 5, marginBottom: 20, justifyContent: "flex-end" }}>
                <div style={{ marginRight: "auto", display: "flex", gap: 5 }}>
                    <Button onClick={() => setcomp("Calc")} variant={comp !== "Calc" ? "outlined" : "contained"} >Rechner</Button>
                    <Button onClick={() => setcomp("CheckPassword")} variant={comp !== "CheckPassword" ? "outlined" : "contained"} >Check Password</Button>
                    <Button onClick={() => setcomp("CheckPasswordMM")} variant={comp !== "CheckPasswordMM" ? "outlined" : "contained"} >Check Password MM</Button>
                    <Button onClick={() => setcomp("Confirmbutton")} variant={comp !== "Confirmbutton" ? "outlined" : "contained"} >Confirm Button</Button>
                </div>
                {comp !== undefined &&
                    <Button onClick={() => setcomp(undefined)} variant={"contained"} color='error' style={{}}><TimesIcon /></Button>
                }

            </div>
            {comp !== undefined &&
                <Box sx={{
                    borderRadius: 1,
                    border: "1px solid " + colors.greyMiddleLight,
                    p: 4
                }}
                >
                    {comp === "Calc" && <Rechner />}
                    {comp === "CheckPassword" && <CheckPassword />}
                    {comp === "CheckPasswordMM" && <CheckPasswordMM />}
                    {comp === "Confirmbutton" && <ConfirmButton action={onAction} text='Löschen' />}
                </Box>
            }
        </div>
    );
}
export default Spielwiese;