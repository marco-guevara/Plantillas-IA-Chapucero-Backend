import { DataTypes, Model } from 'sequelize';

export class Client extends Model {}

export const initClientModel = (sequelize) => {
  Client.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'editor', 'viewer'),
        allowNull: false,
        defaultValue: 'editor',
      },
      status: {
        type: DataTypes.ENUM('active', 'disabled'),
        allowNull: false,
        defaultValue: 'active',
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login_at',
      },
    },
    {
      sequelize,
      modelName: 'Client',
      tableName: 'clients',
      underscored: true,
    },
  );
};
