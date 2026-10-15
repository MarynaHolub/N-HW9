import {Sequelize} from 'sequelize';
import configData from './config.js';
import 'dotenv/config'

const env = process.env.NODE_ENV || 'development';

const config = configData[env];

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: false, // не печатай каждый SQL-запрос в консоль автоматически.
    }
)

export default sequelize