-- Provisions the application database and a dedicated, least-privilege SQL
-- login for the backend to use instead of `sa`. Run once by docker/database/init.sh
-- (as `sa`, the only principal with the server-level rights this needs)
-- against a fresh or already-provisioned instance; every step is idempotent
-- so re-running it is safe.
--
-- Expects sqlcmd scripting variables, passed via `-v` by init.sh:
--   APP_DB_NAME      Database the application uses.
--   APP_DB_USER      Login/user name for the application.
--   APP_DB_PASSWORD  Password for that login.
--
-- Values are interpolated as plain text into DDL statements (sqlcmd has no
-- parameterized-query mechanism for CREATE LOGIN/USER), so APP_DB_NAME,
-- APP_DB_USER and APP_DB_PASSWORD must not contain a single quote (').

SET NOCOUNT ON;

IF DB_ID(N'$(APP_DB_NAME)') IS NULL
BEGIN
    PRINT 'Creating database [$(APP_DB_NAME)]...';
    EXEC('CREATE DATABASE [$(APP_DB_NAME)]');
END
ELSE
BEGIN
    PRINT 'Database [$(APP_DB_NAME)] already exists.';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'$(APP_DB_USER)')
BEGIN
    PRINT 'Creating login [$(APP_DB_USER)]...';
    CREATE LOGIN [$(APP_DB_USER)] WITH PASSWORD = N'$(APP_DB_PASSWORD)', CHECK_POLICY = ON;
END
ELSE
BEGIN
    PRINT 'Login [$(APP_DB_USER)] already exists; syncing its password.';
    ALTER LOGIN [$(APP_DB_USER)] WITH PASSWORD = N'$(APP_DB_PASSWORD)';
END
GO

USE [$(APP_DB_NAME)];
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'$(APP_DB_USER)')
BEGIN
    PRINT 'Creating database user [$(APP_DB_USER)] in [$(APP_DB_NAME)]...';
    CREATE USER [$(APP_DB_USER)] FOR LOGIN [$(APP_DB_USER)];
END
ELSE
BEGIN
    PRINT 'Database user [$(APP_DB_USER)] already exists in [$(APP_DB_NAME)].';
END
GO

-- db_owner, scoped to this single database only (never sysadmin/server-wide):
-- the app needs DDL rights here because EF Core applies migrations on startup.
IF NOT EXISTS (
    SELECT 1
    FROM sys.database_role_members rm
    JOIN sys.database_principals r ON r.principal_id = rm.role_principal_id
    JOIN sys.database_principals m ON m.principal_id = rm.member_principal_id
    WHERE r.name = N'db_owner' AND m.name = N'$(APP_DB_USER)'
)
BEGIN
    PRINT 'Granting db_owner on [$(APP_DB_NAME)] to [$(APP_DB_USER)]...';
    ALTER ROLE db_owner ADD MEMBER [$(APP_DB_USER)];
END
GO

PRINT 'Done.';
