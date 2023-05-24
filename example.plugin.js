/**
 * @name ExamplePlugin
 * @author Author name
 * @description Example Plugin
 * @version 1.0.0
 * @invite InviteCode
 * @authorId 123456789123456789
 * @authorLink https://example.org/
 * @donate https://example.org/donate
 * @patreon https://example.org/patreon
 * @website https://example.org/
 * @source https://example.org/source
 */

module.exports = class ExamplePlugin {
    meta = {};

    constructor(meta) {
        this.meta = meta;
        console.log(`${this.meta.name} Meta:`, this.meta);
    }

    start() {
        console.log(`${this.meta.name} started`);
    }

    stop() {
        console.log(`${this.meta.name} stopped`);
    }

    load() {
        console.log(`${this.meta.name} loaded.`);
    }

    unload() {
        console.log(`${this.meta.name} unloaded.`);
    }
};
