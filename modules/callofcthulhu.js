Hooks.on("init", () => {
  if (game.system.id === "callofcthulhu") {
    Hooks.on("actorViewerGenerate", () => {
      const compatMode = game.settings.get("externalactor", "compatMode");
      let actors = {};
      game.actors.forEach((actor) => {
        if (!compatMode) {
          if (game.user.isGM) {
          }
        }

        actors[actor.id] = JSON.parse(JSON.stringify(actor.data));
      });

      ActorViewer.createActorsFile(actors);

      game.settings.set("externalactor", "systemSite", "https://ardittristan.github.io/VTTCoC7thExternalActorSite/");

      return false;
    });
  }
});
