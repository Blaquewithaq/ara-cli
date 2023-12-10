import type {PackageJSON} from "types";
import {handleError} from "..";

/**
 * Asynchronously checks if a package is installed by inspecting the dependencies,
 * devDependencies, and peerDependencies in the project's package.json file.
 *
 * @param packageName - The name of the package to check for.
 * @returns A promise that resolves to a boolean indicating whether the package is installed or a string in case of an error.
 */
export async function isPackageInstalled (packageName: string): Promise<boolean | string> {

    try {

        const packageJson: PackageJSON = await Bun.file(`${process.cwd()}/package.json`).json();

        if (packageJson.dependencies?.[packageName]) return true;

        if (packageJson.devDependencies?.[packageName]) return true;

        if (packageJson.peerDependencies?.[packageName]) return true;

        return false;

    } catch (error: unknown) {

        return handleError(error);

    }

}

/**
 * Asynchronously lists the dependencies, devDependencies, and peerDependencies from the project's package.json file.
 *
 * @returns A promise that resolves to an object containing arrays of dependencies or a string in case of an error.
 */
export async function listPackages (): Promise<
  | {
      dependencies: Array<string>;
      devDependencies: Array<string>;
      peerDependencies: Array<string>;
  }
  | string
> {

    try {

        const packageJson: PackageJSON = await Bun.file(`${process.cwd()}/package.json`).json();
        const packages: {
            dependencies: Array<string>;
            devDependencies: Array<string>;
            peerDependencies: Array<string>;
        } = {
            "dependencies": [],
            "devDependencies": [],
            "peerDependencies": []
        };

        if (packageJson.dependencies) for (const packageName in packageJson.dependencies) packages.dependencies.push(packageName);

        if (packageJson.devDependencies) for (const packageName in packageJson.devDependencies) packages.devDependencies.push(packageName);

        if (packageJson.peerDependencies) for (const packageName in packageJson.peerDependencies) packages.peerDependencies.push(packageName);

        return packages;

    } catch (error: unknown) {

        return handleError(error);

    }

}

/**
 * Asynchronously lists packages matching the provided regular expressions from the project's package.json file.
 *
 * @param regex - An array of regular expressions to match package names.
 * @returns A promise that resolves to an object containing arrays of matching dependencies or a string in case of an error.
 */
export async function listPackagesByRegex (regex: Array<RegExp>): Promise<
  | {
      dependencies: Array<string>;
      devDependencies: Array<string>;
      peerDependencies: Array<string>;
      all: Array<string>;
  }
  | string
> {

    try {

        const packageJson: PackageJSON = await Bun.file(`${process.cwd()}/package.json`).json();
        const packages: {
            dependencies: Array<string>;
            devDependencies: Array<string>;
            peerDependencies: Array<string>;
            all: Array<string>;
        } = {
            "dependencies": [],
            "devDependencies": [],
            "peerDependencies": [],
            "all": []
        };

        for (const reg of regex) {

            if (packageJson.dependencies) for (const packageName in packageJson.dependencies) if (packageName.match(reg)) packages.dependencies.push(packageName);

            if (packageJson.devDependencies) for (const packageName in packageJson.devDependencies) if (packageName.match(reg)) packages.devDependencies.push(packageName);

            if (packageJson.peerDependencies) for (const packageName in packageJson.peerDependencies) if (packageName.match(reg)) packages.peerDependencies.push(packageName);

        }

        packages.all = [
            ...packages.dependencies,
            ...packages.devDependencies,
            ...packages.peerDependencies
        ];

        return packages;

    } catch (error: unknown) {

        return handleError(error);

    }

}

/**
 * Asynchronously retrieves and parses the package.json file of the project.
 *
 * @returns A promise that resolves to a PackageJSON object or a string in case of an error.
 */
export async function getPackageJSON (): Promise<PackageJSON | string> {

    try {

        const packageJson: PackageJSON = await Bun.file(`${process.cwd()}/package.json`).json();

        return packageJson;

    } catch (error: unknown) {

        return handleError(error);

    }

}

/**
 * Asynchronously retrieves information about a specific package from the project's package.json file.
 *
 * @param packageName - The name of the package to retrieve information for.
 * @returns A promise that resolves to an object containing the version or a string in case of an error.
 */
export async function getPackageInfo (packageName: string): Promise<
  | {
      version: string;
  }
  | string
> {

    try {

        const packageJson: PackageJSON = await Bun.file(`${process.cwd()}/package.json`).json();

        let version = null;

        if (packageJson.dependencies?.[packageName]) version = packageJson.dependencies[packageName];

        if (packageJson.devDependencies?.[packageName]) version = packageJson.devDependencies[packageName];

        if (packageJson.peerDependencies?.[packageName]) version = packageJson.peerDependencies[packageName];

        if (version !== null) return {"version": version.replace(
            "^",
            ""
        )};

        throw new Error(`${packageName} not found in package.json`);

    } catch (error: unknown) {

        return handleError(error);

    }

}
