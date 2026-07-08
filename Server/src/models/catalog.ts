import {
  DataTypes,
  Model,
  type Sequelize,
} from 'sequelize';

export class Category extends Model {
  declare id: string;
  declare slug: string;
  declare name: string;
  declare parent_id: string | null;
  declare is_brand: boolean;
  declare brand_logo_url: string | null;
  declare icon: string | null;
  declare image: string | null;
  declare description: string | null;
  declare external_link: string | null;
  declare is_active: boolean;
}

export class Product extends Model {
  declare id: string;
  declare slug: string;
  declare name: string;
  declare category_id: string;
  declare subcategory_id: string;
  declare device_type: string;
  declare description: string | null;
  declare base_price: string;
  declare old_price: string | null;
  declare badge_type: string | null;
  declare badge_text: string | null;
  declare is_published: boolean;
  declare in_stock: boolean;
  declare rating_avg: string;
  declare reviews_count: number;
  declare brand?: Category;
  declare subcategory?: Category;
  declare images?: ProductImage[];
  declare features?: ProductFeature[];
  declare variants?: Array<ProductVariant & { stock?: Stock | null }>;
  declare specValues?: Array<ProductSpecValue & { field?: SpecFieldDefinition }>;
}

export class ProductVariant extends Model {
  declare id: string;
  declare product_id: string;
  declare sku: string;
  declare color_name: string;
  declare color_hex: string;
  declare memory: string | null;
  declare price: string;
  declare is_available: boolean;
  declare product?: Product;
  declare stock?: Stock | null;
}

export class Stock extends Model {
  declare variant_id: string;
  declare quantity: number;
  declare reserved_quantity: number;
}

export class ProductImage extends Model {
  declare id: string;
  declare product_id: string;
  declare url: string;
  declare sort_order: number;
  declare is_primary: boolean;
}

export class ProductFeature extends Model {
  declare id: string;
  declare product_id: string;
  declare title: string;
  declare description: string;
  declare icon_url: string | null;
}

export class SpecFieldDefinition extends Model {
  declare id: string;
  declare device_type: string;
  declare group_name: string;
  declare field_key: string;
  declare field_label: string;
}

export class ProductSpecValue extends Model {
  declare product_id: string;
  declare field_id: string;
  declare value: string;
  declare field?: SpecFieldDefinition;
}

export function initCatalogModels(sequelize: Sequelize) {
  Category.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      parent_id: { type: DataTypes.UUID, allowNull: true },
      is_brand: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      brand_logo_url: { type: DataTypes.STRING(500), allowNull: true },
      icon: { type: DataTypes.STRING(255), allowNull: true },
      image: { type: DataTypes.STRING(500), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      external_link: { type: DataTypes.STRING(500), allowNull: true },
    },
    { sequelize, tableName: 'categories', paranoid: true },
  );

  Product.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(500), allowNull: false },
      category_id: { type: DataTypes.UUID, allowNull: false },
      subcategory_id: { type: DataTypes.UUID, allowNull: false },
      device_type: { type: DataTypes.STRING(30), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      base_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      old_price: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      badge_type: { type: DataTypes.STRING(20), allowNull: true },
      badge_text: { type: DataTypes.STRING(100), allowNull: true },
      is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      in_stock: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      rating_avg: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
      reviews_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { sequelize, tableName: 'products', paranoid: true },
  );

  ProductVariant.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      product_id: { type: DataTypes.UUID, allowNull: false },
      sku: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      color_name: { type: DataTypes.STRING(100), allowNull: false },
      color_hex: { type: DataTypes.STRING(7), allowNull: false },
      memory: { type: DataTypes.STRING(50), allowNull: true },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      is_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'product_variants', paranoid: true },
  );

  Stock.init(
    {
      variant_id: { type: DataTypes.UUID, primaryKey: true },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      reserved_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { sequelize, tableName: 'stock' },
  );

  ProductImage.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      product_id: { type: DataTypes.UUID, allowNull: false },
      url: { type: DataTypes.STRING(500), allowNull: false },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { sequelize, tableName: 'product_images' },
  );

  ProductFeature.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      product_id: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      icon_url: { type: DataTypes.STRING(500), allowNull: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { sequelize, tableName: 'product_features' },
  );

  SpecFieldDefinition.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      device_type: { type: DataTypes.STRING(30), allowNull: false },
      group_name: { type: DataTypes.STRING(100), allowNull: false },
      field_key: { type: DataTypes.STRING(100), allowNull: false },
      field_label: { type: DataTypes.STRING(255), allowNull: false },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { sequelize, tableName: 'spec_field_definitions' },
  );

  ProductSpecValue.init(
    {
      product_id: { type: DataTypes.UUID, primaryKey: true },
      field_id: { type: DataTypes.UUID, primaryKey: true },
      value: { type: DataTypes.TEXT, allowNull: false },
    },
    { sequelize, tableName: 'product_spec_values', timestamps: true },
  );

  Category.hasMany(Category, { as: 'children', foreignKey: 'parent_id' });
  Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });

  Product.belongsTo(Category, { as: 'brand', foreignKey: 'category_id' });
  Product.belongsTo(Category, { as: 'subcategory', foreignKey: 'subcategory_id' });
  Product.hasMany(ProductVariant, { as: 'variants', foreignKey: 'product_id' });
  ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  ProductVariant.hasOne(Stock, { as: 'stock', foreignKey: 'variant_id' });
  Stock.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
  Product.hasMany(ProductImage, { as: 'images', foreignKey: 'product_id' });
  Product.hasMany(ProductFeature, { as: 'features', foreignKey: 'product_id' });
  Product.hasMany(ProductSpecValue, { as: 'specValues', foreignKey: 'product_id' });
  ProductSpecValue.belongsTo(SpecFieldDefinition, { foreignKey: 'field_id', as: 'field' });
  SpecFieldDefinition.hasMany(ProductSpecValue, { foreignKey: 'field_id', as: 'values' });
}
