/**
 * Handles errors and extracts the error message.
 *
 * @param error - The error to be handled, can be of type 'Error', 'string', or 'unknown'.
 * @returns A string containing the error message. If the error is not of expected types, "Unknown error" is returned.
 */
export function handleError (error: unknown): string {

    let _error: string;

    if (error instanceof Error) {

        // If 'error' is an instance of 'Error', extract the error message.
        _error = error.message;

    } else if (typeof error === "string") {

        // If 'error' is a string, use it as the error message.
        _error = error;

    } else {

        // If 'error' is of an unexpected type, set a default error message.
        _error = "Unknown error";

    }

    return _error;

}
