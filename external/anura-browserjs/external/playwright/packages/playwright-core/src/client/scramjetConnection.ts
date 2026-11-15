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

// import { ChannelOwner } from './channelOwner';
import { Connection } from './connection';

import type { HeadersArray } from './types';
import type * as channels from '@protocol/channels';

export async function connectOverScramjetPipe(parentConnection: Connection, params: channels.LocalUtilsConnectParams): Promise<Connection> {
  const localUtils = parentConnection.localUtils();
  // velzie:
  const transport: Transport = new (window as any).ScramjetTransport();
  const connectHeaders = await transport.connect(params);
  const connection = new Connection(parentConnection._platform, localUtils, parentConnection._instrumentation, connectHeaders);
  connection.markAsRemote();
  connection.on('close', () => transport.close());

  let closeError: string | undefined;
  const onTransportClosed = (reason?: string) => {
    connection.close(reason || closeError);
  };
  transport.onClose(reason => onTransportClosed(reason));
  connection.onmessage = message => transport.send(message).catch(() => onTransportClosed());
  transport.onMessage(message => {
    try {
      connection!.dispatch(message);
    } catch (e) {
      closeError = String(e);
      transport.close().catch(() => {});
    }
  });
  return connection;
}

interface Transport {
  connect(params: channels.LocalUtilsConnectParams): Promise<HeadersArray>;
  send(message: any): Promise<void>;
  onMessage(callback: (message: object) => void): void;
  onClose(callback: (reason?: string) => void): void;
  close(): Promise<void>;
}
