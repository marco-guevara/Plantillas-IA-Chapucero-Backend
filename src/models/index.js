import { sequelize } from '../config/database.js';
import { Client, initClientModel } from './Client.js';
import { ClientSession, initClientSessionModel } from './ClientSession.js';
import { Lamina, initLaminaModel } from './Lamina.js';
import { LaminaAsset, initLaminaAssetModel } from './LaminaAsset.js';
import { PublishJob, initPublishJobModel } from './PublishJob.js';
import { WebhookEvent, initWebhookEventModel } from './WebhookEvent.js';

initClientModel(sequelize);
initClientSessionModel(sequelize);
initLaminaModel(sequelize);
initLaminaAssetModel(sequelize);
initPublishJobModel(sequelize);
initWebhookEventModel(sequelize);

Client.hasMany(ClientSession, {
  foreignKey: 'clientId',
  as: 'sessions',
});

ClientSession.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
});

Client.hasMany(Lamina, {
  foreignKey: 'clientId',
  as: 'laminas',
});

Lamina.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
});

Client.hasMany(LaminaAsset, {
  foreignKey: 'clientId',
  as: 'assets',
});

Lamina.hasMany(LaminaAsset, {
  foreignKey: 'laminaId',
  as: 'assets',
});

LaminaAsset.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
});

LaminaAsset.belongsTo(Lamina, {
  foreignKey: 'laminaId',
  as: 'lamina',
});

Client.hasMany(PublishJob, {
  foreignKey: 'clientId',
  as: 'publishJobs',
});

Lamina.hasMany(PublishJob, {
  foreignKey: 'laminaId',
  as: 'publishJobs',
});

PublishJob.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
});

PublishJob.belongsTo(Lamina, {
  foreignKey: 'laminaId',
  as: 'lamina',
});

Client.hasMany(WebhookEvent, {
  foreignKey: 'clientId',
  as: 'webhookEvents',
});

Lamina.hasMany(WebhookEvent, {
  foreignKey: 'laminaId',
  as: 'webhookEvents',
});

WebhookEvent.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
});

WebhookEvent.belongsTo(Lamina, {
  foreignKey: 'laminaId',
  as: 'lamina',
});

export {
  Client,
  ClientSession,
  Lamina,
  LaminaAsset,
  PublishJob,
  WebhookEvent,
  sequelize,
};
