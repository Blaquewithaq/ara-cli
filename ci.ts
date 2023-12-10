import {readableStreamToText} from "bun";
import {rm} from "fs/promises";

const packageFiles: Array<string> = [
    "ara.config.json",
    "ara.config.jsonc",
    "ara.config.toml",
    "LICENSE",
    "README.md"
];

// ---------------------------------------------------

async function clean (wipe: boolean = false) {

    const clean: Array<string> = ["pkg"];

    if (wipe) {

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

    await clean();
    await build();

    for await (const path of packageFiles) {

        const file = await Bun.file(path).exists();

        if (file) {

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

// ---------------------------------------------------

(async () => {

    if (process.argv.length > 2) {

        switch (process.argv[2]) {

            case "-c":
            case "clean":
                await clean(process.argv[3] === "--wipe");
                break;
            case "-b":
            case "build":
                await build();
                break;
            case "-p":
            case "pkg":
                await pkg();
                break;
            default:
                console.log("Invalid argument");
                break;

        }

    }

})();
