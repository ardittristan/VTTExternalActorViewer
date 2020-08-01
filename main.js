/** @type {String} */
const scriptFolder = getRunningScript()().replace("main.js", "").replace(`${window.origin}/`, "");

Hooks.once("setup", async () => {
    await manageFile({ action: "createDirectory", storage: "data", target: "/actorAPI" }, { bucket: undefined });

    let actors = {};
    game.actors.forEach(actor => {
        let items = [];
        actor.setFlag("externalactor", "disableExperience", game.settings.get("dnd5e", "disableExperienceTracking"));
        actor.setFlag("externalactor", "currencyWeight", game.settings.get("dnd5e", "currencyWeight"));
        actor.setFlag("externalactor", "classLabels", actor.itemTypes.class.map(c => c.name).join(", "));

        actor.items.forEach(item => {
            item.setFlag("externalactor", "labels", item.labels);
            items.push(item.data)
        });

        

        actors[actor.id] = JSON.parse(JSON.stringify(actor.data))
        actors[actor.id].items = JSON.parse(JSON.stringify(items))
    });

    console.log(actors)

    createJsonFile("actors", game.world.name, JSON.stringify(actors));

});

Hooks.on("renderActorSheet", (sheet, html) => {
    jQuery('<a class="character-id"><i class="fas fa-cog"></i>Get id</a>').insertAfter(html.find(".window-title"));

    html.find(".character-id").on("click", () => {
        new CopyPopupApplication(`${window.origin}/actorAPI/${game.world.name}-actors.json${sheet.actor.id}`, {
            id: "copyPopup",
            title: "Actor URL",
            template: scriptFolder + "templates/copyPopup.html",
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
            Object.assign(document.createElement('a'), { target: '_blank', href: 'https://viewer.ardittristan.xyz/?' + this.url }).click();       //TODO put url here
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

    const fd = new FormData();
    fd.set("source", "data");
    fd.set("target", "actorAPI");
    fd.set("upload", file);
    fd.set("bucket", null);

    fetch("/upload", { method: "POST", body: fd });
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
}
