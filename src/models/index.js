import { sequelize } from '../config/database.js';
import { Client, initClientModel } from './Client.js';
import { ClientSession, initClientSessionModel } from './ClientSession.js';

initClientModel(sequelize);
initClientSessionModel(sequelize);

Client.hasMany(ClientSession, {
  foreignKey: 'clientId',
  as: 'sessions',
});

ClientSession.belongsTo(Client, {
  foreignKey: 'clientId',
  as: 'client',
});

export { Client, ClientSession, sequelize };
