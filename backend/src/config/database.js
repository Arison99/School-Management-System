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
    // SQLite doesn't have real boolean type, use INTEGER
    underscored: false,
    freezeTableName: false,
    timestamps: true
  }
});

export default sequelize;
