import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const School = sequelize.define('School', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [2, 255],
        msg: 'School name must be at least 2 characters long'
      }
    }
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  registrationNumber: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  licenseNumber: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  tin: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  photo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  totalStaff: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalStudents: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalTeachers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalCourses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  establishedYear: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  headMaster: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  studentsPerClass: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  }
}, {
  timestamps: true
});

export default School;
