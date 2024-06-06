import { Button } from 'primereact/button';
import * as React from 'react';
import Rechner from './Rechner';
import CheckPassword from './CheckPassword';

export type Comps = "Calc" | "CheckPassword" | undefined



interface SpielwieseProps {
}

const Spielwiese = (p: SpielwieseProps) => {
    const [comp, setcomp] = React.useState<Comps>(undefined);


    return (
        <div>
            <h1>Spielwiese</h1>
            <div style={{ display: "flex", gap: 5, marginBottom: 40 }}>
                <Button icon='pi pi-times' onClick={() => setcomp(undefined)} severity='danger' />
                <Button label='Rechner' onClick={() => setcomp("Calc")} raised={comp === "Calc"} />
                <Button label='Check Password' onClick={() => setcomp("CheckPassword")} raised={comp === "CheckPassword"} />
            </div>
            {comp === "Calc" && <Rechner />}
            {comp === "CheckPassword" && <CheckPassword />}
        </div>
    );
}
export default Spielwiese;