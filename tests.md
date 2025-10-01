# @spiritex/spiritex-core

> Version: 0.5.0

## Test Results

```


  100) Service Tests over InProcess Transport
    Test Environment Initialization
      ✔ should initialize clients
      ✔ should initialize sessions
    Diagnostic Service
      Server Info
        ✔ should get server info
    Member Service
      Auth Commands
        ✔ should get this session
        ✔ should get a new network token
        ✔ should restrict access on user type
      User Commands
        ✔ should list users
        ✔ should get this user
        ✔ should rename this user
        ✔ should set groups for this user
        ✔ should set metadata for this user
      Session Commands
        ✔ should list sessions
        ✔ should get this session
        ✔ should set metadata for this session
        ✔ should lock all other sessions
        ✔ should unlock all other sessions
        ✔ should close all other sessions
        ✔ should reap sessions
      ApiKey Commands
        ✔ should create an apikey
        ✔ should list apikeys
        ✔ should get an apikey
        ✔ should lock an apikey
        ✔ should unlock an apikey
      My Member Commands
        ✔ should get my session
        ✔ should create an apikey
        ✔ should list apikeys
        ✔ should get an apikey
        ✔ should lock an apikey
        ✔ should unlock an apikey
        ✔ should authenticate with an apikey
        ✔ should not allow a locked apikey to authenticate
        ✔ should not allow an expired apikey to authenticate

  200) Service Tests over Http Transport
    Test Environment Initialization
      ✔ should initialize clients
      ✔ should initialize sessions
    Diagnostic Service
      Server Info
        ✔ should get server info
    Member Service
      Auth Commands
        ✔ should get this session
        ✔ should get a new network token
        ✔ should restrict access on user type
      User Commands
        ✔ should list users
        ✔ should get this user
        ✔ should rename this user
        ✔ should set groups for this user
        ✔ should set metadata for this user
      Session Commands
        ✔ should list sessions
        ✔ should get this session
        ✔ should set metadata for this session
        ✔ should lock all other sessions
        ✔ should unlock all other sessions
        ✔ should close all other sessions
        ✔ should reap sessions
      ApiKey Commands
        ✔ should create an apikey
        ✔ should list apikeys
        ✔ should get an apikey
        ✔ should lock an apikey
        ✔ should unlock an apikey
      My Member Commands
        ✔ should get my session
        ✔ should create an apikey
        ✔ should list apikeys
        ✔ should get an apikey
        ✔ should lock an apikey
        ✔ should unlock an apikey
        ✔ should authenticate with an apikey
        ✔ should not allow a locked apikey to authenticate
        ✔ should not allow an expired apikey to authenticate

  200) SqlManager Unit Tests
    sqlite3 (in-memory)
      ✔ Should create a SqlManager.
      ✔ Should register a database.
      ✔ Should startup the SqlManager.
      ✔ Should perform basic operations.
      ✔ Should commit a transaction.
      ✔ Should rollback a failed transaction.
WARN: Skipping test because sqlite in-memory database does not support mixed transactions.
      ✔ Should mix transactional and non-transactional operations within the same transaction.
      ✔ Should shutdown the SqlManager.
    sqlite3 (local file)
      ✔ Should create a SqlManager.
      ✔ Should register a database.
      ✔ Should startup the SqlManager.
      ✔ Should perform basic operations.
      ✔ Should commit a transaction.
      ✔ Should rollback a failed transaction.
      ✔ Should mix transactional and non-transactional operations within the same transaction.
      ✔ Should shutdown the SqlManager.
    mysql
      ✔ Should create a SqlManager.
      ✔ Should register a database.
      ✔ Should startup the SqlManager.
      ✔ Should perform basic operations.
      ✔ Should commit a transaction.
      ✔ Should rollback a failed transaction.
      ✔ Should mix transactional and non-transactional operations within the same transaction.
      ✔ Should shutdown the SqlManager.

  300) Generator Unit Tests
    Clear
      ✔ should clear the buffer and reset indent
    GetBuffer
      ✔ should return empty string initially
      ✔ should return buffer contents
    Indent
      ✔ should increment indent level
      ✔ should increment multiple times
    Unindent
      ✔ should decrement indent level
      ✔ should handle zero indent level
    IndentThis
      ✔ should temporarily increase indent during callback
      ✔ should execute callback and restore indent even if callback throws
    NewLine
      ✔ should add newline to buffer
      ✔ should add multiple newlines
    WriteNew
      ✔ should write text with no indentation
      ✔ should write text with proper indentation
      ✔ should handle empty text
    WriteAppend
      ✔ should append text without indentation
      ✔ should append to empty buffer
    WriteLine
      ✔ should write text with newline
      ✔ should write with proper indentation and newline
    SaveToFile
      ✔ should save buffer content to file
      ✔ should save empty buffer to file
      ✔ should overwrite existing file
    Integration Tests
      ✔ should generate properly formatted code
      ✔ should handle complex indentation patterns

  900) TestServer Unit Tests
    Diagnostic Service Tests
      ✔ should get server info
      ✔ should generate an error
    Echo Service Tests
      ✔ should echo text
      ✔ should reverse text
    Calc Service Tests
      ✔ should calc sum
      ✔ should calc difference
      ✔ should calc product
      ✔ should calc quotient
      ✔ should calc array sum
      ✔ should calc array average


  121 passing (9s)

```
