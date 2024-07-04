import { Button } from 'primereact/button';
import * as React from 'react';
import CheckPassword from './CheckPassword';
import Rechner from './Rechner';
import CheckPasswordMM from './CheckPassword_MM';
import ConfirmButton from '../../components/ConfirmButton';

export type Comps = "Calc" | "CheckPassword" | "CheckPasswordMM" | undefined

interface SpielwieseProps {
}

const Spielwiese = (p: SpielwieseProps) => {
    const [comp, setcomp] = React.useState<Comps>(undefined);

    const onAction = React.useMemo(() => () => {
        console.log('...clicked');

    }, []);


    return (
        <div style={{ padding: 40 }}>
            <ConfirmButton action={onAction} text='Löschen' />
            <h1>Spielwiese</h1>
            <div style={{ display: "flex", gap: 5, marginBottom: 40 }}>
                <Button icon='pi pi-times' onClick={() => setcomp(undefined)} severity='danger' />
                <Button label='Rechner' onClick={() => setcomp("Calc")} raised={comp === "Calc"} text={comp !== "Calc"} />
                <Button label='Check Password' onClick={() => setcomp("CheckPassword")} raised={comp === "CheckPassword"} text={comp !== "CheckPassword"} />
                <Button label='Check Password MM' onClick={() => setcomp("CheckPasswordMM")} raised={comp === "CheckPasswordMM"} text={comp !== "CheckPasswordMM"} />
            </div>
            {comp === "Calc" && <Rechner />}
            {comp === "CheckPassword" && <CheckPassword />}
            {comp === "CheckPasswordMM" && <CheckPasswordMM />}
        </div>
    );
}
export default Spielwiese;