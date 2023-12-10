import {exists, readdir, stat} from "node:fs/promises";
import * as tar from "tar";
import {handleError} from "..";

/**
 * Asynchronously checks if the specified path corresponds to a directory.
 *
 * @param path - The path to be checked.
 * @returns A promise that resolves to a boolean indicating whether the path is a directory or not.
 */
export async function isDirectory (path: string): Promise<boolean> {

    const stats = await stat(path);

    return stats.isDirectory();

}

/**
 * Asynchronously checks if the specified path corresponds to a file.
 *
 * @param path - The path to be checked.
 * @returns A promise that resolves to a boolean indicating whether the path is a file or not.
 */
export async function isFile (path: string): Promise<boolean> {

    const stats = await stat(path);

    return stats.isFile();

}

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

/**
 * Asynchronously retrieves a list of files in the specified directory and its subdirectories.
 *
 * @param directory - The directory path from which to retrieve the file list.
 * @param files - An optional array of file paths to append to. Used for recursive calls.
 * @returns A promise that resolves to an array of file paths in the specified directory and its subdirectories.
 */
export async function getFileList (directory: string, files: string[] = []): Promise<string[]> {

    const fileList = await readdir(directory);

    for await (const file of fileList) {

        const fullPath = `${directory}/${file}`;

        if (
            await isDirectory(fullPath) === true &&
            ![
                ".git",
                "node_modules"
            ].includes(file)
        ) {

            await getFileList(
                fullPath,
                files
            );

        } else {

            const path = fullPath.replace(
                /^\.\/|.*pkg\//,
                ""
            );

            files.push(path);

        }

    }

    return files;

}
