// src/components/VotingForm/helpers.js

/** @returns { score: number, label: string, ok: boolean } */
export const checkPasswordStrength = (password) => {
    const patterns = [/[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/];
    const strength = patterns.reduce((acc, p) => acc + (p.test(password) ? 1 : 0), 0);
    const label = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
    return `${label} (${strength}/4)`;
};
// src/components/VotingForm/helpers.js

/** @returns { score: number, label: string, ok: boolean } */
export function passwordStrength(password = '') {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^\w\s]/.test(password)) score++;

    const label =
        score <= 1 ? 'Very weak' :
            score === 2 ? 'Weak' :
                score === 3 ? 'Fair' :
                    score === 4 ? 'Strong' : 'Very strong';

    return { score, label, ok: score >= 3 };
}