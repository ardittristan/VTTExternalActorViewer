# Making an addon for a different system

This module is made with modularization in mind, so it is possible to add more systems if you want to build the web interface for it. If you decide to do it you can do so by directly creating a pull request or making your own extension to this module.

## The module side

When the module initializes during the setup phase, it sends out a hook that you can act upon.

Below is a commented example of an extension for [dnd5e](https://github.com/ardittristan/VTTExternalActorViewer/blob/master/modules/dnd5e.js).

```javascript
Hooks.on("init", () => {                                              // should listen to any hook before setup
  if (game.system.id === "dnd5e") {                                   // check if system is correct
    Hooks.on("actorViewerGenerate", () => {                           // listen to hook from this module
      let actors = {};                                                // initialize actors list
      game.actors.forEach(actor => {                                  // iterate through each actors
        let items = [];                                               // initialize item list for item processing

        if (game.user.isGM) {                                         // needed because permissions
          actor.setFlag("externalactor", "disableExperience",         // 𝘥𝘯𝘥5𝘦 - xp isn't saved in actor data so we include it via flags
            game.settings.get("dnd5e", "disableExperienceTracking"));

          actor.setFlag("externalactor", "currencyWeight",            // 𝘥𝘯𝘥5𝘦 - currency weight isn't saved in actor data
            game.settings.get("dnd5e", "currencyWeight"));

          actor.setFlag("externalactor", "classLabels",               // 𝘥𝘯𝘥5𝘦 - names for classes aren't saved in actor data
            actor.itemTypes.class.map(c => c.name).join(", "));
        }


        actor.items.forEach(item => {                                 // iterate through item list
          if (game.user.isGM) {                                       // needed because permissions
            item.setFlag("externalactor", "labels",                   // item names are not saved in item data
              item.labels);
          }

          items.push(item.data);                                      // add item to item array
        });


                                                                      // below uses json stringify/parse to have it not skip properties later on
                                                                      // very recommended to do for item list

        actors[actor.id] = JSON.parse(JSON.stringify(actor.data));    // add actor to actor object, identified by it's id
        actors[actor.id].items = JSON.parse(JSON.stringify(items));   // overwrite original item data of actor with new item data
      });

      // create json file
      ActorViewer.createActorsFile(actors);                           // runs function that makes the json file the site reads from with the actors object.
      // set application button url
      game.settings.set("externalactor", "systemSite",                // sets the url for the site that opens for the users when they click the button in foundry.
        "https://ardittristan.github.io/VTTExternalActorSite/");      // do not include the ? at the end of the url

      return false;                                                   // return false to let the hook know that it can stop
    });
  }
});
```

After you've made your module, you can add it's js file to the scripts array in module.json. Or release it as your own module with this module as library.

## The website side

On the website side it's a bit more difficult since it can differ vastly per system, but the basic idea is to insert the sheet into a html page and send the actor data you can get from the json to it. Handlebars is an easy method for this since the original already uses handlebars most likely.

For [dnd5e](https://github.com/ardittristan/VTTExternalActorSite/tree/master/src) the site does the initializing in [index.js](https://github.com/ardittristan/VTTExternalActorSite/blob/master/src/index.js) and handles the json data in [populatesheet.js](https://github.com/ardittristan/VTTExternalActorSite/blob/master/src/populatesheet.js). The rest is mostly transforming the foundry environment into a standalone version.

### Site template

A base starting point for a sheet website with comment documentation can be found [here](https://github.com/ardittristan/VTTExternalActorSiteTemplate)
