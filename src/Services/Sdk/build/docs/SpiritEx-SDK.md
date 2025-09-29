# SpiritEx SDK - Complete Documentation

*Your complete guide to the SpiritEx API ecosystem - from quick start to production deployment.*

---

## Table of Contents

1. [Overview & Quick Start](#overview--quick-start)
2. [Installation & Setup](#installation--setup)
3. [Authentication Methods](#authentication-methods)
4. [Core Services Reference](#core-services-reference)
5. [Security Best Practices](#security-best-practices)
6. [Error Handling Patterns](#error-handling-patterns)
7. [Advanced Usage & Configuration](#advanced-usage--configuration)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Migration & Upgrade Guide](#migration--upgrade-guide)
10. [Quick Reference](#quick-reference)
11. [Data Types Reference](#data-types-reference)

---

# Overview & Quick Start

## About SpiritEx SDK

The SpiritEx SDK provides seamless integration with the SpiritEx API ecosystem, supporting both Node.js and browser environments. The SDK handles authentication, session management, and provides a promise-based interface for all API operations.

### Core Features

- **Dual Environment Support**: Works in Node.js and browsers
- **Automatic Session Management**: Handles authentication and token refresh
- **Promise-Based API**: All operations return promises
- **Comprehensive Error Handling**: Structured error patterns with detailed information
- **Security First**: Built-in security best practices and credential protection

### Services Overview

The SpiritEx API is organized into three core services:

#### 🩺 Diagnostic Service
- **Purpose**: Server health monitoring and system information
- **Key Commands**: `ServerInfo()`, `ServicesInfo()`, `ServerError()`
- **Use Cases**: Health checks, monitoring, system status dashboards

#### 👤 Member Service  
- **Purpose**: User authentication, session management, and API key operations
- **Key Commands**: `NewSession()`, `GetMySession()`, `ListMyApiKeys()`, `CreateMyApiKey()`
- **Use Cases**: Authentication flows, user management, API key lifecycle

#### 💰 Exchange Service
- **Purpose**: Trading accounts, permissions, and market operations
- **Key Commands**: `GetAgencies()`, `ListAccounts()`, `CreateAccount()`
- **Use Cases**: Trading applications, account management, financial operations

### Instant Setup

```javascript
const NewServiceClient = require('@spiritex/spiritex-client');
const Config = require('./~config.json');

const Client = NewServiceClient(Config.NetworkUrls, Config.Credentials);

// Test connection
const serverInfo = await Client.Diagnostic.ServerInfo();
console.log(`Connected to: ${serverInfo.network_name}`);
```

---

# Installation & Setup

## Environment Requirements

- **Node.js**: v20 or higher
- **Browser**: Modern browsers with fetch API support  
- **Network**: HTTPS required for production
- **Dependencies**: No external dependencies required

## Installation Methods

### Node.js Installation

```bash
npm install --save @spiritex/spiritex-client
```

```javascript
const NewServiceClient = require('@spiritex/spiritex-client');
```

### Browser Installation

```html
<script src="path/to/SpiritEx-Http-Client.js"></script>
<script>
    // SDK available as window.SpiritEx.NewServiceClient
    const Client = window.SpiritEx.NewServiceClient(NetworkUrls, NetworkCredentials);
</script>
```

**Note**: When using in browsers, ensure proper CORS headers are configured on your server.

## Configuration Setup

### Basic Configuration File Structure

Create a `~config.json` file:

```json
{
    "NetworkUrls": {
        "Diagnostic": "http://localhost:4200",
        "Member": "http://localhost:4200", 
        "Exchange": "http://localhost:4200"
    },
    "Credentials": {
        "user_email": "your-email@example.com",
        "password": "your-password"
    }
}
```

### Environment Variables (Recommended for Production)

```javascript
// Load credentials from environment
const NetworkCredentials = {
    apikey: process.env.SPIRITEX_API_KEY,
    passkey: process.env.SPIRITEX_PASS_KEY
};

// Validate environment variables
if (!NetworkCredentials.apikey || !NetworkCredentials.passkey) {
    throw new Error('Missing required environment variables: SPIRITEX_API_KEY, SPIRITEX_PASS_KEY');
}
```

### Your First API Call

```javascript
async function GetServerInfo() {
    try {
        // Load configuration
        const Config = require('./~config.json');
        const NetworkUrls = Config.NetworkUrls;
        const NetworkCredentials = Config.Credentials;

        // Create client
        const Client = NewServiceClient(NetworkUrls, NetworkCredentials);

        // Make API call
        const ServerInfo = await Client.Diagnostic.ServerInfo();
        console.log('Server Info:', ServerInfo);

        return ServerInfo;
    }
    catch (error) {
        console.error('Error getting server info:', error.message);
        throw error;
    }
}

// Execute
GetServerInfo()
    .then(() => console.log('Success!'))
    .catch(error => console.error('Failed:', error));
```

---

# Authentication Methods

SpiritEx SDK supports two authentication methods designed for different use cases:

| Method | Security Level | Best For | Production Ready |
|--------|----------------|----------|------------------|
| **Email/Password** | Medium | Development, interactive apps | ⚠️ Development only |
| **API Key/Pass Key** | High | Production, server-to-server | ✅ Recommended |

## Email/Password Authentication

### Configuration
```javascript
const NetworkCredentials = {
    user_email: 'user@example.com',
    password: 'secure-password-123'
};
```

### Implementation
```javascript
async function AuthenticateWithPassword() {
    try {
        const Client = NewServiceClient(
            Config.NetworkUrls,
            Config.Credentials  // Contains user_email and password
        );

        // Test authentication
        const SessionInfo = await Client.Member.GetMySession();
        console.log(`Authenticated as: ${SessionInfo.User.user_name}`);
        
        return Client;
    }
    catch (error) {
        if (error.message.includes('authentication')) {
            console.error('Invalid credentials - check email and password');
        }
        throw error;
    }
}
```

## API Key Authentication (Recommended)

### Configuration
```javascript
const NetworkCredentials = {
    apikey: 'ak_1234567890abcdef1234567890abcdef',
    passkey: 'pk_fedcba0987654321fedcba0987654321'
};
```

### Implementation
```javascript
async function AuthenticateWithApiKey() {
    try {
        const NetworkCredentials = {
            apikey: process.env.SPIRITEX_API_KEY,
            passkey: process.env.SPIRITEX_PASS_KEY
        };

        const Client = NewServiceClient(
            Config.NetworkUrls,
            NetworkCredentials
        );

        // Verify connection
        const ServerInfo = await Client.Diagnostic.ServerInfo();
        console.log(`Connected to: ${ServerInfo.network_name}`);
        
        return Client;
    }
    catch (error) {
        if (error.message.includes('apikey') || error.message.includes('authentication')) {
            console.error('Invalid API key or pass key');
        }
        throw error;
    }
}
```

### Creating API Keys
```javascript
async function CreateApiKey(Client) {
    try {
        // Create new API key with 1 year expiration
        const NewApiKey = await Client.Member.CreateMyApiKey(
            'Production Application Key',
            86400000 * 365  // 1 year in milliseconds
        );

        console.log('New API Key:', NewApiKey.apikey);
        console.log('Pass Key (save securely):', NewApiKey.passkey);
        
        // ⚠️ CRITICAL: Save the pass key immediately - it cannot be retrieved later
        
        return NewApiKey;
    }
    catch (error) {
        console.error('API key creation failed:', error.message);
        throw error;
    }
}
```

---

# Core Services Reference

## Response Format

### Success Response Pattern
The SDK returns the `result` field directly from successful API calls:

```javascript
// Direct result access
const ServerInfo = await Client.Diagnostic.ServerInfo();
console.log(ServerInfo.network_name);  // Direct property access
console.log(ServerInfo.server_time);   // No need to access .data
```

### Error Response Pattern
```javascript
try {
    const Result = await Client.SomeService.SomeCommand();
    // Success - use result directly
} catch (error) {
    if (error.name === 'TransportError') {
        // Network connectivity issues
        console.error('Network error:', error.message);
    } else if (error.name === 'ApiError') {
        // API-level failures
        console.error('API error:', error.message);
        console.error('Response:', error.ApiResponse);
    }
}
```

## Diagnostic Service

### ServerInfo()
Gets comprehensive server information including health, memory usage, and version details.

**Usage:**
```javascript
const ServerInfo = await Client.Diagnostic.ServerInfo();
```

**Response Example:**
```javascript
{
    network_name: "SpiritEx Network",
    network_time: "2025-08-18T12:00:00Z",
    server_name: "exchange-api-1", 
    server_time: "2025-08-18T12:00:00Z",
    server_start: "2025-08-18T08:00:00Z",
    server_hostname: "exchange-api-1.spiritex.live",
    server_memory: 256000000,
    total_memory: 1073741824,
    package_name: "spiritex-exchange",
    package_version: "0.5.0"
}
```

### ServicesInfo()
Gets schema information for all network services including available commands and data types.

**Usage:**
```javascript
const ServicesInfo = await Client.Diagnostic.ServicesInfo();
```

### ServerError()
Intentionally triggers a server error for testing error handling.

**Usage:**
```javascript
try {
    await Client.Diagnostic.ServerError();
} catch (error) {
    console.log('Test error triggered successfully');
}
```

## Member Service

### Session Management

#### NewSession(Strategy, Identifier, Secret)
Authenticates with the network and creates a new session.

**Usage:**
```javascript
// Email/password authentication
const Session = await Client.Member.NewSession(
    'password',
    'user@example.com', 
    'user-password'
);

// API key authentication
const Session = await Client.Member.NewSession(
    'apikey',
    'your-api-key',
    'your-pass-key'
);
```

**Returns:**
```javascript
{
    session_token: "jwt-token-string",
    User: {
        user_id: "user-123",
        user_name: "Alice Carolz",
        user_email: "user@example.com",
        created_at: "2025-08-18T10:00:00Z"
    },
    Session: {
        session_id: "session-456",
        user_id: "user-123",
        expires_at: "2025-08-19T12:00:00Z"
    }
}
```

#### GetMySession()
Retrieves information about the current session.

**Usage:**
```javascript
const MySession = await Client.Member.GetMySession();
```

#### NewNetworkToken()
Generates a fresh network token for the current session.

**Usage:**
```javascript
const TokenInfo = await Client.Member.NewNetworkToken();
```

### API Key Management

#### ListMyApiKeys()
Lists API keys owned by the current user.

**Usage:**
```javascript
const MyApiKeys = await Client.Member.ListMyApiKeys();
```

**Response Example:**
```javascript
[
    {
        apikey_id: "key-789",
        user_id: "user-123",
        apikey: "ak_1234567890abcdef",
        description: "Production API Key",
        created_at: "2025-08-15T10:00:00Z",
        expires_at: "2026-08-15T10:00:00Z",
        locked_at: null
    }
]
```

#### CreateMyApiKey(Description, ExpirationMS)
Creates a new API key for the current user.

**Usage:**
```javascript
const NewApiKey = await Client.Member.CreateMyApiKey(
    'Mobile App Key',
    86400000 * 365  // 1 year in milliseconds
);
```

**Security Note**: The pass key is only returned during creation and cannot be retrieved later.

#### DestroyMyApiKey(ApiKeyID)
Permanently deletes an API key.

**Usage:**
```javascript
const Success = await Client.Member.DestroyMyApiKey('key-789');
```

**Warning**: This action is irreversible and will invalidate all sessions using this key.

### User Management

#### ListUsers(SearchInfo, PageInfo)
Lists users on the network with optional filtering and pagination.

**Usage:**
```javascript
// List all users (admin only)
const AllUsers = await Client.Member.ListUsers();

// Search with filters
const SearchResults = await Client.Member.ListUsers({
    user_name: 'Alice'
}, {
    page: 1,
    limit: 10
});
```

#### GetUser(UserID)
Retrieves detailed information about a specific user.

**Usage:**
```javascript
const UserDetails = await Client.Member.GetUser('user-123');
```

## Exchange Service

### Agency Management

#### GetAgencies()
Retrieves all available agencies.

**Usage:**
```javascript
const Agencies = await Client.Exchange.GetAgencies();
```

**Response Example:**
```javascript
[
    {
        agency_id: "agency-001",
        agency_name: "Primary Exchange",
        agency_fee_rate: 0.001,  // 0.1% fee
        balance: 1500.50,
        created_at: "2025-08-01T00:00:00Z",
        metadata: {}
    }
]
```

#### TotalAgencyFeeRate()
Gets the combined fee rate across all agencies.

**Usage:**
```javascript
const TotalFeeRate = await Client.Exchange.TotalAgencyFeeRate();
// Returns: 0.0025 (0.25% total fees)
```

### Account Management

#### ListAccounts(SearchInfo, PageInfo)
Lists exchange accounts with optional filtering.

**Usage:**
```javascript
// List all accounts
const Accounts = await Client.Exchange.ListAccounts();

// Search by account name
const FilteredAccounts = await Client.Exchange.ListAccounts({
    account_name: 'Trading'
}, {
    page: 1,
    limit: 20
});
```

#### CreateAccount(UserID, AccountName)
Creates a new exchange account for a user.

**Usage:**
```javascript
const NewAccount = await Client.Exchange.CreateAccount(
    'user-123',
    'Primary Trading Account'
);
```

#### GetAccount(AccountID)
Retrieves detailed information about an account.

**Usage:**
```javascript
const AccountDetails = await Client.Exchange.GetAccount('acc-456');
```

#### IncrementAccountBalance(AccountID, AmountIncrement, AuditResourceID, AuditNote)
Adjusts an account balance with audit trail.

**Usage:**
```javascript
// Add funds
const Success = await Client.Exchange.IncrementAccountBalance(
    'acc-456',
    1000.00,
    'deposit-789',
    'Bank transfer deposit'
);

// Deduct funds (negative increment)
const Deduction = await Client.Exchange.IncrementAccountBalance(
    'acc-456',
    -50.00,
    'order-101',
    'Purchase order payment'
);
```

### Permission Management

#### SetPermission(UserID, AccountID, PermissionName)
Grants a permission to a user for an account.

**Usage:**
```javascript
const Permission = await Client.Exchange.SetPermission(
    'user-123',
    'acc-456',
    'trade'
);
```

#### HasPermission(UserID, AccountID, AllowablePermissions)
Checks if a user has specific permissions for an account.

**Usage:**
```javascript
const CanTrade = await Client.Exchange.HasPermission(
    'user-123',
    'acc-456',
    ['trade', 'view']
);
```

---

# Security Best Practices

## Credential Storage Security

### ❌ Never Do This
```javascript
// DON'T: Hardcode credentials in source code
const NetworkCredentials = {
    user_email: 'admin@company.com',
    password: 'admin123'
};

// DON'T: Store credentials in version control
const config = {
    apikey: 'ak_secret_key_here',
    passkey: 'pk_secret_pass_here'
};
```

### ✅ Secure Storage Methods

**Environment Variables (Recommended)**
```javascript
// Load from environment
const NetworkCredentials = {
    apikey: process.env.SPIRITEX_API_KEY,
    passkey: process.env.SPIRITEX_PASS_KEY
};

// Validate environment variables
if (!NetworkCredentials.apikey || !NetworkCredentials.passkey) {
    throw new Error('Missing required environment variables: SPIRITEX_API_KEY, SPIRITEX_PASS_KEY');
}
```

**Configuration Files (Development Only)**
```javascript
// config.json (add to .gitignore)
{
    "NetworkUrls": { ... },
    "Credentials": {
        "apikey": "ak_development_key",
        "passkey": "pk_development_pass"
    }
}
```

## Network Security

### HTTPS Requirements
```javascript
// Validate HTTPS URLs
function ValidateSecureUrls(NetworkUrls) {
    const InsecureUrls = Object.entries(NetworkUrls)
        .filter(([service, url]) => !url.startsWith('https://'))
        .map(([service, url]) => `${service}: ${url}`);
    
    if (InsecureUrls.length > 0 && process.env.NODE_ENV === 'production') {
        throw new Error(`Insecure URLs not allowed in production: ${InsecureUrls.join(', ')}`);
    }
}
```

### Request/Response Security
```javascript
const ClientOptions = {
    log_requests: process.env.NODE_ENV === 'development',  // Only log in dev
    log_responses: false,  // Never log responses (may contain sensitive data)
    trace_authentication: process.env.DEBUG_AUTH === 'true',
    Callbacks: {
        OnApiResult: async function(ApiResult) {
            // Log successful operations (without sensitive data)
            console.log(`API call completed: ${ApiResult.operation}`);
        },
        OnError: async function(Message) {
            // Log errors for monitoring
            console.error(`API Error: ${Message}`);
        }
    }
};
```

## Session Management Security

### Session Validation
```javascript
async function ValidateSession(Client) {
    try {
        const SessionInfo = await Client.Member.GetMySession();
        const Session = SessionInfo.Session;
        
        // Validate session is not locked
        if (Session.locked_at) {
            throw new Error('Session is locked');
        }
        
        // Validate session hasn't expired
        const ExpiresAt = new Date(Session.expires_at);
        if (ExpiresAt < new Date()) {
            throw new Error('Session has expired');
        }
        
        return true;
    }
    catch (error) {
        console.error('Session validation failed:', error.message);
        return false;
    }
}
```

### Secure Session Cleanup
```javascript
async function SecureLogout(Client) {
    try {
        // Get current session
        const SessionInfo = await Client.Member.GetMySession();
        const SessionId = SessionInfo.Session.session_id;
        
        // Close session on server
        await Client.Member.CloseSession(SessionId);
        
        // Clear local tokens/credentials
        delete process.env.SPIRITEX_SESSION_TOKEN;
        
        console.log('Logged out successfully');
    }
    catch (error) {
        console.error('Logout error:', error.message);
        // Always clear local data even if server call fails
        delete process.env.SPIRITEX_SESSION_TOKEN;
    }
}
```

## API Key Security

### Key Rotation Strategy
```javascript
async function RotateApiKeys(Client) {
    try {
        // 1. Create new API key
        const NewKey = await CreateProductionApiKey(Client, 'Rotated Production Key');
        
        // 2. Test new key
        const TestClient = NewServiceClient(NetworkUrls, {
            apikey: NewKey.apikey,
            passkey: NewKey.passkey
        });
        
        await TestClient.Diagnostic.ServerInfo(); // Test call
        console.log('New key validated successfully');
        
        // 3. Update production systems with new key
        await UpdateProductionCredentials(NewKey);
        
        // 4. Wait for deployment/propagation
        await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute
        
        // 5. Delete old key
        const OldKeys = await Client.Member.ListMyApiKeys();
        const OldKey = OldKeys.find(key => 
            key.description.includes('Production') && 
            key.apikey !== NewKey.apikey
        );
        
        if (OldKey) {
            await Client.Member.DestroyMyApiKey(OldKey.apikey_id);
            console.log('Old API key destroyed');
        }
        
        return NewKey;
    }
    catch (error) {
        console.error('Key rotation failed:', error.message);
        // Don't delete old key if rotation fails
        throw error;
    }
}
```

### Key Monitoring
```javascript
async function MonitorApiKeys(Client) {
    try {
        const ApiKeys = await Client.Member.ListMyApiKeys();
        const Now = new Date();
        
        for (const Key of ApiKeys) {
            const ExpiresAt = new Date(Key.expires_at);
            const DaysUntilExpiry = Math.floor((ExpiresAt - Now) / (1000 * 60 * 60 * 24));
            
            if (DaysUntilExpiry < 30) {
                console.warn(`🚨 API Key "${Key.description}" expires in ${DaysUntilExpiry} days`);
            }
            
            if (Key.locked_at) {
                console.error(`🔒 API Key "${Key.description}" is locked`);
            }
        }
    }
    catch (error) {
        console.error('API key monitoring failed:', error.message);
    }
}
```

---

# Error Handling Patterns

## Error Types

### TransportError - Network Issues
```javascript
try {
    const Result = await Client.Diagnostic.ServerInfo();
} catch (error) {
    if (error.name === 'TransportError') {
        console.error('Network error:', error.message);
        console.error('Status:', error.Response?.status);
    }
}
```

### ApiError - API-Level Failures
```javascript
try {
    const UserData = await Client.Member.GetUser('invalid-id');
} catch (error) {
    if (error.name === 'ApiError') {
        console.error('API Error:', error.message);
        console.error('Full response:', error.ApiResponse);
    }
}
```

## Comprehensive Error Handling

### Standard Pattern
```javascript
async function robustApiCall() {
    try {
        const result = await Client.SomeService.SomeCommand();
        return result;
    } catch (error) {
        // Log error details
        console.error('API Error Details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Handle specific error types
        switch (error.name) {
            case 'TransportError':
                // Network retry logic
                break;
            case 'ApiError':
                // API-specific handling
                break;
            default:
                // Generic error handling
                break;
        }
        
        throw error; // Re-throw if needed
    }
}
```

### Retry Logic Implementation
```javascript
async function resilientApiCall(apiFunction, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiFunction();
        } catch (error) {
            if (error.name === 'TransportError' && attempt < maxRetries) {
                console.log(`Retry ${attempt}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                continue;
            }
            throw error;
        }
    }
}
```

### Authentication Error Handling
```javascript
async function HandleAuthenticationErrors(Client) {
    try {
        const Result = await Client.Member.GetMySession();
        return Result;
    }
    catch (error) {
        if (error.name === 'TransportError') {
            console.error('Network error - check connection');
            throw new Error('Unable to connect to SpiritEx network');
        }
        
        // Check API error responses
        if (error.response) {
            const ErrorCode = error.response.error?.code;
            
            switch (ErrorCode) {
                case 'INVALID_CREDENTIALS':
                    throw new Error('Authentication failed - invalid credentials');
                case 'SESSION_EXPIRED':
                    throw new Error('Session expired');
                case 'ACCOUNT_LOCKED':
                    throw new Error('Account locked');
                case 'API_KEY_EXPIRED':
                    throw new Error('API key expired');
                case 'RATE_LIMITED':
                    throw new Error('Rate limited - please slow down requests');
                default:
                    throw error;
            }
        }
        
        throw error;
    }
}
```

---

# Advanced Usage & Configuration

## Client Configuration Options

### Complete Options Template
```javascript
const ClientOptions = {
    log_requests: true,                    // Log requests (dev only)
    log_responses: false,                  // Log responses (dev only)
    trace_authentication: false,           // Trace auth (secure after fix)
    throw_handled_errors: false,           // Callback error handling
    Callbacks: {
        OnApiResult: async function(result) {
            console.log('✅ API success');
        },
        OnError: async function(message) {
            console.error('❌ API error:', message);
        },
        OnAuthorizationUpdated: async function(token) {
            console.log('🔄 Token refreshed');
        }
    }
};

const Client = NewServiceClient(NetworkUrls, NetworkCredentials, ClientOptions);
```

### Environment-Specific Configuration
```javascript
// Development configuration
const DevClientOptions = {
    log_requests: true,
    trace_authentication: true,
    Callbacks: {
        OnError: async function(message) {
            console.error('Dev Error:', message);
        }
    }
};

// Production configuration
const ProdClientOptions = {
    log_requests: false,
    log_responses: false,
    trace_authentication: false,
    Callbacks: {
        OnError: async function(message) {
            await sendToMonitoringService(message);
        }
    }
};

const ClientOptions = process.env.NODE_ENV === 'production' ? ProdClientOptions : DevClientOptions;
```

## Performance Optimization

### Client Instance Reuse
```javascript
// ❌ Don't create new clients repeatedly
function badPattern() {
    const client = NewServiceClient(urls, creds);
    return client.Diagnostic.ServerInfo();
}

// ✅ Reuse single client instance
const globalClient = NewServiceClient(urls, creds);
function goodPattern() {
    return globalClient.Diagnostic.ServerInfo();
}
```

### Response Caching
```javascript
const cache = new Map();

async function cachedApiCall(cacheKey, apiFunction, ttl = 60000) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
    }
    
    const data = await apiFunction();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

// Usage
const serverInfo = await cachedApiCall('serverInfo', 
    () => Client.Diagnostic.ServerInfo()
);
```

## Complete Application Template

```javascript
'use strict';

const NewServiceClient = require('@spiritex/spiritex-client');
const Config = require('./~config.json');

async function main() {
    try {
        // Create client
        const Client = NewServiceClient(Config.NetworkUrls, Config.Credentials);
        
        // Test connection
        const serverInfo = await Client.Diagnostic.ServerInfo();
        console.log(`Connected to: ${serverInfo.network_name}`);
        
        // Get session info
        const session = await Client.Member.GetMySession();
        console.log(`Logged in as: ${session.User.user_name}`);
        
        // Your application logic here...
        
    } catch (error) {
        console.error('Application error:', error.message);
        process.exit(1);
    }
}

// Run application
if (require.main === module) {
    main();
}

module.exports = { main };
```

---

# Troubleshooting Guide

## Quick Diagnostics

### Connection Testing
```javascript
async function checkConnection() {
    try {
        const info = await Client.Diagnostic.ServerInfo();
        console.log('✅ Connected:', info.network_name);
        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        return false;
    }
}
```

### Configuration Validation
```javascript
function validateConfig(config) {
    const required = {
        NetworkUrls: ['Diagnostic', 'Member', 'Exchange'],
        Credentials: ['user_email', 'password'] // or ['apikey', 'passkey']
    };
    
    for (const [section, fields] of Object.entries(required)) {
        if (!config[section]) {
            throw new Error(`Missing ${section} in config`);
        }
        
        const hasAllFields = fields.every(field => config[section][field]);
        if (!hasAllFields) {
            console.warn(`Some ${section} fields missing:`, fields);
        }
    }
}
```

## Common Issues & Solutions

### Authentication Problems

**Problem**: Authentication fails
**Solution**: Check credentials and network URLs
```javascript
const Config = require('./~config.json');
if (!Config.Credentials.user_email || !Config.NetworkUrls.Member) {
    console.error('Check your ~config.json file');
}
```

### Network Errors

**Problem**: Network timeouts
**Solution**: Implement retry logic
```javascript
try {
    const result = await Client.Diagnostic.ServerInfo();
} catch (error) {
    if (error.name === 'TransportError') {
        // Retry logic here
    }
}
```

### CORS Issues (Browser)

**Problem**: CORS errors in browser
**Solution**: Configure server CORS headers
```javascript
// Server must allow: 'Content-Type', 'Authorization'
```

### Configuration File Issues

**Problem**: Configuration file not found
**Solution**: Verify file location and permissions
```bash
# Check if file exists
ls -la ~config.json

# Check file permissions
ls -la ~config.json
```

## Browser-Specific Issues

### CORS Configuration
```javascript
// Express.js server example
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});
```

### Browser Compatibility
```html
<!-- For older browsers -->
<script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/es6-promise@4.2.8/dist/es6-promise.auto.min.js"></script>
```

---

# Migration & Upgrade Guide

## Version 0.5.0 (Current)

### Key Features
- Dual Node.js/browser support
- Three core services: Diagnostic, Member, Exchange
- Automatic session management
- Promise-based API calls
- Comprehensive error handling

### System Requirements
- **Node.js**: v20 or higher
- **Browser**: Modern browsers with fetch API support
- **Network**: HTTPS required for production
- **Dependencies**: No external dependencies required

## Migration Scenarios

### From Direct API Calls

**Before (Direct HTTP):**
```javascript
const response = await fetch('https://api.spiritex.live/Member/GetMySession', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token'
    }
});
const data = await response.json();
```

**After (SDK):**
```javascript
const NewServiceClient = require('@spiritex/spiritex-client');
const Client = NewServiceClient(NetworkUrls, NetworkCredentials);

