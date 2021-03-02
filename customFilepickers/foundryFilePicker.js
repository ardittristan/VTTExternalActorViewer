export default class SilentFilePicker extends FilePicker {
  /**
   * Dispatch a POST request to the server containing a directory path and a file to upload
   * @param {string} source   The data source to which the file should be uploaded
   * @param {string} path     The destination path
   * @param {File} file       The File object to upload
   * @param {Object} options  Additional file upload options passed as form data
   * @return {Promise<Object>}  The response object
   */
  static async upload(source, path, file, options) {
    // Create the form data to post
    const fd = new FormData();
    fd.set("source", source);
    fd.set("target", path);
    fd.set("upload", file);
    Object.entries(options).forEach((o) => fd.set(...o));
    console.log('ActorViewer |', this.uploadURL);
    // Dispatch the request
    const request = await fetch(this.uploadURL, { method: "POST", body: fd });
    if (request.status === 413) {
      return ui.notifications.error(game.i18n.localize("FILES.ErrorTooLarge"));
    } else if (request.status !== 200) {
      return ui.notifications.error(game.i18n.localize("FILES.ErrorSomethingWrong"));
    }

    // Retrieve the server response
    const response = await request.json();
    if (response.error) {
      ui.notifications.error(response.error);
      return false;
    } else if (response.message) {
      if (/^(modules|systems)/.test(response.path)) {
        ui.notifications.warn(game.i18n.localize("FILES.WarnUploadModules"));
      }
    }
    return response;
  }
}
