import { DataTypes, Model, type Sequelize } from 'sequelize';
import { PaymentMethod } from './reference.js';

export class Order extends Model {
  declare id: string;
  declare order_number: string;
  declare user_id: string | null;
  declare status: string;
  declare subtotal: string;
  declare delivery_price: string;
  declare payment_fee: string;
  declare installment_fee: string;
  declare total: string;
  declare comment: string | null;
  declare idempotency_key: string | null;
  declare pricing_version: string;
  declare items?: OrderItem[];
  declare delivery?: OrderDelivery | null;
  declare payment?: OrderPayment | null;
  declare notes?: ManagerNote[];
  declare statusHistory?: OrderStatusHistory[];
}

export class OrderItem extends Model {
  declare id: string;
  declare order_id: string;
  declare variant_id: string | null;
  declare quantity: number;
}

export class OrderDelivery extends Model {
  declare order_id: string;
  declare type: string;
  declare city: string;
  declare street: string;
  declare house: string;
  declare apartment: string | null;
  declare requires_prepay: boolean;
}

export class OrderPayment extends Model {
  declare order_id: string;
  declare payment_method_id: string;
  declare fee_percent: string;
  declare fee_amount: string;
  declare is_paid: boolean;
  declare method?: PaymentMethod;
}

export class OutboxEvent extends Model {
  declare id: string;
  declare event_type: string;
  declare aggregate_type: string;
  declare aggregate_id: string;
  declare payload: Record<string, unknown>;
  declare status: string;
  declare processed_at: Date | null;
}

export class DeliveryQuote extends Model {
  declare id: string;
  declare provider: string;
  declare payload: Record<string, unknown>;
  declare price: string;
  declare expires_at: Date;
}

export class ManagerNote extends Model {
  declare id: string;
  declare order_id: string;
  declare staff_user_id: string;
  declare text: string;
}

export class OrderStatusHistory extends Model {
  declare id: string;
  declare order_id: string;
  declare from_status: string | null;
  declare to_status: string;
  declare staff_user_id: string | null;
  declare note: string | null;
}

export function initOrderModels(sequelize: Sequelize) {
  Order.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      user_id: { type: DataTypes.UUID, allowNull: true },
      assigned_manager_id: { type: DataTypes.UUID, allowNull: true },
      customer_first_name: { type: DataTypes.STRING(100), allowNull: false },
      customer_last_name: { type: DataTypes.STRING(100), allowNull: false },
      customer_phone: { type: DataTypes.STRING(20), allowNull: false },
      customer_email: { type: DataTypes.STRING(255), allowNull: true },
      status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
      subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      delivery_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      payment_fee: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      installment_fee: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      comment: { type: DataTypes.TEXT, allowNull: true },
      idempotency_key: { type: DataTypes.STRING(64), allowNull: true, unique: true },
      pricing_version: { type: DataTypes.STRING(50), allowNull: false },
    },
    { sequelize, tableName: 'orders', paranoid: false },
  );

  OrderItem.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_id: { type: DataTypes.UUID, allowNull: false },
      product_id: { type: DataTypes.UUID, allowNull: false },
      variant_id: { type: DataTypes.UUID, allowNull: true },
      name: { type: DataTypes.STRING(500), allowNull: false },
      image: { type: DataTypes.STRING(500), allowNull: false },
      color: { type: DataTypes.STRING(100), allowNull: true },
      memory: { type: DataTypes.STRING(50), allowNull: true },
      unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, tableName: 'order_items', paranoid: false },
  );

  OrderDelivery.init(
    {
      order_id: { type: DataTypes.UUID, primaryKey: true },
      type: { type: DataTypes.STRING(50), allowNull: false },
      city: { type: DataTypes.STRING(255), allowNull: false },
      district: { type: DataTypes.STRING(255), allowNull: true },
      street: { type: DataTypes.STRING(255), allowNull: false },
      house: { type: DataTypes.STRING(50), allowNull: false },
      entrance: { type: DataTypes.STRING(50), allowNull: true },
      apartment: { type: DataTypes.STRING(50), allowNull: true },
      requires_prepay: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      tracking_number: { type: DataTypes.STRING(100), allowNull: true },
    },
    { sequelize, tableName: 'order_deliveries', paranoid: false },
  );

  OrderPayment.init(
    {
      order_id: { type: DataTypes.UUID, primaryKey: true },
      payment_method_id: { type: DataTypes.UUID, allowNull: false },
      fee_percent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      fee_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      is_paid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      paid_at: { type: DataTypes.DATE, allowNull: true },
      paid_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    },
    { sequelize, tableName: 'order_payments', paranoid: false },
  );

  OutboxEvent.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      event_type: { type: DataTypes.STRING(100), allowNull: false },
      aggregate_type: { type: DataTypes.STRING(50), allowNull: false },
      aggregate_id: { type: DataTypes.UUID, allowNull: false },
      payload: { type: DataTypes.JSONB, allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' },
      processed_at: { type: DataTypes.DATE, allowNull: true },
    },
    { sequelize, tableName: 'outbox_events', paranoid: false },
  );

  DeliveryQuote.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      provider: { type: DataTypes.STRING(50), allowNull: false },
      payload: { type: DataTypes.JSONB, allowNull: false },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      expires_at: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: 'delivery_quotes', paranoid: false },
  );

  ManagerNote.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_id: { type: DataTypes.UUID, allowNull: false },
      staff_user_id: { type: DataTypes.UUID, allowNull: false },
      text: { type: DataTypes.TEXT, allowNull: false },
    },
    { sequelize, tableName: 'manager_notes', paranoid: false },
  );

  OrderStatusHistory.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_id: { type: DataTypes.UUID, allowNull: false },
      from_status: { type: DataTypes.STRING(30), allowNull: true },
      to_status: { type: DataTypes.STRING(30), allowNull: false },
      staff_user_id: { type: DataTypes.UUID, allowNull: true },
      note: { type: DataTypes.TEXT, allowNull: true },
    },
    { sequelize, tableName: 'order_status_histories', paranoid: false },
  );

  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  Order.hasOne(OrderDelivery, { foreignKey: 'order_id', as: 'delivery' });
  OrderDelivery.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  Order.hasOne(OrderPayment, { foreignKey: 'order_id', as: 'payment' });
  OrderPayment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderPayment.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id', as: 'method' });
  Order.hasMany(ManagerNote, { foreignKey: 'order_id', as: 'notes' });
  ManagerNote.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'statusHistory' });
  OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
}
