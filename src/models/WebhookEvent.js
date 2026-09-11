import { DataTypes, Model } from 'sequelize';

export class WebhookEvent extends Model {}

export const initWebhookEventModel = (sequelize) => {
  WebhookEvent.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      clientId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'client_id',
      },
      laminaId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'lamina_id',
      },
      webhookName: {
        type: DataTypes.STRING(120),
        allowNull: false,
        field: 'webhook_name',
      },
      endpoint: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('success', 'error'),
        allowNull: false,
      },
      statusCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'status_code',
      },
      durationMs: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'duration_ms',
      },
      requestPayload: {
        type: DataTypes.JSONB,
        allowNull: true,
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
    },
    {
      sequelize,
      modelName: 'WebhookEvent',
      tableName: 'webhook_events',
      underscored: true,
    },
  );
};
