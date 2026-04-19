const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export const validateEmail = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return "Email is required.";
    if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address.";
    return null;
};

export const validatePassword = (value: string): string | null => {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Za-z]/.test(value) || !/\d/.test(value))
        return "Use at least one letter and one number.";
    return null;
};

export const validateSignInPassword = (value: string): string | null => {
    if (!value) return "Password is required.";
    return null;
};

export const validateName = (value: string, label: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return `${label} is required.`;
    if (trimmed.length < 2) return `${label} is too short.`;
    return null;
};

export const validateVerificationCode = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return "Verification code is required.";
    if (!/^\d{6}$/.test(trimmed)) return "Enter the 6-digit code.";
    return null;
};
