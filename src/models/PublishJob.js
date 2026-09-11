import { DataTypes, Model } from 'sequelize';

export class PublishJob extends Model {}

export const initPublishJobModel = (sequelize) => {
  PublishJob.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      laminaId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'lamina_id',
      },
      clientId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'client_id',
      },
      network: {
        type: DataTypes.ENUM('facebook', 'instagram', 'x'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'success', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      requestPayload: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        field: 'request_payload',
      },
      responsePayload: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'response_payload',
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'error_message',
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'published_at',
      },
    },
    {
      sequelize,
      modelName: 'PublishJob',
      tableName: 'publish_jobs',
      underscored: true,
    },
  );
};
