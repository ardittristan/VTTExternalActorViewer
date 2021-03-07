Hooks.on("init", () => {
  if (game.system.id === "pf2e") {
    Hooks.on("actorViewerGenerate", () => {
      const compatMode = game.settings.get("externalactor", "compatMode");
      let actors = {};
      game.actors.forEach((actor) => {
        if (!compatMode) {
          if (game.user.isGM) {
            actor.setFlag("externalactor", "hasStamina", game.settings.get("pf2e", "staminaVariant") > 0);
            actor.setFlag("externalactor", "ignoreCoinBulk", game.settings.get("pf2e", "ignoreCoinBulk"));
            actor.setFlag("externalactor", "ignoreContainerOverflow", game.settings.get("pf2e", "ignoreContainerOverflow"));
            actor.setFlag("externalactor", "proficiencyUntrainedModifier", game.settings.get("pf2e", "proficiencyUntrainedModifier"));
            actor.setFlag("externalactor", "proficiencyVariant", game.settings.get("pf2e", "proficiencyVariant"));
            actor.setFlag("externalactor", "proficiencyTrainedModifier", game.settings.get("pf2e", "proficiencyTrainedModifier"));
            actor.setFlag("externalactor", "proficiencyExpertModifier", game.settings.get("pf2e", "proficiencyExpertModifier"));
            actor.setFlag("externalactor", "proficiencyMasterModifier", game.settings.get("pf2e", "proficiencyMasterModifier"));
            actor.setFlag("externalactor", "proficiencyLegendaryModifier", game.settings.get("pf2e", "proficiencyLegendaryModifier"));
          }
        }

        actors[actor.id] = JSON.parse(JSON.stringify(actor.data));
      });

      ActorViewer.createActorsFile(actors);
      ActorViewer.createWorldsFile();

      game.settings.set("externalactor", "systemSite", "https://ardittristan.github.io/VTTExternalActorSites/pf2e/");

      return false;
    });
  }
});
