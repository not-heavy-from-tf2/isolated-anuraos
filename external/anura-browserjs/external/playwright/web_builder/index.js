import { chromium } from "playwright";
window.chromium = chromium;

let browserWindow = opener;

class ScramjetTransport {
  async connect() {
    console.log("CONNNECTING");
    return [];
  }

  async send(message) {
    browserWindow.postMessage({
      type: "scramjet$playwrightcdp",
      message: JSON.stringify(message)
    }, "*");
  }

  onMessage(callback) {
    window.addEventListener('message', event => {
      if (!event.data.type) return;
      if (event.data.type != "scramjet$playwrightcdp") return;
      callback(JSON.parse(event.data.message))
    });
  }

  onClose(callback) {
    // this._ws!.addEventListener('close', () => callback());
  }

  async close() {
    console.error("CLOSING WS!");
    // this._ws!.close();
  }
}

window.ScramjetTransport = ScramjetTransport;

chromium.connect().then((browser)=>{
  console.log(browser);
})
