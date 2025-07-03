import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [2, 255],
        msg: 'Name must be at least 2 characters long'
      }
    }
  },
  school: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [2, 255],
        msg: 'School name must be at least 2 characters long'
      }
    }
  },
  institute: {
    type: DataTypes.ENUM(
      'Pre-Primary Schools (Nurseries/Kindergartens)',
      'Primary Schools',
      'Secondary Schools (O-Level and A-Level)',
      'Universities',
      'Technical/Vocational Schools',
      'Teacher Training Colleges',
      'Nursing/Midwifery Training Schools',
      'Agricultural Institutes',
      'Specialized Institutes'
    ),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email address'
      }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters long'
      }
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default User;
