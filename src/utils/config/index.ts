import {ARAConfig, ARAConfigPath} from "types";
import {configPath} from "../../constants";
import * as JSONC from "jsonc-parser";
import * as TOML from "toml";

/**
 * Generates an array of full paths based on the provided configuration path object.
 *
 * @param configPath - The configuration path object containing locations, names, and extensions.
 * @returns An array of strings representing full paths generated from the combinations of locations, names, and extensions.
 */
export function generateConfigPaths (configPath: ARAConfigPath): string[] {

    const result: string[] = [];

    configPath.locations.forEach((location) => {

        configPath.names.forEach((name) => {

            configPath.extensions.forEach((extension) => {

                const _location = location === "."
                    ? ""
                    : `${location}/`;
                const fullPath = `${_location}${name}.${extension}`;
                result.push(fullPath);

            });

        });

    });

    return result;

}


/**
 * Retrieves and parses the configuration from specified paths asynchronously.
 *
 * @returns A promise that resolves to an ARAConfig object based on the configuration files found in the generated paths.
 */
export async function getConfig (): Promise<ARAConfig> {

    const configPaths = generateConfigPaths(configPath);

    const configs: Array<ARAConfig | undefined> = await Promise.all(configPaths.map(async (path) => {

        const filepath = `${process.cwd()}/${path}`;
        const file = Bun.file(filepath);

        if (await file.exists() && path.endsWith(".json")) {

            return file.json();

        } else if (await file.exists() && path.endsWith(".jsonc")) {

            return JSONC.parse(await file.text());

        } else if (await file.exists() && path.endsWith(".toml")) {

            return TOML.parse(await file.text());

        }

        return undefined;

    }));

    const config = configs.find((c) => c !== undefined);

    return {
        "clean": config
            ? config.clean
            : [],
        "update": {
            "exclude": config?.update?.exclude
                ? config.update.exclude
                : [],
            "force": config?.update?.force
                ? config.update.force
                : false,
            "install": config?.update?.install
                ? config.update.install
                : false,
            "write": config?.update?.write
                ? config.update.write
                : false
        }
    };

}
