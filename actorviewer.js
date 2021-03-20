import SilentFilePicker from "./customFilepickers/foundryFilePicker.js";

let filePath = window.location.href.replace("/game", "");

Hooks.once("init", () => {
  game.settings.register("externalactor", "systemSite", {
    scope: "client",
    type: String,
    default: "https://ardittristan.github.io/VTTExternalActorSite/",
    config: false,
  });
  game.settings.register("externalactor", "compatMode", {
    scope: "world",
    type: Boolean,
    default: false,
    config: true,
    name: "Enable performance mode.",
    hint:
      "If this module causes performance loss on startup. You can disable certain features with this option. Keep in mind that this'll mean that some data doesn't get exported.",
  });
});

Hooks.once("setup", async () => {
  await FilePicker.createDirectory("data", "actorAPI", {}).catch(() => {});

  const hookNotExecuted = Hooks.call("actorViewerGenerate");

  if (hookNotExecuted) {
    console.warn("ActorViewer | No settings found for this system.");

    let actors = {};
    game.actors.forEach((actor) => {
      const compatMode = game.settings.get("externalactor", "compatMode");
      let items = [];

      if (!compatMode) {
        if (game.user.isGM) {
          actor.setFlag("externalactor", "classLabels", actor.itemTypes.class.map((c) => c.name).join(", "));
        }

        actor.items.forEach((item) => {
          if (game.user.isGM) {
            item.setFlag("externalactor", "labels", item.labels);
          }
          items.push(item.data);
        });
      }

      actors[actor.id] = JSON.parse(JSON.stringify(actor.data));
      if (!compatMode) {
        actors[actor.id].items = JSON.parse(JSON.stringify(items));
      }
    });

    // create json files
    ActorViewer.createActorsFile(actors);
    ActorViewer.createWorldsFile();
    // set application button url
    game.settings.set("externalactor", "systemSite", "https://ardittristan.github.io/VTTExternalActorSite/");
  }
});

Hooks.on("renderActorSheet", (sheet, html) => {
  jQuery('<a class="character-id"><i class="fas fa-link"></i>Get id</a>').insertAfter(html.find(".window-title"));

  html.find(".character-id").on("click", () => {
    if (filePath.includes("https://")) {
      new CopyPopupApplication(filePath + sheet.actor.id).render(true);
    } else {
      new CopyPopupApplication(`${window.location.href.replace("/game", "")}/actorAPI/${game.world.data.name}-actors.json${sheet.actor.id}`).render(true);
    }
  });
});

class CopyPopupApplication extends Application {
  constructor(url, options = {}) {
    super(options);

    this.url = url;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "copyPopup",
      title: game.i18n.localize("actorViewer.actorUrl"),
      template: "modules/externalactor/templates/copyPopup.html",
      classes: ["copy-url-window"],
      resizable: false,
    });
  }

  getData() {
    return {
      url: this.url,
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
      Object.assign(document.createElement("a"), { target: "_blank", href: game.settings.get("externalactor", "systemSite") + "?" + this.url }).click();
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
async function createJsonFile(fileName, content) {
  const file = new File([content], fileName, { type: "application/json", lastModified: Date.now() });

  let response = await upload("data", "actorAPI", file, {});
  filePath = response.path;

  console.log('ActorViewer |', response);
}

function copyToClipboard(text) {
  const listener = function (ev) {
    ev.preventDefault();
    ev.clipboardData.setData("text/plain", text);
  };
  document.addEventListener("copy", listener);
  document.execCommand("copy");
  document.removeEventListener("copy", listener);
  ui.notifications.info(game.i18n.localize("actorViewer.copied"));
}
/**
 * @param  {Actor[]} actors
 */
function createActorsFile(actors) {
  createJsonFile(`${game.world.data.name}-actors.json`, JSON.stringify(actors));
}

/**
 * Create or update the worlds.json file
 */
function createWorldsFile() {
  let worlds = [];
  const world = {'name': game.world.data.name, 'title': game.world.data.title, 'system': game.world.data.system};
  console.debug('ActorViewer |', 'Checking for existing worlds.json');
  fetch(`${window.location.href.replace("/game", "")}/actorAPI/worlds.json`)
    .then((response) => response.json())
    .then((data) => {
      console.debug('ActorViewer |', 'Existing worlds.json data', data);
      worlds = data;
      if (!worlds.some(w => w.name === game.world.data.name)) {
        worlds.push(world);
        console.debug('ActorViewer |', 'Writing data to worlds.json', worlds);
        createJsonFile('worlds.json', JSON.stringify(worlds));
      }
    })
    .catch(() => {
      console.debug('ActorViewer |', 'Creating worlds.json');
      worlds.push(world);
      console.debug('ActorViewer |', 'Writing data to existing worlds.json', worlds);
      createJsonFile('worlds.json', JSON.stringify(worlds));
    });
}

/**
 * @type {FilePicker.upload}
 *
 * @returns {Promise}
 */
async function upload(source, path, file, options) {
  if (typeof ForgeVTT_FilePicker !== "undefined") {
    const SilentForgeFilePicker = (await import("./customFilepickers/forgeFilePicker.js")).default;
    return await SilentForgeFilePicker.upload(source, path, file, options);
  } else {
    return await SilentFilePicker.upload(source, path, file, options);
  }
}

globalThis.ActorViewer = {
  createActorsFile: createActorsFile,
  createWorldsFile: createWorldsFile,
  copyToClipboard: copyToClipboard,
};
