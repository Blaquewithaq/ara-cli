import {ARAConfigPath} from "types";

const root = process.cwd();
const workspace = `${root}/.anomie`;
const bin = `${workspace}/bin`;
const temp = `${workspace}/.temp`;

export const paths = {
    root,
    workspace,
    bin,
    temp
};

export const configPath: ARAConfigPath = {
    "locations": [
        ".",
        ".ara"
    ],
    "names": ["ara.config"],
    "extensions": [
        "json",
        "jsonc",
        "toml"
    ]
};
