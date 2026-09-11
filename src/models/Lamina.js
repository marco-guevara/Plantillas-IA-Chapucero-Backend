import { DataTypes, Model } from 'sequelize';

export class Lamina extends Model {}

export const initLaminaModel = (sequelize) => {
  Lamina.init(
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
      legacyId: {
        type: DataTypes.STRING(120),
        allowNull: true,
        field: 'legacy_id',
      },
      category: {
        type: DataTypes.ENUM('lps', 'lpm', 'lm', 'li'),
        allowNull: false,
      },
      originalUser: {
        type: DataTypes.STRING(160),
        allowNull: true,
        field: 'original_user',
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'draft',
          'saved',
          'generated',
          'published',
          'archived',
        ),
        allowNull: false,
        defaultValue: 'draft',
      },
      url916: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'url_916',
      },
      url340: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'url_340',
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: 'Lamina',
      tableName: 'laminas',
      underscored: true,
    },
  );
};
