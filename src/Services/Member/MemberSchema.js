'use strict';


module.exports = function ( Server )
{
	return {


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//   ██████  ██████       ██ ███████  ██████ ████████ ███████ 
		//  ██    ██ ██   ██      ██ ██      ██         ██    ██      
		//  ██    ██ ██████       ██ █████   ██         ██    ███████ 
		//  ██    ██ ██   ██ ██   ██ ██      ██         ██         ██ 
		//   ██████  ██████   █████  ███████  ██████    ██    ███████ 
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		$Objects: {

			//---------------------------------------------------------------------
			MemberUser: {
				type: 'object',
				description: 'The user object.',
				properties: {
					user_id: { type: 'string', description: 'The user id.' },
					created_at: { type: 'string', format: 'date-time', description: 'The time the user was created.' },
					updated_at: { type: 'string', format: 'date-time', description: 'The time the user was updated.' },
					user_name: { type: 'string', description: 'The user name.' },
					user_email: { type: 'string', description: 'The user email.' },
					groups: { type: 'string', description: 'The groups the user is a member of.' },
					metadata: { type: 'object', description: 'The metadata for the user.' },
					locked_at: { type: 'string', format: 'date-time', description: 'The time the user was locked.' },
				},
				Table: {
					Indexes: [
						{ fields: [ 'user_id' ], unique: true }
					],
					Options: {
						timestamps: true,
						createdAt: 'created_at',
						updatedAt: 'updated_at',
						deletedAt: 'deleted_at',
						paranoid: true,
					},
				},
			},

			//---------------------------------------------------------------------
			MemberSession: {
				type: 'object',
				description: 'The session object.',
				properties: {
					session_id: { type: 'string', description: 'The session id.' },
					created_at: { type: 'string', format: 'date-time', description: 'The time the session was created.' },
					updated_at: { type: 'string', format: 'date-time', description: 'The time the session was updated.' },
					user_id: { type: 'string', description: 'The user id.' },
					expires_at: { type: 'string', format: 'date-time', description: 'The time the session expires.' },
					abandon_at: { type: 'string', format: 'date-time', description: 'The time the session is abandoned.' },
					closed_at: { type: 'string', format: 'date-time', description: 'The time the session was closed.' },
					locked_at: { type: 'string', format: 'date-time', description: 'The time the session was locked.' },
					metadata: { type: 'object', description: 'The metadata for the session.' },
					ip_address: { type: 'string', description: 'The ip address of the session.' },
				},
			},

			//---------------------------------------------------------------------
			MemberApiKey: {
				type: 'object',
				description: 'The apikey object.',
				properties: {
					apikey_id: { type: 'string', description: 'The apikey id.' },
					created_at: { type: 'string', format: 'date-time', description: 'The time the apikey was created.' },
					updated_at: { type: 'string', format: 'date-time', description: 'The time the apikey was updated.' },
					user_id: { type: 'string', description: 'The user id.' },
					apikey: { type: 'string', description: 'The apikey.' },
					description: { type: 'string', description: 'The description of the apikey.' },
					expires_at: { type: 'string', format: 'date-time', description: 'The time the apikey expires.' },
					locked_at: { type: 'string', format: 'date-time', description: 'The time the apikey was locked.' },
					closed_at: { type: 'string', format: 'date-time', description: 'The time the apikey was closed.' },
				},
			},

		},


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//   █████  ██    ██ ████████ ██   ██ 
		//  ██   ██ ██    ██    ██    ██   ██ 
		//  ███████ ██    ██    ██    ███████ 
		//  ██   ██ ██    ██    ██    ██   ██ 
		//  ██   ██  ██████     ██    ██   ██ 
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		NewSession: {
			description: 'Authenticate with the network and retrieve a new network session and token. The new token is also returned in the Authorization header of the response',
			groups: [],
			// http: { verb: 'post' },
			Arguments: {
				type: 'object',
				properties: {
					Strategy: { type: 'string', description: 'The authentication strategy to use.' },
					Identifier: { type: 'string', description: 'The identifier to use for authentication.' },
					Secret: { type: 'string', description: 'The secret to use for authentication.' },
				},
				required: [ 'Strategy', 'Identifier', 'Secret' ],
			},
			Returns: {
				type: 'object',
				properties: {
					session_token: { type: 'string', description: 'The network token for the session.' },
					User: { type: 'object', description: 'The user object.', $Object: 'MemberUser', },
					Session: { type: 'object', description: 'The session object.', $Object: 'MemberSession', },
				},
			},
		},


		//---------------------------------------------------------------------
		NewNetworkToken: {
			description: 'Generate a new network token for an existing session. The new token is also returned in the Authorization header of the response.',
			groups: [],
			// http: { verb: 'post' },
			Arguments: {
				type: 'object',
				properties: {},
				required: [],
			},
			Returns: {
				type: 'object',
				properties: {
					session_token: { type: 'string', description: 'The network token for the session.' },
					User: { type: 'object', description: 'The user object.', $Object: 'MemberUser', },
					Session: { type: 'object', description: 'The session object.', $Object: 'MemberSession', },
				},
			},
		},


		//---------------------------------------------------------------------
		LookupSession: {
			description: 'Looks up a session.',
			groups: [ 'network' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					NetworkToken: { type: 'string', description: 'The network token to lookup.' },
				},
				required: [ 'NetworkToken' ],
			},
			Returns: {
				type: 'object',
				properties: {
					session_token: { type: 'string', description: 'The network token for the session.' },
					User: { type: 'object', description: 'The user object.', $Object: 'MemberUser', },
					Session: { type: 'object', description: 'The session object.', $Object: 'MemberSession', },
				},
			},
		},


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//  ██    ██ ███████ ███████ ██████  ███████ 
		//  ██    ██ ██      ██      ██   ██ ██      
		//  ██    ██ ███████ █████   ██████  ███████ 
		//  ██    ██      ██ ██      ██   ██      ██ 
		//   ██████  ███████ ███████ ██   ██ ███████ 
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		ListUsers: {
			description: 'Lists the users on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					SearchInfo: {
						type: 'object',
						description: 'Search criteria to use when searching for users.',
						properties: {
							user_name: { type: 'string', description: 'The user name to search for.' },
							user_email: { type: 'string', description: 'The user email to search for.' },
						},
					},
					PageInfo: {
						type: 'object',
						description: 'Specifies the page of values to return.',
						properties: {
							limit: { type: 'number', description: 'The number of items to return.' },
							offset: { type: 'number', description: 'The offset to start from.' },
							count_only: { type: 'boolean', description: 'Whether to return only the count.' },
						},
					},
				},
				required: [],
			},
			Returns: {
				type: 'array',
				items: { type: 'object', $Object: 'MemberUser', },
			},
		},


		//---------------------------------------------------------------------
		GetUser: {
			description: 'Returns a user on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					UserID: { type: 'string', description: 'The user id to retrieve.' },
				},
				required: [ 'UserID' ],
			},
			Returns: {
				type: 'object',
				$Object: 'MemberUser',
			},
		},


		//---------------------------------------------------------------------
		RenameUser: {
			description: 'Renames a user on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					UserID: { type: 'string', description: 'The user id to rename.' },
					NewName: { type: 'string', description: 'The new name to assign to the user.' },
				},
				required: [ 'UserID', 'NewName' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the rename was successful.',
			},
		},


		//---------------------------------------------------------------------
		SetUserGroups: {
			description: 'Set the group membership for a user on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					UserID: { type: 'string', description: 'The user id to set the metadata for.' },
					Groups: { type: 'string', description: 'The groups to set for the user.' },
				},
				required: [ 'UserID', 'Groups' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the groups were set successfully.',
			},
		},


		//---------------------------------------------------------------------
		SetUserMetadata: {
			description: 'Sets the metadata for a user on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					UserID: { type: 'string', description: 'The user id to set the metadata for.' },
					Metadata: { type: 'object', allowNull: true, description: 'The metadata to set.' },
				},
				required: [ 'UserID' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the metadata was set successfully.',
			},
		},


		//---------------------------------------------------------------------
		LockUser: {
			description: 'Locks a user (and all sessions) on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					UserID: { type: 'string', description: 'The user id to lock.' },
					LockSessions: { type: 'boolean', description: 'Whether to lock the sessions.' },
				},
				required: [ 'UserID' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the lock was successful.',
			},
		},


		//---------------------------------------------------------------------
		UnlockUser: {
			description: 'Unlocks a user on the network.',
			groups: [ 'network' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					UserID: { type: 'string', description: 'The user id to unlock.' },
				},
				required: [ 'UserID' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the unlock was successful.',
			},
		},


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//  ███████ ███████ ███████ ███████ ██  ██████  ███    ██ ███████ 
		//  ██      ██      ██      ██      ██ ██    ██ ████   ██ ██      
		//  ███████ █████   ███████ ███████ ██ ██    ██ ██ ██  ██ ███████ 
		//       ██ ██           ██      ██ ██ ██    ██ ██  ██ ██      ██ 
		//  ███████ ███████ ███████ ███████ ██  ██████  ██   ████ ███████ 
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		ListSessions: {
			description: 'Lists the sessions on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					SearchInfo: {
						type: 'object',
						description: 'Search criteria to use when searching for sessions.',
						properties: {
							user_id: { type: 'string', description: 'The user id to search for.' },
							include_closed: { type: 'boolean', description: 'Whether to include closed sessions.' },
						},
					},
					PageInfo: {
						type: 'object',
						description: 'Specifies the page of values to return.',
						properties: {
							limit: { type: 'number', description: 'The number of items to return.' },
							offset: { type: 'number', description: 'The offset to start from.' },
							count_only: { type: 'boolean', description: 'Whether to return only the count.' },
						},
					},
				},
				required: [],
			},
			Returns: {
				type: 'array',
				items: { type: 'object', $Object: 'MemberSession', },
			},
		},


		//---------------------------------------------------------------------
		GetSession: {
			description: 'Returns a session on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					SessionID: { type: 'string', description: 'The session id to retrieve.' },
				},
				required: [ 'SessionID' ],
			},
			Returns: {
				type: 'object',
				$Object: 'MemberSession',
			},
		},


		//---------------------------------------------------------------------
		SetSessionMetadata: {
			description: 'Sets the metadata for a session on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					SessionID: { type: 'string', description: 'The session id to set the metadata for.' },
					Metadata: { type: 'object', allowNull: true, description: 'The metadata to set.' },
				},
				required: [ 'SessionID' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the metadata was set successfully.',
			},
		},


		//---------------------------------------------------------------------
		LockSession: {
			description: 'Locks a session on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					SessionID: { type: 'string', description: 'The session id to lock.' },
				},
				required: [ 'SessionID' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the lock was successful.',
			},
		},


		//---------------------------------------------------------------------
		UnlockSession: {
			description: 'Unlocks a session on the network.',
			groups: [ 'network' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					SessionID: { type: 'string', description: 'The session id to unlock.' },
				},
				required: [ 'SessionID' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the unlock was successful.',
			},
		},


		//---------------------------------------------------------------------
		CloseSession: {
			description: 'Closes a session on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					SessionID: { type: 'string', description: 'The session id to close.' },
				},
				required: [ 'SessionID' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the close was successful.',
			},
		},


		//---------------------------------------------------------------------
		ReapSessions: {
			description: 'Deletes abandoned sessions from the network.',
			groups: [ 'network' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {},
				required: [],
			},
			Returns: {
				type: 'number',
				description: 'The number of sessions deleted.',
			},
		},


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//   █████  ██████  ██     ██   ██ ███████ ██    ██ ███████ 
		//  ██   ██ ██   ██ ██     ██  ██  ██       ██  ██  ██      
		//  ███████ ██████  ██     █████   █████     ████   ███████ 
		//  ██   ██ ██      ██     ██  ██  ██         ██         ██ 
		//  ██   ██ ██      ██     ██   ██ ███████    ██    ███████ 
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		ListApiKeys: {
			description: 'Lists the ApiKeys owned by a user.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					UserID: { type: 'string', description: 'The user id to list key for.' },
				},
				required: [ 'UserID' ],
			},
			Returns: {
				type: 'array',
				description: 'The list of ApiKeys owned by this user.',
				items: { type: 'object', $Object: 'MemberApiKey', },
			},
		},


		//---------------------------------------------------------------------
		CreateApiKey: {
			description: 'Creates an ApiKey for a user.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					UserID: { type: 'string', description: 'The user id to create a key for.' },
					Description: { type: 'string', description: 'The description to assign to the new ApiKey.' },
					ExpirationMS: { type: 'number', description: 'The lifetime of the new ApiKey (in milliseconds).' },
				},
				required: [ 'UserID' ],
			},
			Returns: {
				type: 'array',
				description: 'The new ApiKey.',
				properties: {
					apikey_id: { type: 'string', description: 'The new ApiKey ID.' },
					apikey: { type: 'string', description: 'The new ApiKey.' },
					passkey: { type: 'string', description: 'The passkey for the new ApiKey.' },
				},
			},
		},


		//---------------------------------------------------------------------
		DestroyApiKey: {
			description: 'Destroys an ApiKey.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					ApiKeyID: { type: 'string', description: 'The ApiKey to destroy.' },
				},
				required: [ 'ApiKeyID' ],
			},
			Returns: {
				type: 'boolean',
			},
		},


		//---------------------------------------------------------------------
		GetApiKey: {
			description: 'Retrieves an ApiKey.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					ApiKeyID: { type: 'string', description: 'The id of the ApiKey to get.' },
				},
				required: [ 'ApiKeyID' ],
			},
			Returns: {
				type: 'object',
				$Object: 'MemberApiKey',
			},
		},


		//---------------------------------------------------------------------
		LockApiKey: {
			description: 'Locks an ApiKey on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					ApiKeyID: { type: 'string', description: 'The ApiKey id to lock.' },
				},
				required: [ 'ApiKeyID' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the lock was successful.',
			},
		},


		//---------------------------------------------------------------------
		UnlockApiKey: {
			description: 'Unlocks an ApiKey on the network.',
			groups: [ 'network', 'service' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					ApiKeyID: { type: 'string', description: 'The ApiKey id to unlock.' },
				},
				required: [ 'ApiKeyID' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the unlock was successful.',
			},
		},


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//  ███    ███ ██    ██     ███    ███ ███████ ███    ███ ██████  ███████ ██████  
		//  ████  ████  ██  ██      ████  ████ ██      ████  ████ ██   ██ ██      ██   ██ 
		//  ██ ████ ██   ████       ██ ████ ██ █████   ██ ████ ██ ██████  █████   ██████  
		//  ██  ██  ██    ██        ██  ██  ██ ██      ██  ██  ██ ██   ██ ██      ██   ██ 
		//  ██      ██    ██        ██      ██ ███████ ██      ██ ██████  ███████ ██   ██ 
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		GetMySession: {
			description: 'Gets this session.',
			groups: [ 'network', 'service', 'user' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {},
				required: [],
			},
			Returns: {
				type: 'object',
				properties: {
					session_token: { type: 'string', description: 'The network token for the session.' },
					User: { type: 'object', description: 'The user object.', $Object: 'MemberUser', },
					Session: { type: 'object', description: 'The session object.', $Object: 'MemberSession', },
				},
			},
		},


		//---------------------------------------------------------------------
		ListMyApiKeys: {
			description: 'Lists the ApiKeys owned by the current user.',
			groups: [ 'network', 'service', 'user' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {},
				required: [],
			},
			Returns: {
				type: 'array',
				description: 'The list of ApiKeys owned by the current user.',
				items: { type: 'object', $Object: 'MemberApiKey', },
			},
		},


		//---------------------------------------------------------------------
		CreateMyApiKey: {
			description: 'Creates an ApiKey for the current user.',
			groups: [ 'network', 'service', 'user' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					Description: { type: 'string', description: 'The description to assign to the new ApiKey.' },
					ExpirationMS: { type: 'number', description: 'The lifetime of the new ApiKey (in milliseconds).' },
				},
				required: [],
			},
			Returns: {
				type: 'array',
				description: 'The new ApiKey.',
				properties: {
					apikey: { type: 'string', description: 'The new ApiKey.' },
					passkey: { type: 'string', description: 'The passkey for the new ApiKey.' },
				},
			},
		},


		//---------------------------------------------------------------------
		DestroyMyApiKey: {
			description: 'Destroys an ApiKey.',
			groups: [ 'network', 'service', 'user' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					ApiKeyID: { type: 'string', description: 'The ApiKey to destroy.' },
				},
				required: [ 'ApiKeyID' ],
			},
			Returns: {
				type: 'boolean',
			},
		},


		//---------------------------------------------------------------------
		GetMyApiKey: {
			description: 'Retrieves an ApiKey.',
			groups: [ 'network', 'service', 'user' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					ApiKeyID: { type: 'string', description: 'The id of the ApiKey to get.' },
				},
				required: [ 'ApiKeyID' ],
			},
			Returns: {
				type: 'object',
				$Object: 'MemberApiKey',
			},
		},


		//---------------------------------------------------------------------
		LockMyApiKey: {
			description: 'Locks an ApiKey on the network.',
			groups: [ 'network', 'service', 'user' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					ApiKeyID: { type: 'string', description: 'The ApiKey id to lock.' },
				},
				required: [ 'ApiKeyID' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the lock was successful.',
			},
		},


		//---------------------------------------------------------------------
		UnlockMyApiKey: {
			description: 'Unlocks an ApiKey on the network.',
			groups: [ 'network', 'service', 'user' ],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {
					ApiKeyID: { type: 'string', description: 'The ApiKey id to unlock.' },
				},
				required: [ 'ApiKeyID' ],
			},
			Returns: {
				type: 'boolean',
				description: 'True if the unlock was successful.',
			},
		},


	};

};