const sessionInfo = await Client.Member.GetMySession();
// Direct access to data, automatic error handling, session management
```

### Upgrade Checklist

#### Pre-Upgrade Assessment
- [ ] Document current API calls and patterns
- [ ] Check for conflicts with other packages
- [ ] Backup configuration files
- [ ] Set up test environment

#### SDK Upgrade Steps
1. **Update SDK File**
   - [ ] Replace `SpiritEx-Http-Client.js` with version 0.5.0
   - [ ] Verify file integrity and version number

2. **Review Configuration**
   - [ ] Update configuration file structure if needed
   - [ ] Validate NetworkUrls format
   - [ ] Ensure credentials are properly formatted

3. **Update Code Patterns**
   - [ ] Review error handling patterns
   - [ ] Update authentication tracing usage
   - [ ] Verify response access patterns

4. **Security Review**
   - [ ] Disable unsafe authentication tracing if used
   - [ ] Review credential management practices
   - [ ] Validate HTTPS usage in production

### Validation Script
```javascript
async function validateUpgrade() {
    console.log('🧪 Starting SDK upgrade validation...');
    
    try {
        // Test 1: Basic connectivity
        const serverInfo = await Client.Diagnostic.ServerInfo();
        console.log('✅ Connected:', serverInfo.network_name);
        
        // Test 2: Authentication
        const session = await Client.Member.GetMySession();
        console.log('✅ Authenticated:', session.User.user_name);
        
        // Test 3: Error handling
        try {
            await Client.Diagnostic.ServerError();
        } catch (error) {
            console.log('✅ Error handling works:', error.name);
        }
        
        // Test 4: Service operations
        const agencies = await Client.Exchange.GetAgencies();
        console.log('✅ Exchange operations work:', agencies.length, 'agencies');
        
        console.log('🎉 All validation tests passed!');
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        throw error;
    }
}
```

---

# Quick Reference

## Essential Commands

### Health Check
```javascript
// Test connectivity
const serverInfo = await Client.Diagnostic.ServerInfo();
console.log(`Connected to: ${serverInfo.network_name}`);
```

### Session Management
```javascript
// Get current session
const session = await Client.Member.GetMySession();
console.log(`User: ${session.User.user_name}`);

