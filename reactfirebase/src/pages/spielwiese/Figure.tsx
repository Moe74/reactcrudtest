import { InputNumber, InputNumberChangeEvent } from 'primereact/inputnumber';

interface FigureProps {
    label: string;
    value: number;
    onChange: (e: InputNumberChangeEvent) => void;
}

const Figure = (p: FigureProps) => {
    return (
        <div style={{ float: "left", marginRight: 20 }}>
            <label htmlFor={p.label} style={{ marginRight: 10 }}>{p.label}</label>
            <InputNumber
                value={p.value}
                onChange={p.onChange}
                showButtons
                inputId={p.label}
            />
        </div>
    );
}
export default Figure;