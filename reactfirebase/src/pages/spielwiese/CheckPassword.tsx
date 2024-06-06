import { InputText } from 'primereact/inputtext';
import * as React from 'react';
import Progress from '../../components/Progress';
import { colors } from '../../components/Helpers';

const getPasswordStrength = (password: string): { percentage: number, isStrong: boolean } => {
    const criteria = [
        /.{8,}/,             // Mindestens 8 Zeichen
        /[A-Z]/,             // Mindestens ein Großbuchstabe
        /[a-z]/,             // Mindestens ein Kleinbuchstabe
        /\d/,                // Mindestens eine Zahl
        /[!@#$%^&*(),.?":{}|<>]/ // Mindestens ein Sonderzeichen
    ];

    const passedCriteria = criteria.reduce((acc, regex) => acc + Number(regex.test(password)), 0);
    const percentage = (passedCriteria / criteria.length) * 100;
    const isStrong = percentage >= 80;

    return { percentage, isStrong };
};

interface CheckPasswordProps {
}

const CheckPassword = (p: CheckPasswordProps) => {
    const [password, setPassword] = React.useState<string>("");
    const strength = getPasswordStrength(password);
    return (
        <div>
            <InputText
                style={{ width: "100%" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <div style={{ height: 40 }} />

            <Progress
                value={70}
                height={30}
                width='100%'
                backgroundColor={colors.blueVeryLight}
                barColor={colors.blueLight}
            />


            {/* <span id="label_status" style={{ marginTop: 40, height: 40 }}>{strength.isStrong ? 'Your password is strong' : 'Your password is weak'}</span> */}

        </div >
    );
}
export default CheckPassword;