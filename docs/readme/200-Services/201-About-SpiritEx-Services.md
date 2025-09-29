
**Service Schema**

Service structure is defined by json schema.
It describes data objects used by the service in addition to service commands.

**User Types**

There are three main user types in the network:
- Network: This is the highest level of access. It can access all services in the network.
- Service: Used by services, it allows services to call each other.
- User: Used by applications, it allows applications to call services on behalf of users.

All three of these user types require a user account such as those managed by the `Member Service`.
This allows services to track who is calling which endpoints.
Services can also further segeregate certian users by emplying the `metadata` field of the user account.
