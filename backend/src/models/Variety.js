import { DataTypes } from 'sequelize';
import { slugify } from '../utils/slug.js';

export function defineVarietyModel(sequelize) {
  if (!sequelize) return null;

  const Variety = sequelize.define('Variety', {
    id: {
      type: DataTypes.STRING(64),
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      comment: 'REST-friendly slug for produce variety',
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    fruit: {
      type: DataTypes.STRING(64),
      defaultValue: 'Apple',
    },
    origin: {
      type: DataTypes.STRING(64),
      defaultValue: 'Kashmir',
    },
    size_count: {
      type: DataTypes.STRING(64),
      defaultValue: '100 Count (A1)',
    },
    default_unit: {
      type: DataTypes.ENUM('Box', 'Kg'),
      defaultValue: 'Box',
    },
    default_rate_kg: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    default_rate_box: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'varieties',
    indexes: [
      { unique: true, fields: ['slug'] },
      { unique: true, fields: ['code'] },
      { fields: ['fruit'] },
    ],
    hooks: {
      beforeValidate: (variety) => {
        if (!variety.slug && variety.name) {
          const rawSlug = `${variety.fruit || ''}-${variety.name}-${variety.size_count || ''}`;
          variety.slug = slugify(rawSlug);
        }
      },
    },
  });

  return Variety;
}

