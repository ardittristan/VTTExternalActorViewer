/** @type {String} */
const scriptFolder = getRunningScript()().replace("actorviewer.js", "").replace(`${window.origin}/`, "");

Hooks.once("init", () => {
    game.settings.register("externalactor", "systemSite", {
        scope: "client",
        type: String,
        default: "https://ardittristan.github.io/VTTExternalActorSite/",
        config: false
    });
});

Hooks.once("setup", async () => {
    await manageFile({ action: "createDirectory", storage: "data", target: "/actorAPI" }, { bucket: undefined });

    const hookNotExecuted = Hooks.call("actorViewerGenerate");

    if (hookNotExecuted) {
        console.warn("ActorViewer | No settings found for this system.");

        let actors = {};
        game.actors.forEach(actor => {
            let items = [];

            if (game.user.isGM) {
                actor.setFlag("externalactor", "classLabels", actor.itemTypes.class.map(c => c.name).join(", "));
            }

            actor.items.forEach(item => {
                if (game.user.isGM) {
                    item.setFlag("externalactor", "labels", item.labels);
                }
                items.push(item.data);
            });

            actors[actor.id] = JSON.parse(JSON.stringify(actor.data));
            actors[actor.id].items = JSON.parse(JSON.stringify(items));
        });

        // create json file
        ActorViewer.createActorsFile(actors);
        // set application button url
        game.settings.set("externalactor", "systemSite", "https://ardittristan.github.io/VTTExternalActorSite/");
    }
});

Hooks.on("renderActorSheet", (sheet, html) => {
    jQuery('<a class="character-id"><i class="fas fa-link"></i>Get id</a>').insertAfter(html.find(".window-title"));

    html.find(".character-id").on("click", () => {
        new CopyPopupApplication(`${window.origin}/actorAPI/${game.world.name}-actors.json${sheet.actor.id}`, {
            id: "copyPopup",
            title: game.i18n.localize("actorViewer.actorUrl"),
            template: "modules/externalactor/templates/copyPopup.html",
            classes: ["copy-url-window"],
            resizable: false
        }).render(true);
    });
});

class CopyPopupApplication extends Application {
    constructor(url, options) {
        super(options);

        this.url = url;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {

        });
    }

    getData() {
        return {
            url: this.url
        };
    }

    /**
     * @param  {JQuery} html
     */
    activateListeners(html) {
        super.activateListeners(html);

        html.find(".close").on("click", () => {
            this.close();
        });
        html.find(".sendToApp").on("click", () => {
            Object.assign(document.createElement('a'), { target: '_blank', href: game.settings.get("externalactor", "systemSite") + '?' + this.url }).click();
        });
        html.find(".copyButton").on("click", () => {
            copyToClipboard(this.url);
        });
    }
}



/**
 * @param  {String} fileName
 * @param  {String} worldName
 * @param  {String} content
 */
async function createJsonFile(fileName, worldName, content) {
    const file = new File([content], `${worldName}-${fileName}.json`, { type: "application/json", lastModified: Date.now() });

    FilePicker.upload("data", "actorAPI", file, {})
}


async function manageFile(data, options) {
    return new Promise(resolve => {
        game.socket.emit("manageFiles", data, options, () => resolve());
    });
}

/**
 * @returns {String} script location
 */
function getRunningScript() {
    return () => {
        return new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0];
    };
}

function copyToClipboard(text) {
    const listener = function (ev) {
        ev.preventDefault();
        ev.clipboardData.setData('text/plain', text);
    };
    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
    ui.notifications.info(game.i18n.localize("actorViewer.copied"));
}
/**
 * @param  {Actor[]} actors
 */
function createActorsFile(actors) {
    createJsonFile("actors", game.world.name, JSON.stringify(actors));
}

globalThis.ActorViewer = {
    createActorsFile: createActorsFile,
    copyToClipboard: copyToClipboard
};
