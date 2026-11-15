/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ConnectionTransport, ProtocolRequest, ProtocolResponse } from './transport';
import { Progress } from './progress';

const browserWindow = opener as Window;

export class ScramjetTransport implements ConnectionTransport {
  private _progress?: Progress;

  onmessage?: (message: ProtocolResponse) => void;
  onclose?: (reason?: string) => void;

  static async connect(progress: (Progress|undefined), url: string, options = {}): Promise<ScramjetTransport> {
    return await ScramjetTransport._connect(progress, url, options);
  }

  static async _connect(progress: (Progress | undefined), url: string, options = {}): Promise<ScramjetTransport> {
    progress?.log(`<sj connecting> `);
    const transport = new ScramjetTransport(progress, url);
    try {
      return transport;
    } catch (error) {
      await transport.closeAndWait();
      throw error;
    }
  }

  constructor(progress: Progress|undefined, url: string,) {
    this._progress = progress;

    window.addEventListener('message', event => {
      if (!event.data.type)
        return;

      if (event.data.type !== 'scramjet$playwrightcdp')
        return;

      if (this.onmessage)
        this.onmessage.call(null, JSON.parse(event.data.message))
    });

  }

  send(message: ProtocolRequest) {
    browserWindow.postMessage({
      type: 'scramjet$playwrightcdp',
      message: JSON.stringify(message)
    }, '*');
  }

  close() {
    console.error('Transport Closed');

  }

  async closeAndWait() {
    this.close();
  }
}

// class ScramjetTransport {
//   async connect() {
//     console.log("CONNNECTING");
//     return [];
//   }

//   async send(message) {
//     browserWindow.postMessage({
//       type: "scramjet$playwrightcdp",
//       message: JSON.stringify(message)
//     }, "*");
//   }

//   onMessage(callback) {
//     window.addEventListener('message', event => {
//       if (!event.data.type) return;
//       if (event.data.type != "scramjet$playwrightcdp") return;
//       callback(JSON.parse(event.data.message))
//     });
//   }

//   onClose(callback) {
//     // this._ws!.addEventListener('close', () => callback());
//   }

//   async close() {
//     console.error("CLOSING WS!");
//     // this._ws!.close();
//   }
// }
