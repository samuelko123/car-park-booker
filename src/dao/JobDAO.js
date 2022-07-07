import {
	DB,
	JOB_STATUS,
} from '../utils/constants'
import { MongoHelper } from '../utils/MongoHelper'
import { BaseDAO } from './BaseDAO'

export class JobDAO {
	static collection_name = DB.JOBS
	static create = BaseDAO.create
	static getOneById = BaseDAO.getOneById
	static getOne = BaseDAO.getOne
	static get = BaseDAO.get
	static getCount = BaseDAO.getCount
	static update = BaseDAO.update
	static delete = BaseDAO.delete

	static async getActiveJobs(job_id) {
		const { db } = await MongoHelper.connectToDatabase()
		const pipeline = [
			{
				$match: {
					_id: job_id || { $exists: true },
					status: JOB_STATUS.ACTIVE,
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'username',
					foreignField: 'username',
					as: 'user',
				},
			},
			{
				$project: {
					_id: true,
					from_dt: true,
					to_dt: true,
					run_count: true,
					username: true,
					hash: '$user.hash',
				},
			},
			{
				$unwind: {
					path: '$hash',
					preserveNullAndEmptyArrays: true,
				},
			},
		]

		const cursor = await db.collection(this.collection_name).aggregate(pipeline)
		const arr = await cursor.toArray()
		return MongoHelper.convertMongoIdToStr(arr)
	}
}