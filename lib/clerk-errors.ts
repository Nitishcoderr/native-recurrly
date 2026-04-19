import { isClerkAPIResponseError } from "@clerk/clerk-expo";

const FRIENDLY_BY_CODE: Record<string, string> = {
    form_identifier_not_found:
        "We couldn't find an account with that email. Try creating one instead.",
    form_password_incorrect: "That password is incorrect. Please try again.",
    form_password_pwned:
        "This password has appeared in a data breach. Please choose another.",
    form_password_length_too_short:
        "Password must be at least 8 characters.",
    form_password_validation_failed:
        "Password doesn't meet the security requirements.",
    form_identifier_exists:
        "An account with this email already exists. Try signing in.",
    form_param_format_invalid: "One of the fields is in an invalid format.",
    form_param_nil: "Please fill in all required fields.",
    verification_failed:
        "We couldn't verify that code. Please request a new one.",
    verification_expired:
        "That code has expired. Please request a new one.",
    too_many_requests:
        "Too many attempts. Please wait a moment and try again.",
};

export const clerkErrorMessage = (
    error: unknown,
    fallback = "Something went wrong. Please try again.",
): string => {
    if (isClerkAPIResponseError(error)) {
        const first = error.errors?.[0];
        if (first?.code && FRIENDLY_BY_CODE[first.code]) {
            return FRIENDLY_BY_CODE[first.code];
        }
        return first?.longMessage || first?.message || fallback;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};
