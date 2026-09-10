import { DataTypes, Model } from 'sequelize';

export class ClientSession extends Model {}

export const initClientSessionModel = (sequelize) => {
  ClientSession.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      clientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'client_id',
      },
      refreshTokenHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'refresh_token_hash',
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'user_agent',
      },
      ipAddress: {
        type: DataTypes.STRING(80),
        allowNull: true,
        field: 'ip_address',
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'revoked_at',
      },
    },
    {
      sequelize,
      modelName: 'ClientSession',
      tableName: 'client_sessions',
      underscored: true,
    },
  );
};
