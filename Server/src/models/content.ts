import { DataTypes, Model, type Sequelize } from 'sequelize';
import { Product } from './catalog.js';

export class EditorChoiceItem extends Model {
  declare id: string;
  declare product_id: string;
  declare sort_order: number;
}

export class Banner extends Model {
  declare id: string;
  declare title: string;
  declare subtitle: string | null;
  declare image_url: string;
  declare link: string;
  declare size: string;
  declare sort_order: number;
  declare is_active: boolean;
}

export class InfoSlide extends Model {
  declare id: string;
  declare icon: string;
  declare title: string;
  declare description: string;
  declare sort_order: number;
  declare is_active: boolean;
}

export class Advantage extends Model {
  declare id: string;
  declare icon: string;
  declare title: string;
  declare description: string;
  declare sort_order: number;
  declare is_active: boolean;
}

export class PartnerBrand extends Model {
  declare id: string;
  declare name: string;
  declare logo_url: string;
  declare category_slug: string | null;
  declare link: string | null;
  declare sort_order: number;
  declare is_active: boolean;
}

export class StoreReview extends Model {
  declare id: string;
  declare author_name: string;
  declare text: string;
  declare source: string;
  declare rating: number;
  declare sort_order: number;
  declare is_active: boolean;
}

export class CmsPage extends Model {
  declare id: string;
  declare slug: string;
  declare title: string;
  declare content: string;
  declare meta_description: string | null;
  declare is_published: boolean;
}

export function initContentModels(sequelize: Sequelize) {
  EditorChoiceItem.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      product_id: { type: DataTypes.UUID, allowNull: false, unique: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { sequelize, tableName: 'editor_choice_items' },
  );

  Banner.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      subtitle: { type: DataTypes.STRING(500), allowNull: true },
      image_url: { type: DataTypes.STRING(500), allowNull: false },
      link: { type: DataTypes.STRING(500), allowNull: false },
      size: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'large' },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'banners', paranoid: true },
  );

  InfoSlide.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      icon: { type: DataTypes.STRING(100), allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'info_slides', paranoid: true },
  );

  Advantage.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      icon: { type: DataTypes.STRING(100), allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'advantages', paranoid: true },
  );

  PartnerBrand.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      logo_url: { type: DataTypes.STRING(500), allowNull: false },
      category_slug: { type: DataTypes.STRING(120), allowNull: true },
      link: { type: DataTypes.STRING(500), allowNull: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'partner_brands', paranoid: true },
  );

  StoreReview.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      author_name: { type: DataTypes.STRING(255), allowNull: false },
      text: { type: DataTypes.TEXT, allowNull: false },
      source: { type: DataTypes.STRING(50), allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'store_reviews', paranoid: true },
  );

  CmsPage.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      meta_description: { type: DataTypes.STRING(500), allowNull: true },
      is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'cms_pages', paranoid: true },
  );

  EditorChoiceItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Product.hasOne(EditorChoiceItem, { foreignKey: 'product_id', as: 'editorChoice' });
}
