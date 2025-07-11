import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SQLite configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../', 'School Mgt System.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: false,
    freezeTableName: false,
    timestamps: true
  },
  // SQLite specific options
  dialectOptions: {
    // Enable foreign keys
    foreignKeys: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
