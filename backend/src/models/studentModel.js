import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Classes',
      key: 'id'
    }
  },
  studentNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  studentName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [2, 255],
        msg: 'Student name must be at least 2 characters long'
      }
    }
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: 1,
        msg: 'Age must be at least 1'
      },
      max: {
        args: 100,
        msg: 'Age must be less than 100'
      }
    }
  },
  fatherName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  motherName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  photo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email address'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'graduated', 'transferred'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'Students'
});

export default Student;
