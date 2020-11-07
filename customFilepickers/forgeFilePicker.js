import SilentFilePicker from "./foundryFilePicker.js";

export default class SilentForgeFilePicker extends ForgeVTT_FilePicker {
  static async upload(source, target, file, options) {
    if (!ForgeVTT.usingTheForge && source !== "forgevtt") return SilentFilePicker.upload(source, target, file, options);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", `${target}/${file.name}`);

    const response = await ForgeAPI.call("assets/upload", formData);
    if (!response || response.error) {
      ui.notifications.error(response ? response.error : "An unknown error occured accessing The Forge API");
      return false;
    } else {
      return { path: response.url };
    }
  }
}
