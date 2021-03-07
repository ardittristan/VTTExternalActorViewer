Hooks.on("init", () => {
  if (game.system.id === "CoC7") {
    Hooks.on("actorViewerGenerate", () => {
      const compatMode = game.settings.get("externalactor", "compatMode");
      let actors = {};
      game.actors.forEach((actor) => {
        if (!compatMode) {
          if (game.user.isGM) {
            actor.setFlag("externalactor", "pulpRules", game.settings.get('CoC7', 'pulpRules'));
          }
        }

        actors[actor.id] = JSON.parse(JSON.stringify(actor.data));
      });

      ActorViewer.createActorsFile(actors);

      game.settings.set("externalactor", "systemSite", "https://ardittristan.github.io/VTTExternalActorSites/CoC7/");

      return false;
    });
  }
});
