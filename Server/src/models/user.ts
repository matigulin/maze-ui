import { DataTypes, Model, type Sequelize } from 'sequelize';
import { Product } from './catalog.js';

export class User extends Model {
  declare id: string;
  declare phone: string;
}

export class SmsVerification extends Model {
  declare id: string;
  declare phone: string;
  declare code_hash: string;
  declare expires_at: Date;
  declare attempts: number;
  declare verified_at: Date | null;
}

export class UserAddress extends Model {
  declare id: string;
  declare user_id: string;
}

export class UserConsent extends Model {
  declare id: string;
  declare user_id: string;
}

export class UserCompany extends Model {
  declare id: string;
  declare user_id: string;
}

export class StaffUser extends Model {
  declare id: string;
  declare email: string;
  declare role: string;
  declare password_hash: string;
  declare is_active: boolean;
}

export class Favorite extends Model {
  declare user_id: string;
  declare product_id: string;
}

export function initUserModels(sequelize: Sequelize) {
  User.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      phone: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      first_name: { type: DataTypes.STRING(100), allowNull: true },
      last_name: { type: DataTypes.STRING(100), allowNull: true },
      middle_name: { type: DataTypes.STRING(100), allowNull: true },
      gender: { type: DataTypes.STRING(10), allowNull: true },
      email: { type: DataTypes.STRING(255), allowNull: true },
      birth_date: { type: DataTypes.DATEONLY, allowNull: true },
      subscribe_email: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      subscribe_sms: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { sequelize, tableName: 'users', paranoid: true },
  );

  SmsVerification.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      phone: { type: DataTypes.STRING(20), allowNull: false },
      code_hash: { type: DataTypes.STRING(255), allowNull: false },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      verified_at: { type: DataTypes.DATE, allowNull: true },
    },
    { sequelize, tableName: 'sms_verifications' },
  );

  UserAddress.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: { type: DataTypes.UUID, allowNull: false },
      type: { type: DataTypes.STRING(10), allowNull: false },
      city: { type: DataTypes.STRING(255), allowNull: false },
      street: { type: DataTypes.STRING(255), allowNull: false },
      house: { type: DataTypes.STRING(50), allowNull: false },
      building: { type: DataTypes.STRING(50), allowNull: true },
      apartment: { type: DataTypes.STRING(50), allowNull: true },
      floor: { type: DataTypes.STRING(20), allowNull: true },
      is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { sequelize, tableName: 'user_addresses', paranoid: true },
  );

  UserConsent.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: { type: DataTypes.UUID, allowNull: false },
      channel: { type: DataTypes.STRING(10), allowNull: false },
      granted: { type: DataTypes.BOOLEAN, allowNull: false },
      ip_address: { type: DataTypes.STRING(45), allowNull: true },
    },
    { sequelize, tableName: 'user_consents', updatedAt: true, createdAt: true, deletedAt: false },
  );

  UserCompany.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING(255), allowNull: false },
      inn: { type: DataTypes.STRING(12), allowNull: false },
      kpp: { type: DataTypes.STRING(9), allowNull: true },
      legal_address: { type: DataTypes.TEXT, allowNull: false },
    },
    { sequelize, tableName: 'user_companies', paranoid: true },
  );

  StaffUser.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      role: { type: DataTypes.STRING(20), allowNull: false },
      first_name: { type: DataTypes.STRING(100), allowNull: true },
      last_name: { type: DataTypes.STRING(100), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'staff_users', paranoid: true },
  );

  Favorite.init(
    {
      user_id: { type: DataTypes.UUID, primaryKey: true },
      product_id: { type: DataTypes.UUID, primaryKey: true },
    },
    { sequelize, tableName: 'favorites' },
  );

  User.hasMany(UserAddress, { foreignKey: 'user_id', as: 'addresses' });
  User.hasMany(UserConsent, { foreignKey: 'user_id', as: 'consents' });
  User.hasMany(UserCompany, { foreignKey: 'user_id', as: 'companies' });
  User.belongsToMany(Product, { through: Favorite, as: 'favoriteProducts', foreignKey: 'user_id' });
  Product.belongsToMany(User, { through: Favorite, as: 'favoritedBy', foreignKey: 'product_id' });
}
