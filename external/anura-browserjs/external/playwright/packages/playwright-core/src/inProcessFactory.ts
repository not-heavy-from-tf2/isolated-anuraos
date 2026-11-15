/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License");
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

import { DispatcherConnection, PlaywrightDispatcher, RootDispatcher, createPlaywright } from './server';
import { scramjetPlatform } from './server/utils/scramjetPlatform';
import { Connection } from './client/connection';

import type { Playwright as PlaywrightAPI } from './client/playwright';
import type { Language } from './utils';

export function createInProcessPlaywright(): PlaywrightAPI {
  const playwright = createPlaywright({ sdkLanguage: (process.env.PW_LANG_NAME as Language | undefined) || 'javascript' });
  // velzie: scramjet platform!!
  const clientConnection = new Connection(scramjetPlatform);
  clientConnection.useRawBuffers();
  const dispatcherConnection = new DispatcherConnection(true /* local */);

  // Dispatch synchronously at first.
  dispatcherConnection.onmessage = message => clientConnection.dispatch(message);
  clientConnection.onmessage = message => dispatcherConnection.dispatch(message);

  const rootScope = new RootDispatcher(dispatcherConnection);

  // Initialize Playwright channel.
  new PlaywrightDispatcher(rootScope, playwright);
  const playwrightAPI = clientConnection.getObjectWithKnownName('Playwright') as PlaywrightAPI;
  // playwrightAPI.chromium._serverLauncher = new BrowserServerLauncherImpl('chromium');
  // playwrightAPI.firefox._serverLauncher = new BrowserServerLauncherImpl('firefox');
  // playwrightAPI.webkit._serverLauncher = new BrowserServerLauncherImpl('webkit');
  // playwrightAPI._android._serverLauncher = new AndroidServerLauncherImpl();
  // playwrightAPI._bidiChromium._serverLauncher = new BrowserServerLauncherImpl('_bidiChromium');
  // playwrightAPI._bidiFirefox._serverLauncher = new BrowserServerLauncherImpl('_bidiFirefox');

  // Switch to async dispatch after we got Playwright object.
  // velzie: use queueMicrotask here instead of setImmediate. they should do the same thing
  dispatcherConnection.onmessage = message => queueMicrotask(() => clientConnection.dispatch(message));
  clientConnection.onmessage = message => queueMicrotask(() => dispatcherConnection.dispatch(message));

  clientConnection.toImpl = (x: any) => x ? dispatcherConnection._dispatcherByGuid.get(x._guid)!._object : dispatcherConnection._dispatcherByGuid.get('');
  (playwrightAPI as any)._toImpl = clientConnection.toImpl;
  return playwrightAPI;
}
