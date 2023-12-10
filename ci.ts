import {readableStreamToText} from "bun";
import {rm, mkdir} from "node:fs/promises";
import {doesDirectoryExist, getFileList} from "./src/utils";
import os from "node:os";

const packageFiles: Array<string> = [
    "ara.config.json",
    "ara.config.jsonc",
    "ara.config.toml",
    "LICENSE",
    "README.md"
];

// ---------------------------------------------------

async function clean (type?: Array<"archive" | "pkg" | "wipe">) {

    const clean: Array<string> = [];

    if (type?.includes("archive") || type?.includes("wipe")) {

        // Find files with these patterns: ara-*.zip, ara-*.tar.gz
        const {stdout} = Bun.spawn([
            "find",
            ".",
            "-type",
            "f",
            "-name",
            "ara-*.zip",
            "-o",
            "-name",
            "ara-*.tar.gz"
        ]);

        if (stdout) {

            const output = await readableStreamToText(stdout);
            const files = output.split("\n");

            for (const file of files) {

                if (file) {

                    clean.push(file);

                }

            }

        }

    }

    if (type?.includes("pkg") || type?.includes("wipe")) {

        clean.push("pkg");

    }

    if (type?.includes("wipe")) {

        clean.push(
            "node_modules",
            "bun.lockb"
        );

    }

    for (const path of clean) {

        try {

            await rm(
                path,
                {
                    "force": true,
                    "recursive": true
                }
            );

        } catch (error) {

            console.error(error);

        }

    }

}

async function build () {

    await clean(["pkg"]);

    const {stdout, stderr} = Bun.spawn([
        "bun",
        "build",
        "./src/index.ts",
        "--compile",
        "--outfile",
        "pkg/ara"
    ]);

    if (stderr) {

        const error = await readableStreamToText(stderr);
        console.error(error);
        return;

    }

    if (stdout) {

        const output = await readableStreamToText(stdout);
        console.log(output);

    }

}

async function pkg () {

    if (!await doesDirectoryExist("pkg")) {

        mkdir("pkg");

    }

    for await (const path of packageFiles) {

        const file = await Bun.file(path).exists();

        if (file) {

            console.log(`Copying ${path} to pkg...`);

            const {stderr} = Bun.spawn([
                "cp",
                path,
                "pkg"
            ]);

            if (stderr) {

                const error = await readableStreamToText(stderr);
                console.error(error);
                return;

            }

        }

    }

}

async function archive () {

    await clean(["archive"]);

    const pkgDirectory = "pkg";

    if (!await doesDirectoryExist(pkgDirectory)) {

        console.error(`${pkgDirectory} isn't ready yet`);
        return;

    }

    const packageJSON = await Bun.file("package.json").json();
    const version = packageJSON.version;
    const platform = os.platform();
    const arch = os.arch();
    let extension = ".tar.gz";
    const fileList = await getFileList("pkg");

    let cmd = "";

    switch (platform) {

        case "linux":
        case "darwin":

            cmd = `tar -czvf ../ara-${version}-${platform}-${arch}${extension} ${fileList.join(" ")}`;

            break;
        case "win32":
            extension = ".zip";
            cmd = `7z a ara-${version}-${platform}-${arch}${extension} ${pkgDirectory}`;
            break;
        default:
            console.error("Unsupported platform");
            return;

    }

    const {stdout, stderr} = Bun.spawn(
        cmd.split(" "),
        {
            "cwd": "pkg"
        }
    );

    if (stderr) {

        const error = await readableStreamToText(stderr);
        console.error(error);

    }

    if (stdout) {

        const output = await readableStreamToText(stdout);
        console.log(output);

    }

}

// ---------------------------------------------------

(async () => {

    if (process.argv.length > 2) {

        switch (process.argv[2]) {

            case "-c":
            case "clean":
                switch (process.argv[3]) {

                    case "-a":
                    case "archive":
                        await clean(["archive"]);
                        break;
                    case "-p":
                    case "pkg":
                        await clean(["pkg"]);
                        break;
                    case "-w":
                    case "wipe":
                        await clean(["wipe"]);
                        break;
                    default:
                        await clean([
                            "archive",
                            "pkg"
                        ]);
                        break;

                }
                break;
            case "-b":
            case "build":
                await build();
                break;
            case "-p":
            case "pkg":
                await pkg();
                break;
            case "-a":
            case "archive":
                await archive();
                break;
            default:
                console.log("Invalid argument");
                break;

        }

    }

})();
