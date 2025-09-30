
```shell
npm install --save @spiritex/spiritex-core
```

```js
const ServerFactory = require( '@spiritex/spiritex-core'  );
const ServerConfig = require( './Config.js' );
const Server = ServerFactory( ServerConfig );

await Server.InitializeServer();
await Server.StartupServer();

...

await Server.ShutdownServer();
```
