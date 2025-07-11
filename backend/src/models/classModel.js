import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  schoolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Schools',
      key: 'id'
    }
  },
  className: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [2, 255],
        msg: 'Class name must be at least 2 characters long'
      }
    }
  },
  year: {
    type: DataTypes.STRING(4),
    allowNull: false,
    validate: {
      is: {
        args: /^\d{4}$/,
        msg: 'Year must be a 4-digit number'
      }
    }
  },
  photo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 30
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'archived'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'Classes'
});

export default Class;
