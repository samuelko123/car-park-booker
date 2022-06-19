import { MongoClient } from 'mongodb'

export class MongoHelper {
	static cached_client = null
	static cached_db = null

	static async connectToDatabase() {
		if (!this.cached_client || !this.cached_db) {
			const client = await MongoClient.connect(process.env.MONGO_URI, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			})

			const db = await client.db(process.env.MONGO_DB_NAME)
			this.cached_client = client
			this.cached_db = db
		}

		return {
			client: this.cached_client,
			db: this.cached_db,
		}
	}

	static convertMongoIdToStr(obj) {
		if (!!obj && Array.isArray(obj)) {
			obj = obj.map(doc => {
				doc._id = doc._id = doc._id.toString()
				return doc
			})
		}

		return obj
	}
}