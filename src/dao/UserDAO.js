import { DB } from '../utils/constants'
import { MongoHelper } from '../utils/MongoHelper'
import { BaseDAO } from './BaseDAO'

export class UserDAO {
	static collection_name = DB.USERS
	static create = BaseDAO.create
	static getOne = BaseDAO.getOne
	static getOneById = BaseDAO.getOneById
	static get = BaseDAO.get
	static update = BaseDAO.update
	static upsert = BaseDAO.upsert
	static delete = BaseDAO.delete

	static async getLogs(username) {
		const { db } = await MongoHelper.connectToDatabase()
		const pipeline = [
			{
				$match: {
					username: username,
				},
			},
			{
				$lookup: {
					from: 'jobs',
					localField: 'username',
					foreignField: 'username',
					as: 'jobs',
				},
			},
			{
				$unwind: '$jobs',
			},
			{
				$project: {
					_id: false,
					job_id: {
						$toString: '$jobs._id',
					},
				},
			},
			{
				$lookup: {
					from: 'logs',
					localField: 'job_id',
					foreignField: 'job_id',
					as: 'logs',
				},
			},
			{
				$unwind: '$logs',
			},
			{
				$project: {
					_id: false,
					log: '$logs',
				},
			},
			{
				$replaceRoot: {
					newRoot: '$log',
				},
			},
		]

		const cursor = await db.collection(this.collection_name).aggregate(pipeline)
		const arr = await cursor.toArray()
		return arr
	}
}