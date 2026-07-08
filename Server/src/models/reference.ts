import { DataTypes, Model, type Sequelize } from 'sequelize';

export class PaymentMethod extends Model {
  declare id: string;
  declare code: string;
  declare name: string;
}

export class DeliveryProvider extends Model {
  declare id: string;
  declare code: string;
}

export class DeliveryRate extends Model {
  declare id: string;
  declare provider_id: string;
  declare delivery_type: string;
  declare city_scope: string;
  declare base_price: string;
  declare fee_percent: string;
  declare requires_prepay: boolean;
}

export class SiteSetting extends Model {
  declare key: string;
  declare value: Record<string, unknown>;
}

export class Accessory extends Model {
  declare id: string;
  declare name: string;
}

export function initReferenceModels(sequelize: Sequelize) {
  PaymentMethod.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      fee_percent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      fee_fixed: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'payment_methods' },
  );

  DeliveryProvider.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'delivery_providers' },
  );

  DeliveryRate.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      provider_id: { type: DataTypes.UUID, allowNull: false },
      delivery_type: { type: DataTypes.STRING(50), allowNull: false },
      city_scope: { type: DataTypes.STRING(100), allowNull: false },
      base_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      requires_prepay: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      fee_percent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    },
    { sequelize, tableName: 'delivery_rates' },
  );

  SiteSetting.init(
    {
      key: { type: DataTypes.STRING(100), primaryKey: true },
      value: { type: DataTypes.JSONB, allowNull: false },
    },
    { sequelize, tableName: 'site_settings', timestamps: true },
  );

  Accessory.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      category: { type: DataTypes.STRING(20), allowNull: false },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      image: { type: DataTypes.STRING(500), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'accessories' },
  );

  DeliveryProvider.hasMany(DeliveryRate, { foreignKey: 'provider_id', as: 'rates' });
  DeliveryRate.belongsTo(DeliveryProvider, { foreignKey: 'provider_id', as: 'provider' });
}
