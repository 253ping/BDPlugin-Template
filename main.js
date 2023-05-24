const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const flags = {
    INSTALL: false,
    RUN_DEV: false,
    HELP: false,
};

process.on("SIGTERM", () => {
    process.exit(1);
});

const config = require("./config.json");
const args = process.argv.slice(2);
args.forEach((val) => {
    switch (val) {
        case "-i":
        case "--install":
            flags.INSTALL = true;
            break;
        case "-d":
        case "--run-dev":
            flags.RUN_DEV = true;
            break;
        default:
            flags.HELP = true;
            break;
    }
});

if (flags.HELP || (flags.INSTALL && flags.RUN_DEV)) {
    printHelp();
} else if (flags.INSTALL) {
    installPlugin();
} else if (flags.RUN_DEV) {
    runDev();
} else {
    printHelp();
}

function printHelp() {
    console.log(
        "NekoLP's BetterDiscord Plugin Helper\n" +
            "    '--install' - Installs the plugin to the BetterDiscord plugins folder\n" +
            "    '--run-dev' - Listens to changes and then copys the plugin. \n" +
            "    '--help'    - Shows this page."
    );
    process.exit(0);
}

/**
 * Replaces the environment variable names with its values
 * @param {string} input
 * @returns
 */
function evalPath(input) {
    if (input == null) throw new Error("input can't be null.");
    if (typeof input !== "string")
        throw new Error("input must be of type string");
    const win32 = /%([^%]+)%/g;
    const unix = /\$\(([^)]+)\)/g;
    const env = process.platform === "win32" ? win32 : unix;

    return input.replace(env, (_, name) => {
        return process.env[name] || "";
    });
}

function yesNo(question, callback) {
    rl.question(question + " [y/N]: ", (answer) => {
        rl.pause();
        rl.close();
        callback(answer[0] === "y");
    });
}

function installPlugin() {
    const Plugin = config.plugin;
    const PluginFile = path.basename(Plugin);
    const BDPath = evalPath(config.bdpath);
    const BDPlugins = path.join(BDPath, "plugins");
    if (!fs.existsSync(Plugin)) {
        console.error(
            "Could not find plugin file '%s'. Make sure it is set correctly in the config.json",
            Plugin
        );
        process.exit(1);
    }
    if (!fs.existsSync(BDPath)) {
        console.error(
            "Could not find betterdiscord folder '%s'. Make sure it is set correctly in the config.json",
            BDPath
        );
        process.exit(1);
    }
    if (!fs.existsSync(BDPlugins)) {
        console.error(
            "Could not find betterdiscord plugins folder '%s'. Make sure it is set correctly in the config.json",
            BDPlugins
        );
        process.exit(1);
    }

    const install = () => {
        console.log("Installing...");
        fs.copyFileSync(Plugin, path.join(BDPlugins, PluginFile));
        console.log("Done...");
        process.exit(0);
    };

    if (fs.existsSync(path.join(BDPlugins, PluginFile))) {
        yesNo("Override " + Plugin + "?", (bool) => {
            if (bool) install();
        });
    } else {
        install();
    }
}

function runDev() {
    const Plugin = config.plugin;
    const PluginFile = path.basename(Plugin);
    const BDPath = evalPath(config.bdpath);
    const BDPlugins = path.join(BDPath, "plugins");
    if (!fs.existsSync(Plugin)) {
        console.error(
            "Could not find plugin file '%s'. Make sure it is set correctly in the config.json",
            Plugin
        );
        process.exit(1);
    }
    if (!fs.existsSync(BDPath)) {
        console.error(
            "Could not find betterdiscord folder '%s'. Make sure it is set correctly in the config.json",
            BDPath
        );
        process.exit(1);
    }
    if (!fs.existsSync(BDPlugins)) {
        console.error(
            "Could not find betterdiscord plugins folder '%s'. Make sure it is set correctly in the config.json",
            BDPlugins
        );
        process.exit(1);
    }

    var debounceId;

    function copyFile() {
        if (debounceId) clearTimeout(debounceId);
        debounceId = setTimeout(() => {
            console.log(`File ${PluginFile} has been modified. Reloading...`);
            fs.copyFileSync(Plugin, path.join(BDPlugins, PluginFile));
            console.log(`Done.`);
        }, 100);
    }

    const run = () => {
        console.log("Started devplugin. Press Ctrl+C to exit.");
        fs.copyFileSync(Plugin, path.join(BDPlugins, PluginFile));
        fs.watch(path.dirname(Plugin), (eventType, filename) => {
            if (eventType === "change" && filename === PluginFile) {
                copyFile();
            }
        });
    };

    if (fs.existsSync(path.join(BDPlugins, PluginFile))) {
        yesNo("Override " + Plugin + "?", (bool) => {
            if (bool) run();
        });
    } else {
        run();
    }
}
