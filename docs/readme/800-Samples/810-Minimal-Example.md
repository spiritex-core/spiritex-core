```js

const ServerConfig = require( './Config.js' );
const ServerFactory = require( 'spiritex-core-0500'  );
const Server = ServerFactory( ServerConfig );

await Server.StartupServer();

...

await Server.ShutdownServer();

```
