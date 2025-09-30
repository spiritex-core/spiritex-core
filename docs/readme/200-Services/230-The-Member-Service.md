
The `Member Service` is responsible for user management, authentication, and authorization.
It runs on top of an `Identity Provider` service (such as Clerk) which associates a user's email address with a password.

***Available Identity Providers***
- **Local** : Uses the local database to manage users and credentials.
- **Clerk** : Uses Clerk [https://clerk.com/] to manage users and authentication.
- **ClerkMock** : Uses a mock identity provider for testing purposes (always authenticates).

It is used to manage members and their access to the server.
It is also used by users to authenticate with the server.
This service can be disabled or overwritten by a custom implementation.

***Methods***

| Method | Description |
| :--- | :--- |
| **NewSession**( Strategy, Identifier, Secret ) | Authenticate with the network and retrieve a new network session and token. The new token is also returned in the Authorization header of the response |
| **NewNetworkToken**() | Generate a new network token for an existing session. The new token is also returned in the Authorization header of the response. |
| **GetMySession**() | Gets this session. |
| **ListMyApiKeys**() | Lists the ApiKeys owned by the current user. |
| **CreateMyApiKey**( Description, ExpirationMS ) | Creates an ApiKey for the current user. |
| **DestroyMyApiKey**( ApiKeyID ) | Destroys an ApiKey. |
| **GetMyApiKey**( ApiKeyID ) | Retrieves an ApiKey. |
| **LockMyApiKey**( ApiKeyID ) | Locks an ApiKey on the network. |
| **UnlockMyApiKey**( ApiKeyID ) | Unlocks an ApiKey on the network. |

Many more `Member` commands exist to manage sessions, api keys, etc.
