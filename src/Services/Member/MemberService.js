'use strict';

const EVENTS = require( 'events' );

const JSON_WEB_TOKEN = require( 'jsonwebtoken' );
const JWT_OPTIONS = { algorithm: 'HS256' };

const BCRYPT = require( 'bcrypt' );
const BCRYPT_SALT_ROUNDS = 12;


//---------------------------------------------------------------------
module.exports = function ( Server )
{

	//---------------------------------------------------------------------
	var Schema = require( './MemberSchema' )( Server );
	var Service = Server.Utilities.NewService( Server, 'Member', Schema );
	var Logger = Service._.Logger;
	var Data = Server.Utilities.NewSqlManager( Logger );
	var Events = new EVENTS();


	//---------------------------------------------------------------------
	Data._.RegisterDatabase( Service._.service_name, Service._.Config.SqlManager.Member, {

		//---------------------------------------------------------------------
		Users: {
			schema_type: 'sequelize',
			properties: {
				user_id: {
					type: Data._.DataTypes.UUID,
					defaultValue: Data._.DataTypes.UUIDV4,
					allowNull: false,
					primaryKey: true,
				},
				created_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				updated_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				deleted_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				authenticator_user_id: { type: Data._.DataTypes.STRING, allowNull: false, },
				user_name: { type: Data._.DataTypes.STRING, allowNull: true, },
				user_email: { type: Data._.DataTypes.STRING, allowNull: false, },
				groups: { type: Data._.DataTypes.STRING, allowNull: true, },
				metadata: { type: Data._.DataTypes.JSON, allowNull: true, },
				locked_at: { type: Data._.DataTypes.DATE, allowNull: true, },
			},
			required: [ 'user_id', 'authenticator_user_id', 'user_email' ],
			Table: {
				Indexes: [
					{ fields: [ 'user_id' ], unique: true },
					{ fields: [ 'authenticator_user_id' ], unique: true },
					{ fields: [ 'user_email' ], unique: true },
				],
				Options: {
					timestamps: true,
					createdAt: 'created_at',
					updatedAt: 'updated_at',
					deletedAt: 'deleted_at',
					paranoid: true,
				},
			}
		},

		//---------------------------------------------------------------------
		Sessions: {
			schema_type: 'sequelize',
			properties: {
				session_id: {
					type: Data._.DataTypes.UUID,
					defaultValue: Data._.DataTypes.UUIDV4,
					allowNull: false,
					primaryKey: true,
				},
				created_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				updated_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				deleted_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				user_id: { type: Data._.DataTypes.STRING, allowNull: false, },
				apikey_id: { type: Data._.DataTypes.STRING, allowNull: true, },
				authenticator_user_id: { type: Data._.DataTypes.STRING, allowNull: true, },
				authenticator_session_id: { type: Data._.DataTypes.STRING, allowNull: true, },
				created_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				expires_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				abandon_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				closed_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				locked_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				metadata: { type: Data._.DataTypes.JSON, allowNull: true, },
				ip_address: { type: Data._.DataTypes.STRING, allowNull: true, },
			},
			required: [ 'session_id', 'user_id' ],
			Table: {
				Indexes: [
					{ fields: [ 'session_id' ], unique: true },
					{ fields: [ 'user_id' ], unique: false },
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
		ApiKeys: {
			schema_type: 'sequelize',
			properties: {
				apikey_id: {
					type: Data._.DataTypes.UUID,
					defaultValue: Data._.DataTypes.UUIDV4,
					allowNull: false,
					primaryKey: true,
				},
				created_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				updated_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				deleted_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				user_id: { type: Data._.DataTypes.STRING, allowNull: false, },
				apikey: { type: Data._.DataTypes.STRING, allowNull: false, },
				passkey_hash: { type: Data._.DataTypes.STRING, allowNull: false, },
				description: { type: Data._.DataTypes.STRING, allowNull: true, },
				expires_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				locked_at: { type: Data._.DataTypes.DATE, allowNull: true, },
				closed_at: { type: Data._.DataTypes.DATE, allowNull: true, },
			},
			required: [ 'apikey_id', 'user_id', 'apikey', 'passkey_hash' ],
			Table: {
				Indexes: [
					{ fields: [ 'apikey_id' ], unique: true },
					{ fields: [ 'apikey' ], unique: true },
				],
				Options: {
					timestamps: true,
					createdAt: 'created_at',
					updatedAt: 'updated_at',
					deletedAt: 'deleted_at',
					paranoid: true,
				},
			}
		},

	} );


	//---------------------------------------------------------------------
	Service._.Initialize =
		async function ()
		{
			Logger.debug( `Initializing ${Service._.service_name} service ...` );

			Service._.Authenticator = null;
			if ( Service._.Config.Authenticator.Always ) 
			{
				Service._.Authenticator = require( './Authenticators/Always' )( Server, Service, Logger );
			}
			else if ( Service._.Config.Authenticator.Json ) 
			{
				Service._.Authenticator = require( './Authenticators/Json' )( Server, Service, Logger );
			}
			else if ( Service._.Config.Authenticator.Clerk ) 
			{
				Service._.Authenticator = require( './Authenticators/Clerk' )( Server, Service, Logger );
			}
			else
			{
				Logger.warn( `No authenticator configured.  Using the [Always] authenticator.` );
				Service._.Authenticator = require( './Authenticators/Always' )( Server, Service, Logger );
			}

			Logger.debug( `${Service._.service_name} service initialized.` );
			return;
		};


	// //---------------------------------------------------------------------
	// var Authenticator = null;
	// if ( Service._.Config.use_mock_authenticator_api ) 
	// {
	// 	Authenticator = require( './ClerkApi.Mock' )( Server );
	// }
	// else
	// {
	// 	Authenticator = require( './ClerkApi' )( Server );
	// }


	//---------------------------------------------------------------------
	Service._.Startup =
		async function ()
		{
			Logger.debug( `Starting ${Service._.service_name} service ...` );
			start_notify_events();
			await Data._.Startup();
			Logger.debug( `${Service._.service_name} service started.` );
			return;
		};


	//---------------------------------------------------------------------
	Service._.Shutdown =
		async function ()
		{
			Logger.debug( `Shutting down ${Service._.service_name} service ...` );
			stop_notify_events();
			await Data._.Shutdown();
			Logger.debug( `${Service._.service_name} service stopped.` );
			return;
		};


	//---------------------------------------------------------------------
	function validate_user( User )
	{
		if ( !User ) { throw new Error( `Missing required parameter [User].` ); }
		if ( User.locked_at ) { throw new Error( `User is locked.` ); }
		return true;
	};


	//---------------------------------------------------------------------
	function validate_session( Session )
	{
		var timestamp_ms = ( new Date() ).getTime();
		if ( !Session ) { throw new Error( `Missing required parameter [Session].` ); }
		if ( Session.closed_at ) { throw new Error( `Session is closed.` ); }
		var session_expires_at_ms = Session.expires_at.getTime();
		var session_abandon_at_ms = Session.abandon_at.getTime();
		if ( timestamp_ms >= session_expires_at_ms ) 
		{
			throw new Error( `Session is expired.` );
		}
		if ( timestamp_ms >= session_abandon_at_ms ) { throw new Error( `Session is abandoned.` ); }
		if ( Session.locked_at ) { throw new Error( `Session is locked.` ); }
		return true;
	};


	//=====================================================================
	//=====================================================================
	//
	//  ███████ ██    ██ ███████ ███    ██ ████████ ███████ 
	//  ██      ██    ██ ██      ████   ██    ██    ██      
	//  █████   ██    ██ █████   ██ ██  ██    ██    ███████ 
	//  ██       ██  ██  ██      ██  ██ ██    ██         ██ 
	//  ███████   ████   ███████ ██   ████    ██    ███████ 
	//
	//=====================================================================
	//=====================================================================


	//---------------------------------------------------------------------
	function start_notify_events()
	{
		function notify( EventType, ApiContext, EventData )
		{
			var notification_info = {
				user_id: ApiContext.User ? ApiContext.User.user_id : null,
				user_name: ApiContext.User ? ApiContext.User.user_name : null,
				user_email: ApiContext.User ? ApiContext.User.user_email : null,
				event_type: EventType,
				event_data: EventData,
			};
			Server.ServiceClient.Notify( notification_info );
			return;
		}

		// Events.on( 'Exchange.AccountCreated',
		// 	async function ( ApiContext, ExchangeAccount )
		// 	{ notify( 'Exchange.AccountCreated', ApiContext, { ExchangeAccount: ExchangeAccount } ); } );

		return;
	}


	//---------------------------------------------------------------------
	function stop_notify_events()
	{
		Events.removeAllListeners();
		return;
	}


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
	Service.NewSession =
		async function NewSession( Strategy, Identifier, Secret, ApiContext ) 
		{
			if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
			if ( !Strategy ) { throw new Error( `Missing required parameter [Strategy].` ); }

			// Create a new session.
			var timestamp_ms = ( new Date() ).getTime();
			var created_at_ms = timestamp_ms;
			var expires_at_ms = created_at_ms + Server.Config.Services.Member.Session.duration_ms;
			var abandon_at_ms = expires_at_ms + Server.Config.Services.Member.Session.abandon_ms;
			var session_info = {
				user_id: null,
				apikey_id: null,
				authenticator_user_id: null,
				authenticator_session_id: null,
				created_at: new Date( created_at_ms ),
				expires_at: new Date( expires_at_ms ),
				abandon_at: new Date( abandon_at_ms ),
				closed_at: null,
				locked_at: null,
				metadata: null,
				ip_address: ApiContext.source_address,
			};

			// Perform Authentication action.
			Strategy = Strategy.toLowerCase();

			//---------------------------------------------------------------------
			if ( Strategy === 'apikey' )
			{
				//---------------------------------
				// Identifier = ApiKey
				// Secret     = PassKey
				//---------------------------------

				if ( !Identifier ) { throw new Error( `Missing required parameter [Identifier].` ); }
				if ( !Secret ) { throw new Error( `Missing required parameter [Secret].` ); }

				// Lookup the ApiKey.
				var apikey = await Data.Member.ApiKeys.findOne( { where: { apikey: Identifier } } );
				if ( !apikey ) { throw new Error( `Invalid ApiKey.` ); }
				if ( apikey.locked_at )
				{
					throw new Error( `The ApiKey is locked.` );
				}
				if ( apikey.expires_at )
				{
					var expires_at_ms = apikey.expires_at.getTime();
					if ( timestamp_ms >= expires_at_ms ) { throw new Error( `The ApiKey has expired.` ); }
				}

				// Authenticate the PassKey.
				var authenticated = await BCRYPT.compare( Secret, apikey.passkey_hash );
				if ( !authenticated ) { throw new Error( `Invalid PassKey.` ); }

				// Update the session.
				session_info.user_id = apikey.user_id;
				session_info.apikey_id = apikey.apikey_id;
			}

			//---------------------------------------------------------------------
			else if ( Strategy === 'email' )
			{
				//---------------------------------
				// Identifier = EmailAddress
				// Secret     = Password
				//---------------------------------

				if ( !Identifier ) { throw new Error( `Missing required parameter [Identifier].` ); }
				if ( !Secret ) { throw new Error( `Missing required parameter [Secret].` ); }
				if ( typeof Identifier !== 'string' ) { throw new Error( `Required parameter [Identifier] must be a string.` ); }
				if ( typeof Secret !== 'string' ) { throw new Error( `Required parameter [Secret] must be a string.` ); }

				// Authenticate the User and Password.
				var authorization_token = null;
				try
				{
					var result = await Service._.Authenticator.Signin( Identifier, Secret );
					if ( !result ) { throw new Error( `Authenticator response returned null.` ); }
					if ( !result.session_id ) { throw new Error( `Authenticator response is missing session.` ); }
					if ( !result.authorization_token ) { throw new Error( `Authenticator response is missing authorization.` ); }
					session_info.authenticator_session_id = result.session_id;
					authorization_token = result.authorization_token;
				}
				catch ( error )
				{
					throw error;
				}

				// Retrieve Authenticated Session and User.
				var authenticated_session = null;
				var authenticated_user = null;
				try
				{
					var result = await Service._.Authenticator.GetSession( session_info.authenticator_session_id, authorization_token );
					if ( !result ) { throw new Error( `Authenticator response returned null.` ); }
					if ( !result.session_id ) { throw new Error( `Authenticator response is missing session.` ); }
					authenticated_session = result;
					authenticated_user = authenticated_session.User;
				}
				catch ( error )
				{
					throw error;
				}

				// Lookup the user.
				if ( !authenticated_session ) { throw new Error( `Missing required parameter [authenticated_session].` ); }
				if ( !authenticated_session.session_id ) { throw new Error( `Missing required parameter [authenticated_session.session_id].` ); }
				if ( !authenticated_user ) { throw new Error( `Missing required parameter [authenticated_user].` ); }
				if ( !authenticated_user.user_id ) { throw new Error( `Missing required parameter [authenticated_user.user_id].` ); }
				if ( !authenticated_user.email_address ) { throw new Error( `Missing required parameter [authenticated_user.email_address].` ); }
				// if ( !authenticated_user.first_name ) { throw new Error( `Missing required parameter [authenticated_user.first_name].` ); }
				// if ( !authenticated_user.last_name ) { throw new Error( `Missing required parameter [authenticated_user.last_name].` ); }

				// // Find user by authenticator_user_id.
				// var user = await Data.Member.Users.findOne( { where: { authenticator_user_id: authenticated_user.user_id } } );

				// Find user by email address.
				var user = await Data.Member.Users.findOne( { where: { user_email: authenticated_user.email_address } } );

				// Check to create user.
				if ( !user )
				{
					// Create the user.
					var user_info = {
						user_email: authenticated_user.email_address,
						user_name: authenticated_user.first_name + ' ' + authenticated_user.last_name,
						authenticator_user_id: authenticated_user.user_id,
						groups: Server.Config.Services.Member.default_user_groups,
					};
					var user_count = await Data.Member.Users.count();
					if ( user_count === 0 )
					{
						user_info.groups = Server.Config.Services.Member.admin_user_groups;
					}
					user = await Data.Member.Users.create( user_info );
					if ( !user ) { throw new Error( `Failed to create new user.` ); }
					user = Data._.CloneItem( user, Data.Member._.Tables.Users._.TableSchema );
				}


				// Update the session.
				// session_info.user_id = user.user_id;
				// session_info.clerk_user_id = clerk_user.id;
				// session_info.clerk_session_id = clerk_session.id;
				session_info.user_id = user.user_id;
				// session_info.clerk_user_id = clerk_user.id;
				// session_info.clerk_session_id = clerk_session.id;
				session_info.authenticator_user_id = authenticated_user.user_id;
				session_info.authenticator_session_id = authenticated_session.session_id;
			}

			//---------------------------------------------------------------------
			else if ( Strategy === 'clerk' )
			{
				//---------------------------------
				// Identifier = <null>
				// Secret     = Clerk Session Token
				//---------------------------------

				if ( !Secret ) { throw new Error( `Missing required parameter [Secret].` ); }

				// Get the Clerk session token.
				var network_token = JSON_WEB_TOKEN.verify( Secret, Service._.Config.Clerk.jwt_public_key );

				throw new Error( `Not implemented.` );

				// Update the session.
				session_info.user_id = null;
			}

			//---------------------------------------------------------------------
			else if ( Strategy === 'renew' )
			{
				//---------------------------------
				// Identifier = <null>
				// Secret     = Network Session Token
				//---------------------------------

				if ( !Secret ) { throw new Error( `Missing required parameter [Secret].` ); }

				// Get the Network session token.
				// var network_token = JSON_WEB_TOKEN.verify( Secret, Server.Config.Network.network_key );
				var network_token = JSON_WEB_TOKEN.decode( Secret, Server.Config.Network.network_key );

				// Lookup the existing session.
				var session = await Data.Member.Sessions.findOne( { where: { session_id: network_token.sid } } );
				if ( !session ) { throw new Error( `Unable to find the session with session id [${network_token.sid}].` ); }
				if ( session && session.dataValues ) { session = session.dataValues; }
				// validate_session( session );
				if ( session.locked_at ) { throw new Error( `Session is locked.` ); }

				// // Lookup the user.
				// var user = await Data.Member.Users.findOne( { where: { user_id: session_token.sub } } );
				// if ( !user ) { throw new Error( `Unable to find the user with user id [${session_token.sub}].` ); }
				// if ( user && user.dataValues ) { user = user.dataValues; }
				// if ( user.locked_at ) { throw new Error( `User is locked [${user.user_id}].` ); }

				// Update the session.
				session_info.user_id = session.user_id;
				session_info.apikey_id = session.apikey_id;
				session_info.authenticator_user_id = session.authenticator_user_id;
				session_info.authenticator_session_id = session.authenticator_session_id;
			}

			//---------------------------------------------------------------------
			else
			{
				throw new Error( `Invalid authentication strategy [${Strategy}].` );
			}
			if ( !session_info.user_id ) { throw new Error( `Unable to determine the user id.` ); }

			// Load the user.
			var user = await Data.Member.Users.findOne( { where: { user_id: session_info.user_id } } );
			if ( !user ) { throw new Error( `Unable to find the user with user id [${session_info.user_id}].` ); }
			// if ( user && user.dataValues ) { user = user.dataValues; }
			validate_user( user );

			// Save the session.
			var session = await Data.Member.Sessions.create( session_info );
			if ( !session ) { throw new Error( `Unable to create session for user id [${session_info.user_id}].` ); }
			// if ( session && session.dataValues ) { session = session.dataValues; }
			// validate_session( session );

			// Clean and return the user and session.
			user = Data._.CloneItem( user, Data.Member._.Tables.Users._.TableSchema );
			session = Data._.CloneItem( session, Data.Member._.Tables.Sessions._.TableSchema );

			// Create the network token.
			var network_token_info = Server.Utilities.TokenizePayload(
				{ User: user, Session: session }, 'network',
				Server.Config.Services.Member.Token.duration_ms,
				Server.Config.Services.Member.Token.abandon_ms,
				user.user_id, session.session_id );
			var network_token = JSON_WEB_TOKEN.sign( network_token_info, Server.Config.Network.network_key, JWT_OPTIONS );
			// var network_token = create_network_token( user, session );

			ApiContext.return_authorization = network_token;
			// ApiContext.Response.setHeader( 'Authorization', network_token );

			// Return the connection status.
			return {
				session_token: network_token,
				User: user,
				Session: session,
			};
		};


	//---------------------------------------------------------------------
	Service.NewNetworkToken =
		async function NewNetworkToken( ApiContext ) 
		{
			if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
			if ( !ApiContext.authorization ) { throw new Error( `Authentication required.` ); }
			var token_info = JSON_WEB_TOKEN.decode( ApiContext.authorization, Server.Config.Network.network_key, JWT_OPTIONS );

			// Lookup the user.
			var user = await Data.Member.Users.findOne( { where: { user_id: token_info.sub } } );
			if ( !user ) { throw new Error( `Unable to find the user with user id [${token_info.sub}].` ); }
			user = Data._.CloneItem( user, Data.Member._.Tables.Users._.TableSchema );
			validate_user( user );

			// Lookup the session.
			var session = await Data.Member.Sessions.findOne( { where: { session_id: token_info.sid } } );
			if ( !session ) { throw new Error( `Unable to find the session with session id [${token_info.sid}].` ); }
			session = Data._.CloneItem( session, Data.Member._.Tables.Sessions._.TableSchema );
			validate_session( session );

			// Create a new network token.
			var network_token_info = Server.Utilities.TokenizePayload(
				{ User: user, Session: session }, 'network',
				Server.Config.Services.Member.Token.duration_ms,
				Server.Config.Services.Member.Token.abandon_ms,
				user.user_id, session.session_id );
			var network_token = JSON_WEB_TOKEN.sign( network_token_info, Server.Config.Network.network_key, JWT_OPTIONS );
			// var network_token = create_network_token( user, session );

			ApiContext.return_authorization = network_token;
			// ApiContext.Response.setHeader( 'Authorization', network_token );

			// Return the connection status.
			return {
				session_token: network_token,
				User: user,
				Session: session,
			};
		};


	//---------------------------------------------------------------------
	Service.LookupSession = async function ( NetworkToken, ApiContext )
	{
		// if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		// if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }
		if ( !NetworkToken ) { throw new Error( `Missing required parameter [NetworkToken].` ); }

		var token_info = JSON_WEB_TOKEN.decode( NetworkToken, Server.Config.Network.network_key );
		var user = await Data.Member.Users.findOne( { where: { user_id: token_info.sub } } );
		var session = await Data.Member.Sessions.findOne( { where: { session_id: token_info.sid } } );

		user = Data._.CloneItem( user, Data.Member._.Tables.Users._.TableSchema );
		session = Data._.CloneItem( session, Data.Member._.Tables.Sessions._.TableSchema );

		return {
			session_token: NetworkToken,
			User: user,
			Session: session,
		};
	};


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
	Service.ListUsers = async function ( SearchInfo, PageInfo, ApiContext )
	{
		var criteria = {};
		if ( SearchInfo )
		{
			if ( SearchInfo.user_name ) 
			{
				criteria.user_name = { [ Data._.Op.like ]: `%${SearchInfo.user_name}%` };
			}
			if ( SearchInfo.user_email ) 
			{
				criteria.user_email = { [ Data._.Op.like ]: `%${SearchInfo.user_email}%` };
			}
		}

		var page_info = {};
		if ( PageInfo ) 
		{
			if ( PageInfo.limit ) { page_info.limit = PageInfo.limit; }
			if ( PageInfo.offset ) { page_info.offset = PageInfo.offset; }
			if ( PageInfo.count_only ) 
			{
				var count = await Data.Member.Users.count( { where: criteria } );
				return count;
			}
		}

		var users = await Data.Member.Users.findAll(
			{ where: criteria },
			{ order: [ [ 'created_at', 'DESC' ] ] },
			{ limit: page_info },
		);
		users = users.map( item => Data._.CloneItem( item, Data.Member._.Tables.Users._.TableSchema ) );

		return users;
	};


	//---------------------------------------------------------------------
	Service.GetUser = async function ( UserID, ApiContext )
	{
		if ( !UserID ) { throw new Error( `Missing required parameter [UserID].` ); }

		var user = await Data.Member.Users.findByPk( UserID );
		user = Data._.CloneItem( user, Data.Member._.Tables.Users._.TableSchema );

		return user;
	};


	//---------------------------------------------------------------------
	Service.RenameUser = async function ( UserID, NewName, ApiContext )
	{
		if ( !UserID ) { throw new Error( `Missing required parameter [UserID].` ); }
		if ( !NewName ) { throw new Error( `Missing required parameter [NewName].` ); }

		var sql_result = await Data.Member.Users.update(
			{ user_name: NewName },
			{ where: { user_id: UserID } },
		);
		Data._.ASSERT_Update( sql_result, 1 );

		return true;
	};


	//---------------------------------------------------------------------
	Service.SetUserGroups = async function ( UserID, Groups, ApiContext )
	{
		if ( !UserID ) { throw new Error( `Missing required argument [UserID].` ); }
		if ( !Groups ) { Groups = ''; }

		var sql_result = await Data.Member.Users.update(
			{ groups: Groups },
			{ where: { user_id: UserID } },
		);
		Data._.ASSERT_Update( sql_result, 1 );

		return true;
	};


	//---------------------------------------------------------------------
	Service.SetUserMetadata = async function ( UserID, Metadata, ApiContext )
	{
		if ( !UserID ) { throw new Error( `Missing required argument [UserID].` ); }

		// if ( Metadata )
		// {
		// 	if ( typeof Metadata !== 'string' ) { Metadata = JSON.stringify( Metadata ); }
		// }

		var sql_result = await Data.Member.Users.update(
			{ metadata: Metadata },
			{ where: { user_id: UserID } },
		);
		Data._.ASSERT_Update( sql_result, 1 );

		return true;
	};


	//---------------------------------------------------------------------
	Service.LockUser = async function ( UserID, LockSessions, ApiContext )
	{
		if ( !UserID ) { throw new Error( `Missing required argument [UserID].` ); }

		return await Data.Member._.WithTransaction(
			async function ( Transaction )
			{
				var locked_at = EnableLock ? ( new Date() ) : null;
				var sql_result = await Data.Member.Users.update(
					{ locked_at: locked_at },
					{ where: { user_id: UserID }, transaction: Transaction },
				);
				Data._.ASSERT_Update( sql_result, 1 );
				if ( LockSessions )
				{
					var count = await Data.Member.Sessions.count( { where: { user_id: UserID }, transaction: Transaction } );
					sql_result = await Data.Member.Sessions.update(
						{ locked_at: locked_at },
						{ where: { user_id: UserID }, transaction: Transaction },
					);
					Data._.ASSERT_Update( sql_result, count );
				}
				return true;
			} );
	};


	//---------------------------------------------------------------------
	Service.UnlockUser = async function ( UserID, ApiContext )
	{
		if ( !UserID ) { throw new Error( `Missing required argument [UserID].` ); }

		var sql_result = await Data.Member.Users.update(
			{ locked_at: null },
			{ where: { user_id: UserID } },
		);
		Data._.ASSERT_Update( sql_result, 1 );

		return true;
	};


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
	Service.ListSessions = async function ( SearchInfo, PageInfo, ApiContext )
	{
		var criteria = {};
		if ( SearchInfo )
		{
			if ( SearchInfo.user_id ) { criteria.user_id = SearchInfo.user_id; }
			if ( !!!SearchInfo.include_closed ) { criteria.closed_at = null; }
		}

		var page_info = {};
		if ( PageInfo ) 
		{
			if ( PageInfo.limit ) { page_info.limit = PageInfo.limit; }
			if ( PageInfo.offset ) { page_info.offset = PageInfo.offset; }
			if ( PageInfo.count_only )
			{
				var count = await Data.Member.Sessions.count( { where: criteria } );
				return count;
			}
		}

		var sessions = await Data.Member.Sessions.findAll(
			{ where: criteria },
			{ order: [ [ 'created_at', 'DESC' ] ] },
			{ limit: page_info },
		);
		sessions = sessions.map( item => Data._.CloneItem( item, Data.Member._.Tables.Sessions._.TableSchema ) );

		return sessions;
	};


	//---------------------------------------------------------------------
	Service.GetSession = async function ( SessionID, ApiContext )
	{
		if ( !SessionID ) { throw new Error( `Missing required parameter [SessionID].` ); }

		var session = await Data.Member.Sessions.findByPk( SessionID );
		session = Data._.CloneItem( session, Data.Member._.Tables.Sessions._.TableSchema );

		return session;
	};


	//---------------------------------------------------------------------
	Service.SetSessionMetadata = async function ( SessionID, Metadata, ApiContext )
	{
		if ( !SessionID ) { throw new Error( `Missing required argument [SessionID].` ); }

		var sql_result = await Data.Member.Sessions.update(
			{ metadata: Metadata },
			{ where: { session_id: SessionID } },
		);
		Data._.ASSERT_Update( sql_result, 1 );

		return true;
	};


	//---------------------------------------------------------------------
	Service.LockSession = async function ( SessionID, ApiContext )
	{
		if ( !SessionID ) { throw new Error( `Missing required argument [SessionID].` ); }

		var sql_result = await Data.Member.Sessions.update(
			{ locked_at: ( new Date() ) },
			{ where: { session_id: SessionID } },
		);
		Data._.ASSERT_Update( sql_result, 1 );

		return true;
	};


	//---------------------------------------------------------------------
	Service.UnlockSession = async function ( SessionID, ApiContext )
	{
		if ( !SessionID ) { throw new Error( `Missing required argument [SessionID].` ); }

		var sql_result = await Data.Member.Sessions.update(
			{ locked_at: null },
			{ where: { session_id: SessionID } },
		);
		Data._.ASSERT_Update( sql_result, 1 );

		return true;
	};


	//---------------------------------------------------------------------
	Service.CloseSession = async function ( SessionID, ApiContext )
	{
		if ( !SessionID ) { throw new Error( `Missing required argument [SessionID].` ); }

		var sql_result = await Data.Member.Sessions.update(
			{ closed_at: ( new Date() ) },
			{ where: { session_id: SessionID } },
		);
		Data._.ASSERT_Update( sql_result, 1 );

		return true;
	};


	//---------------------------------------------------------------------
	Service.ReapSessions = async function ( ApiContext )
	{
		var timestamp = new Date();
		var sql_result = await Data.Member.Sessions.destroy(
			{ where: { abandon_at: { [ Data._.Op.lte ]: timestamp } } },
		);

		return sql_result;
	};


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
	Service.ListApiKeys = async function ( UserID, ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }
		if ( !UserID ) { throw new Error( `Missing required argument [UserID].` ); }

		var apikeys = await Data.Member.ApiKeys.findAll(
			{ where: { user_id: UserID } },
			{ order: [ [ 'created_at', 'DESC' ] ] },
		);
		apikeys = apikeys.map( item => Data._.CloneItem( item, Data.Member._.Tables.ApiKeys._.TableSchema ) );

		return apikeys;
	};


	//---------------------------------------------------------------------
	Service.CreateApiKey = async function ( UserID, Description, ExpirationMS, ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }
		if ( !UserID ) { throw new Error( `Missing required parameter [UserID].` ); }

		// Lookup the user.
		var user = await Data.Member.Users.findOne( { where: { user_id: UserID } } );
		if ( !user ) { throw new Error( `Unable to find the user with user id [${UserID}].` ); }

		// Set defaults.
		if ( !Description ) { Description = `ApiKey for ${user.user_name} (${user.user_email})`; }

		// Create the apikey.
		var apikey = Server.Utilities.UniqueID( 'apikey', 16 );
		var passkey = Server.Utilities.UniqueID( null, 64 );
		var passkey_hash = BCRYPT.hashSync( passkey, BCRYPT_SALT_ROUNDS );
		var apikey_info = {
			user_id: UserID,
			apikey: apikey,
			passkey_hash: passkey_hash,
			description: Description,
		};
		if ( ExpirationMS ) 
		{
			ExpirationMS = parseInt( ExpirationMS );
			var timestamp_ms = ( new Date() ).getTime();
			var expiration = new Date( timestamp_ms + ExpirationMS );
			apikey_info.expires_at = expiration;
		}
		var apikey = await Data.Member.ApiKeys.create( apikey_info );
		if ( !apikey ) { throw new Error( `Failed to create apikey.` ); }

		// Return the apikey and passkey.
		return {
			apikey_id: apikey.apikey_id,
			apikey: apikey.apikey,
			passkey: passkey,
		};
	};


	//---------------------------------------------------------------------
	Service.DestroyApiKey = async function ( ApiKeyID, ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }
		if ( !ApiKeyID ) { throw new Error( `Missing required parameter [ApiKeyID].` ); }

		var sql_result = await Data.Member.ApiKeys.destroy( { where: { apikey_id: ApiKeyID } } );
		Data._.ASSERT_Destroy( sql_result, 1 );

		return true;
	};


	//---------------------------------------------------------------------
	Service.GetApiKey = async function ( ApiKeyID, ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }
		if ( !ApiKeyID ) { throw new Error( `Missing required parameter [ApiKeyID].` ); }

		var apikey = await Data.Member.ApiKeys.findOne( { where: { apikey_id: ApiKeyID } } );
		if ( !apikey ) { throw new Error( `Unable to find ApiKey with apikey id [${ApiKeyID}].` ); }
		apikey = Data._.CloneItem( apikey, Data.Member._.Tables.ApiKeys._.TableSchema );

		return apikey;
	};


	//---------------------------------------------------------------------
	Service.LockApiKey = async function ( ApiKeyID, ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }
		if ( !ApiKeyID ) { throw new Error( `Missing required argument [ApiKeyID].` ); }

		var sql_result = await Data.Member.ApiKeys.update(
			{ locked_at: ( new Date() ) },
			{ where: { apikey_id: ApiKeyID } },
		);
		Data._.ASSERT_Update( sql_result, 1 );

		return true;
	};


	//---------------------------------------------------------------------
	Service.UnlockApiKey = async function ( ApiKeyID, ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }
		if ( !ApiKeyID ) { throw new Error( `Missing required argument [ApiKeyID].` ); }

		var sql_result = await Data.Member.ApiKeys.update(
			{ locked_at: null },
			{ where: { apikey_id: ApiKeyID } },
		);
		Data._.ASSERT_Update( sql_result, 1 );

		return true;
	};


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
	Service.GetMySession = async function ( ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		return await Service.LookupSession( ApiContext.authorization, ApiContext );
	};


	//---------------------------------------------------------------------
	Service.ListMyApiKeys = async function ( ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }

		return await Service.ListApiKeys( ApiContext.User.user_id, ApiContext );
	};


	//---------------------------------------------------------------------
	Service.CreateMyApiKey = async function ( Description, ExpirationMS, ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }

		return await Service.CreateApiKey( ApiContext.User.user_id, Description, ExpirationMS, ApiContext );
	};


	//---------------------------------------------------------------------
	Service.DestroyMyApiKey = async function ( ApiKeyID, ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }
		if ( !ApiKeyID ) { throw new Error( `Missing required parameter [ApiKeyID].` ); }

		var apikey = await Service.GetApiKey( ApiKeyID, ApiContext );
		if ( apikey.user_id !== ApiContext.User.user_id ) { throw new Error( `You do not have permission to delete this ApiKey.` ); }

		return await Service.DestroyApiKey( ApiKeyID, ApiContext );
	};


	//---------------------------------------------------------------------
	Service.GetMyApiKey = async function ( ApiKeyID, ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }
		if ( !ApiKeyID ) { throw new Error( `Missing required parameter [ApiKeyID].` ); }

		var apikey = await Service.GetApiKey( ApiKeyID, ApiContext );
		if ( apikey.user_id !== ApiContext.User.user_id ) { throw new Error( `You do not have permission to view this ApiKey.` ); }

		return await Service.GetApiKey( ApiKeyID, ApiContext );
	};


	//---------------------------------------------------------------------
	Service.LockMyApiKey = async function ( ApiKeyID, ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }
		if ( !ApiKeyID ) { throw new Error( `Missing required argument [ApiKeyID].` ); }

		var apikey = await Service.GetApiKey( ApiKeyID, ApiContext );
		if ( apikey.user_id !== ApiContext.User.user_id ) { throw new Error( `You do not have permission to modify this ApiKey.` ); }

		return await Service.LockApiKey( ApiKeyID, ApiContext );
	};


	//---------------------------------------------------------------------
	Service.UnlockMyApiKey = async function ( ApiKeyID, ApiContext )
	{
		if ( !ApiContext ) { throw new Error( `This function must be called in the context of an Api.` ); }
		if ( !ApiContext.User ) { throw new Error( `Authentication required.` ); }
		if ( !ApiKeyID ) { throw new Error( `Missing required argument [ApiKeyID].` ); }

		var apikey = await Service.GetApiKey( ApiKeyID, ApiContext );
		if ( apikey.user_id !== ApiContext.User.user_id ) { throw new Error( `You do not have permission to modify this ApiKey.` ); }

		return await Service.UnlockApiKey( ApiKeyID, ApiContext );
	};


	//---------------------------------------------------------------------
	return Service;
}