// Create new session
const newSession = await Client.Member.NewSession('email', 'user@example.com', 'password');
```

### Exchange Operations
```javascript
// List agencies
const agencies = await Client.Exchange.GetAgencies();
agencies.forEach(agency => {
    console.log(`${agency.agency_name}: ${agency.agency_fee_rate * 100}% fee`);
});

// List accounts
const accounts = await Client.Exchange.ListAccounts();
console.log(`You have ${accounts.length} exchange accounts`);
```

## Service Command Reference

### 🩺 Diagnostic Commands
| Command | Purpose | Example |
|---------|---------|---------|
| `ServerInfo()` | Get server status | `const info = await Client.Diagnostic.ServerInfo();` |
| `ServicesInfo()` | List available services | `const services = await Client.Diagnostic.ServicesInfo();` |
| `ServerError()` | Test error handling | `await Client.Diagnostic.ServerError();` |

### 👤 Member Commands

**Session Operations:**
| Command | Purpose | Example |
|---------|---------|---------|
| `NewSession(strategy, id, secret)` | Authenticate | `await Client.Member.NewSession('email', 'user@example.com', 'pass');` |
| `GetMySession()` | Get current session | `const session = await Client.Member.GetMySession();` |
| `NewNetworkToken()` | Refresh token | `const newToken = await Client.Member.NewNetworkToken();` |

**API Key Management:**
| Command | Purpose | Example |
|---------|---------|---------|
| `ListMyApiKeys()` | List your API keys | `const keys = await Client.Member.ListMyApiKeys();` |
| `CreateMyApiKey(desc, expiry)` | Create API key | `const key = await Client.Member.CreateMyApiKey('My App', 86400000);` |
| `DestroyMyApiKey(keyId)` | Delete API key | `await Client.Member.DestroyMyApiKey('key-123');` |

### 💰 Exchange Commands

**Agency Operations:**
| Command | Purpose | Example |
|---------|---------|---------|
| `GetAgencies()` | List all agencies | `const agencies = await Client.Exchange.GetAgencies();` |
| `TotalAgencyFeeRate()` | Get total fees | `const feeRate = await Client.Exchange.TotalAgencyFeeRate();` |

**Account Operations:**
| Command | Purpose | Example |
|---------|---------|---------|
| `ListAccounts()` | List accounts | `const accounts = await Client.Exchange.ListAccounts();` |
| `CreateAccount(userId, name)` | Create account | `const account = await Client.Exchange.CreateAccount('user-123', 'Trading');` |
| `GetAccount(accountId)` | Get account details | `const account = await Client.Exchange.GetAccount('acc-456');` |
| `IncrementAccountBalance(id, amount, resource, note)` | Adjust balance | `await Client.Exchange.IncrementAccountBalance('acc-456', 1000, 'deposit', 'Funding');` |

---

# Data Types Reference

## DiagnosticServerInfo
| Field | Type | Description |
|-------|------|-------------|
| network_name | string | Name of the network |
| network_time | string | Current network time (ISO 8601) |
| server_name | string | Server identifier |
| server_time | string | Current server time (ISO 8601) |
| server_start | string | Server startup time (ISO 8601) |
| server_hostname | string | Server hostname |
| server_memory | number | Current memory usage (bytes) |
| total_memory | number | Total available memory (bytes) |
| package_name | string | Server package name |
| package_version | string | Server version |

## MemberUser
| Field | Type | Description |
|-------|------|-------------|
| user_id | string | Unique user identifier |
| user_name | string | Display name |
| user_email | string | Email address |
| groups | string | Group memberships |
| created_at | string | Account creation time (ISO 8601) |
| updated_at | string | Last update time (ISO 8601) |
| locked_at | string | Lock time if account is locked |
| metadata | object | Additional user data |

## MemberSession
| Field | Type | Description |
|-------|------|-------------|
| session_id | string | Unique session identifier |
| user_id | string | Associated user ID |
| created_at | string | Session creation time (ISO 8601) |
| expires_at | string | Session expiration time (ISO 8601) |
| abandon_at | string | Automatic abandonment time (ISO 8601) |
| closed_at | string | Session close time if closed |
| locked_at | string | Lock time if session is locked |
| ip_address | string | Client IP address |
| metadata | object | Additional session data |

## MemberApiKey
| Field | Type | Description |
|-------|------|-------------|
| apikey_id | string | Unique API key identifier |
| user_id | string | Owner user ID |
| apikey | string | The API key (public part) |
| description | string | Human-readable description |
| created_at | string | Creation time (ISO 8601) |
| expires_at | string | Expiration time (ISO 8601) |
| locked_at | string | Lock time if key is locked |
| closed_at | string | Close time if key is closed |

## ExchangeAccount
| Field | Type | Description |
|-------|------|-------------|
| account_id | string | Unique account identifier |
| user_id | string | Owner user ID |
| account_name | string | Display name |
| balance | number | Current account balance |
| leverage | number | Leverage multiplier |
| created_at | string | Creation time (ISO 8601) |
| updated_at | string | Last update time (ISO 8601) |
| locked_at | string | Lock time if account is locked |
| closed_at | string | Close time if account is closed |
| metadata | object | Additional account data |

## ExchangeAgency
| Field | Type | Description |
|-------|------|-------------|
| agency_id | string | Unique agency identifier |
| agency_name | string | Display name |
| agency_fee_rate | number | Fee rate (decimal, e.g., 0.001 = 0.1%) |
| balance | number | Agency balance |
| created_at | string | Creation time (ISO 8601) |
| updated_at | string | Last update time (ISO 8601) |
| metadata | object | Additional agency data |

---

## Frequently Asked Questions

### Q: Can I use the SDK in both Node.js and browser?
**A:** Yes! The SDK is designed to work in both environments. Use `require()` in Node.js and include the script tag in browsers.

### Q: Which authentication method should I use?
**A:** Use email/password for development and user-facing applications. Use API key/pass key for production and server-to-server integrations.

### Q: How do I handle rate limiting?
**A:** The SDK doesn't implement rate limiting by default. Implement your own using delays between requests:
```javascript
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
```

### Q: Can I use the SDK with TypeScript?
**A:** The SDK is written in JavaScript. You can use it in TypeScript projects, but you'll need to create your own type definitions or use `any` types.

### Q: What Node.js versions are supported?
**A:** Node.js v20 or higher is required, as specified in the project guidelines.

### Q: How do I debug authentication issues?
**A:** Enable authentication tracing (safe after security fix):
```javascript
const ClientOptions = {
    trace_authentication: true
};
```

### Q: Can I use the SDK behind a corporate firewall?
**A:** Yes, but ensure your firewall allows HTTPS connections to the SpiritEx API endpoints. You may need to configure proxy settings.

---

## Resources & Support

### External Resources
- **Main Website**: [https://spiritex.live](https://spiritex.live)
- **Developer Portal**: Create API keys and manage accounts
- **Network Status**: Check service availability

### Development Tools
- **Node.js v20+**: Required runtime
- **Testing Framework**: Mocha (included in samples)
- **Code Style**: ESLint configuration available

### Success Indicators

Your implementation is successful when:
- ✅ All API calls work without modification to business logic
- ✅ Error handling catches all scenarios appropriately
- ✅ Performance is optimal with proper client reuse
- ✅ Security practices follow documented best practices
- ✅ All tests pass in development and production environments

---

*Ready to get started? Begin with the installation section and follow the getting started examples. For working code, see the sample projects included with the SDK.*