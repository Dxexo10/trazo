BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(160) NOT NULL,
    [email] NVARCHAR(320) NOT NULL,
    [role] NVARCHAR(20) NOT NULL,
    [avatarUrl] NVARCHAR(500),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[projects] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [code] NVARCHAR(20) NOT NULL,
    [name] NVARCHAR(120) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [sector] NVARCHAR(20) NOT NULL,
    [client] NVARCHAR(100) NOT NULL,
    [ownerId] UNIQUEIDENTIFIER NOT NULL,
    [status] NVARCHAR(20) NOT NULL,
    [priority] NVARCHAR(20) NOT NULL,
    [initialBudgetCents] INT NOT NULL,
    [currentBudgetCents] INT NOT NULL,
    [currency] NVARCHAR(3) NOT NULL CONSTRAINT [projects_currency_df] DEFAULT 'PEN',
    [progress] INT NOT NULL,
    [startDate] DATETIME2 NOT NULL,
    [dueDate] DATETIME2 NOT NULL,
    [completedAt] DATETIME2,
    [tags] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [projects_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archivedAt] DATETIME2,
    CONSTRAINT [projects_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [projects_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[project_versions] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [projectId] UNIQUEIDENTIFIER NOT NULL,
    [versionNumber] INT NOT NULL,
    [snapshot] NVARCHAR(max) NOT NULL,
    [changedAt] DATETIME2 NOT NULL CONSTRAINT [project_versions_changedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [changedBy] UNIQUEIDENTIFIER NOT NULL,
    [source] NVARCHAR(20) NOT NULL,
    [reason] NVARCHAR(500),
    CONSTRAINT [project_versions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [project_versions_projectId_versionNumber_key] UNIQUE NONCLUSTERED ([projectId],[versionNumber])
);

-- CreateTable
CREATE TABLE [dbo].[change_events] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [versionId] UNIQUEIDENTIFIER NOT NULL,
    [projectId] UNIQUEIDENTIFIER NOT NULL,
    [field] NVARCHAR(20) NOT NULL,
    [oldValue] NVARCHAR(max) NOT NULL,
    [newValue] NVARCHAR(max) NOT NULL,
    [changeType] NVARCHAR(20) NOT NULL,
    CONSTRAINT [change_events_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[alerts] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [projectId] UNIQUEIDENTIFIER NOT NULL,
    [versionId] UNIQUEIDENTIFIER,
    [ruleId] NVARCHAR(60) NOT NULL,
    [severity] NVARCHAR(20) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [alerts_status_df] DEFAULT 'open',
    [title] NVARCHAR(200) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [alerts_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [reviewedAt] DATETIME2,
    [resolvedAt] DATETIME2,
    CONSTRAINT [alerts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [alerts_projectId_versionId_ruleId_key] UNIQUE NONCLUSTERED ([projectId],[versionId],[ruleId])
);

-- CreateTable
CREATE TABLE [dbo].[activity_logs] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [projectId] UNIQUEIDENTIFIER,
    [actorId] UNIQUEIDENTIFIER,
    [action] NVARCHAR(60) NOT NULL,
    [source] NVARCHAR(20) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [activity_logs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [metadata] NVARCHAR(max) NOT NULL,
    CONSTRAINT [activity_logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[rule_configs] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [ruleKey] NVARCHAR(60) NOT NULL,
    [enabled] BIT NOT NULL CONSTRAINT [rule_configs_enabled_df] DEFAULT 1,
    [threshold] INT,
    [severity] NVARCHAR(20) NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [rule_configs_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [rule_configs_ruleKey_key] UNIQUE NONCLUSTERED ([ruleKey])
);

-- CreateTable
CREATE TABLE [dbo].[demo_scenarios] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(120) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [changes] NVARCHAR(max) NOT NULL,
    [seedVersion] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [demo_scenarios_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [demo_scenarios_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [projects_status_idx] ON [dbo].[projects]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [projects_priority_idx] ON [dbo].[projects]([priority]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [projects_sector_idx] ON [dbo].[projects]([sector]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [projects_ownerId_idx] ON [dbo].[projects]([ownerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [projects_archivedAt_idx] ON [dbo].[projects]([archivedAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [projects_dueDate_idx] ON [dbo].[projects]([dueDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_versions_projectId_changedAt_idx] ON [dbo].[project_versions]([projectId], [changedAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [change_events_projectId_idx] ON [dbo].[change_events]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [change_events_versionId_idx] ON [dbo].[change_events]([versionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [alerts_status_idx] ON [dbo].[alerts]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [alerts_severity_idx] ON [dbo].[alerts]([severity]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [alerts_projectId_createdAt_idx] ON [dbo].[alerts]([projectId], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [activity_logs_createdAt_idx] ON [dbo].[activity_logs]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [activity_logs_projectId_createdAt_idx] ON [dbo].[activity_logs]([projectId], [createdAt]);

-- AddForeignKey
ALTER TABLE [dbo].[projects] ADD CONSTRAINT [projects_ownerId_fkey] FOREIGN KEY ([ownerId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[project_versions] ADD CONSTRAINT [project_versions_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[project_versions] ADD CONSTRAINT [project_versions_changedBy_fkey] FOREIGN KEY ([changedBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[change_events] ADD CONSTRAINT [change_events_versionId_fkey] FOREIGN KEY ([versionId]) REFERENCES [dbo].[project_versions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[change_events] ADD CONSTRAINT [change_events_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[alerts] ADD CONSTRAINT [alerts_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[alerts] ADD CONSTRAINT [alerts_versionId_fkey] FOREIGN KEY ([versionId]) REFERENCES [dbo].[project_versions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[activity_logs] ADD CONSTRAINT [activity_logs_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[activity_logs] ADD CONSTRAINT [activity_logs_actorId_fkey] FOREIGN KEY ([actorId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

