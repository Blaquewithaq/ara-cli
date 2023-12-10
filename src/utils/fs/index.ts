import {exists} from "node:fs/promises";
import * as tar from "tar";
import {handleError} from "..";

/**
 * Asynchronously checks if a directory exists at the specified path.
 *
 * @param path - The path to the directory.
 * @returns A promise that resolves to a boolean indicating whether the directory exists or not.
 */
export async function doesDirectoryExist (path: string): Promise<boolean> {

    return exists(path);

}

/**
 * Asynchronously checks if a file exists at the specified path.
 *
 * @param path - The path to the file.
 * @returns A promise that resolves to a boolean indicating whether the file exists or not.
 */
export async function doesFileExist (path: string): Promise<boolean> {

    return Bun.file(path).exists();

}

/**
 * Asynchronously extracts the contents of a tarball file to a specified directory.
 *
 * @param tarball - The path to the tarball file to be extracted.
 * @param directory - The directory where the contents of the tarball will be extracted.
 * @returns A promise that resolves to a string indicating success or an error message in case of an error.
 */
export async function extractTarball (tarball: string, directory: string): Promise<string> {

    try {

        await tar.extract({"file": tarball,
            "cwd": directory});

        return "success";

    } catch (error) {

        return handleError(error);

    }

}
