import { DataTypes, Model } from 'sequelize';

export class LaminaAsset extends Model {}

export const initLaminaAssetModel = (sequelize) => {
  LaminaAsset.init(
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
      type: {
        type: DataTypes.ENUM(
          'principal',
          'imagen1',
          'circulo1',
          'circulo2',
          'generated916',
          'generated340',
          'other',
        ),
        allowNull: false,
        defaultValue: 'other',
      },
      sourceUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'source_url',
      },
      uploadedUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'uploaded_url',
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: 'LaminaAsset',
      tableName: 'lamina_assets',
      underscored: true,
    },
  );
};
