import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

/**
 * Password Strength Indicator Component
 * Shows real-time password strength and requirements
 */

interface PasswordStrengthProps {
    password: string;
    showRequirements?: boolean;
}

const PASSWORD_REQUIREMENTS = [
    { id: 'length', label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { id: 'uppercase', label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { id: 'lowercase', label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { id: 'number', label: 'One number', test: (pwd: string) => /\d/.test(pwd) },
    { id: 'special', label: 'One special character (@$!%*?&)', test: (pwd: string) => /[@$!%*?&]/.test(pwd) },
];

export const PasswordStrengthIndicator = ({ password, showRequirements = true }: PasswordStrengthProps) => {
    const [strength, setStrength] = useState(0);
    const [requirements, setRequirements] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        let score = 0;
        const reqStatus: { [key: string]: boolean } = {};

        PASSWORD_REQUIREMENTS.forEach(req => {
            const passed = req.test(password);
            reqStatus[req.id] = passed;
            if (passed) score++;
        });

        setRequirements(reqStatus);
        setStrength(score);
    }, [password]);

    const getStrengthLabel = () => {
        if (strength === 0) return 'Very Weak';
        if (strength === 1) return 'Weak';
        if (strength === 2) return 'Fair';
        if (strength === 3) return 'Good';
        if (strength === 4) return 'Strong';
        return 'Very Strong';
    };

    const getStrengthColor = () => {
        if (strength <= 1) return 'bg-red-500';
        if (strength === 2) return 'bg-orange-500';
        if (strength === 3) return 'bg-yellow-500';
        if (strength === 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getTextColor = () => {
        if (strength <= 1) return 'text-red-600';
        if (strength === 2) return 'text-orange-600';
        if (strength === 3) return 'text-yellow-600';
        if (strength === 4) return 'text-blue-600';
        return 'text-green-600';
    };

    if (!password) return null;

    return (
        <div className="space-y-2">
            {/* Strength Bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Password Strength</span>
                    <span className={`font-semibold ${getTextColor()}`}>{getStrengthLabel()}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(strength / 5) * 100}%` }}
                    />
                </div>
            </div>

            {/* Requirements Checklist */}
            {showRequirements && (
                <div className="space-y-1">
                    {PASSWORD_REQUIREMENTS.map(req => (
                        <div key={req.id} className="flex items-center gap-2 text-xs">
                            {requirements[req.id] ? (
                                <Check className="h-3 w-3 text-green-600" />
                            ) : (
                                <X className="h-3 w-3 text-gray-400" />
                            )}
                            <span className={requirements[req.id] ? 'text-green-600' : 'text-gray-500'}>
                                {req.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * Compact version - just the strength bar
 */
export const PasswordStrengthBar = ({ password }: { password: string }) => {
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        let score = 0;
        PASSWORD_REQUIREMENTS.forEach(req => {
            if (req.test(password)) score++;
        });
        setStrength(score);
    }, [password]);

    const getStrengthColor = () => {
        if (strength <= 1) return 'bg-red-500';
        if (strength === 2) return 'bg-orange-500';
        if (strength === 3) return 'bg-yellow-500';
        if (strength === 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    if (!password) return null;

    return (
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                style={{ width: `${(strength / 5) * 100}%` }}
            />
        </div>
    );
};

/**
 * Validate password and return errors
 */
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    PASSWORD_REQUIREMENTS.forEach(req => {
        if (!req.test(password)) {
            errors.push(req.label);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
};

export default PasswordStrengthIndicator;
