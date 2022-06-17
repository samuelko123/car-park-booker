import {
	DB,
	LOG_LEVEL,
} from './constants'
import { MongoHelper } from './MongoHelper'

export class Logger {
	static async log(message, level) {
		if (typeof message === 'string') {
			message = { message: message }
		}

		const { db } = await MongoHelper.connectToDatabase()
		await db.collection(DB.LOGS).insertOne({
			timestamp: new Date(Date.now()),
			level: level,
			...message,
		})
	}

	static async error(message) {
		await this.log(message, LOG_LEVEL.ERROR)
	}

	static async warn(message) {
		await this.log(message, LOG_LEVEL.WARN)
	}

	static async info(message) {
		await this.log(message, LOG_LEVEL.INFO)
	}

	static async http(message) {
		await this.log(message, LOG_LEVEL.HTTP)
	}

	static async debug(message) {
		await this.log(message, LOG_LEVEL.DEBUG)
	}
}