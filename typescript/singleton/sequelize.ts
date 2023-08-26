require('dotenv').config();
import { Sequelize } from 'sequelize';

export class SequelizeSingleton {
	
    private static instance: SequelizeSingleton;
	private connection: Sequelize;

    private constructor() {
		this.connection = new Sequelize(
            process.env.MYSQL_DATABASE || '', // Fornisci una stringa vuota come valore di default
            process.env.MYSQL_USER || '',
            process.env.MYSQL_PASSWORD || '', {
			host: process.env.MYSQL_HOST || 'localhost',
			port: Number(process.env.MYSQL_PORT) || 3306,
			dialect: 'mysql'
		});
	}

	public static getConnection(): Sequelize {
        if (!SequelizeSingleton.instance) {
            SequelizeSingleton.instance = new SequelizeSingleton();
        }
        return SequelizeSingleton.instance.connection;
    }
}
