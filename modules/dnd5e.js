Hooks.on("init", () => {
  if (game.system.id === "dnd5e") {
    Hooks.on("actorViewerGenerate", () => {
      const compatMode = game.settings.get("externalactor", "compatMode");
      let actors = {};
      game.actors.forEach((actor) => {
        let items = [];

        if (!compatMode) {
          if (game.user.isGM) {
            actor.setFlag("externalactor", "disableExperience", game.settings.get("dnd5e", "disableExperienceTracking"));
            actor.setFlag("externalactor", "currencyWeight", game.settings.get("dnd5e", "currencyWeight"));
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

      // create json file
      ActorViewer.createActorsFile(actors);
      ActorViewer.createWorldsFile();
      // set application button url
      game.settings.set("externalactor", "systemSite", "https://ardittristan.github.io/VTTExternalActorSites/dnd5e/");

      return false;
    });
  }
});
