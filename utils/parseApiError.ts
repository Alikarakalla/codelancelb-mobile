// Mobile API errors are thrown as `new Error("API Error: <status> - <raw body>")`
// (see services/apiClient.ts handleResponse). This helper digs the Laravel-style
// validation payload back out so the UI can surface it inline next to each field
// instead of dumping the raw JSON in an Alert.
//
// Laravel 422 body shape:
//   { "message": "The email has already been taken.",
//     "errors":  { "email": ["The email has already been taken."], ... } }

export interface ParsedApiError {
    status: number | null;
    /** Top-level summary message safe to show in an alert/toast. */
    message: string;
    /** Per-field errors. Keys mirror the API field names (snake_case). */
    fieldErrors: Record<string, string>;
}

/**
 * Map API (snake_case) field names back to the local react-hook-form field names.
 * Override this map per-form when names differ (e.g. password_confirmation → confirmPassword).
 */
export type FieldNameMap = Record<string, string>;

function firstString(value: unknown): string | null {
    if (Array.isArray(value)) {
        for (const v of value) {
            if (typeof v === 'string' && v.trim()) return v;
        }
        return null;
    }
    if (typeof value === 'string' && value.trim()) return value;
    return null;
}

export function parseApiError(error: unknown): ParsedApiError {
    const rawMessage = error instanceof Error ? error.message : String(error || '');
    let status: number | null = null;
    let body: unknown = null;

    // Match "API Error: <status> - <body>" (body may be JSON or plain text).
    const match = rawMessage.match(/API Error:\s*(\d+)\s*-\s*([\s\S]+)$/i);
    if (match) {
        status = Number(match[1]);
        const bodyText = match[2].trim();
        try {
            body = JSON.parse(bodyText);
        } catch {
            body = bodyText;
        }
    } else {
        // Not from our handleResponse — pass through.
        return {
            status: null,
            message: rawMessage || 'Something went wrong. Please try again.',
            fieldErrors: {},
        };
    }

    let message: string = 'Something went wrong. Please try again.';
    if (body && typeof body === 'object') {
        const bodyMessage = firstString((body as any).message);
        if (bodyMessage) message = bodyMessage;
    } else if (typeof body === 'string' && body.trim()) {
        message = body;
    }

    const fieldErrors: Record<string, string> = {};
    const errorsObj =
        body && typeof body === 'object' ? (body as any).errors : null;
    if (errorsObj && typeof errorsObj === 'object') {
        for (const [key, value] of Object.entries(errorsObj)) {
            const text = firstString(value);
            if (text) fieldErrors[key] = text;
        }
        // If only one error, prefer it as the main message so the alert (if used) is human-readable.
        const firstFieldMessage = Object.values(fieldErrors)[0];
        if (firstFieldMessage) message = firstFieldMessage;
    }

    return { status, message, fieldErrors };
}

/**
 * Apply parsed field errors onto react-hook-form via the provided setError callback.
 * Returns true if at least one field error was applied.
 */
export function applyFieldErrors(
    parsed: ParsedApiError,
    setError: (name: string, error: { type?: string; message: string }) => void,
    nameMap: FieldNameMap = {}
): boolean {
    let applied = false;
    for (const [apiName, message] of Object.entries(parsed.fieldErrors)) {
        const formName = nameMap[apiName] ?? apiName;
        setError(formName, { type: 'server', message });
        applied = true;
    }
    return applied;
}
