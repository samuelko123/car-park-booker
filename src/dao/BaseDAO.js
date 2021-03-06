import { ObjectId } from 'mongodb'
import { FormatHelper } from '../utils/FormatHelper'
import { MongoHelper } from '../utils/MongoHelper'

export class BaseDAO {
	static async create(data) {
		const { db } = await MongoHelper.connectToDatabase()
		return await db.collection(this.collection_name).insertOne(data)
	}

	static async getOneById(id, fields) {
		if (!id) {
			return null
		}

		if (!ObjectId.isValid(id)) {
			return null
		}

		const doc = await this.getOne({ _id: id }, fields)
		return doc
	}

	static async getOne(filter, fields) {
		const arr = await this.get(filter, fields)
		if (arr.length === 0) {
			return null
		}

		return arr[0]
	}

	static async get(filter, fields, limit, sort) {
		const { db } = await MongoHelper.connectToDatabase()
		if ('_id' in filter) {
			filter._id = ObjectId(filter._id)
		}

		if (!fields) {
			fields = []
		}

		const output_fields = fields.reduce((prev, curr) => {
			prev[curr] = true
			return prev
		}, {})

		const pipeline = []
		pipeline.push({ $match: filter })
		if (Object.keys(output_fields).length > 0) {
			pipeline.push({ $project: output_fields })
		}
		if (sort) {
			pipeline.push({ $sort: sort })
		}
		if (FormatHelper.isInt(limit)) {
			pipeline.push({ $limit: Number.parseInt(limit) })
		}

		const cursor = await db.collection(this.collection_name).aggregate(pipeline)
		const arr = await cursor.toArray()
		return MongoHelper.convertMongoIdToStr(arr)
	}

	static async getCount(filter) {
		const { db } = await MongoHelper.connectToDatabase()
		const count = await db.collection(this.collection_name).count(filter)
		return count
	}

	static async updateById(id, data, options) {
		const filter = { _id: ObjectId(id) }
		return await this.update(filter, data, options)
	}

	static async update(filter, data, options) {
		const { db } = await MongoHelper.connectToDatabase()

		const operation = { $set: data }
		return db.collection(this.collection_name).updateMany(filter, operation, options)
	}

	static async upsert(filter, data) {
		const options = { upsert: true }
		return await this.update(filter, data, options)
	}

	static async delete(id) {
		const { db } = await MongoHelper.connectToDatabase()
		const query = { _id: ObjectId(id) }
		return await db.collection(this.collection_name).deleteOne(query)
	}
}