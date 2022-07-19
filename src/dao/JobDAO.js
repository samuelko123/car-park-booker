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
	static updateById = BaseDAO.updateById
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
					lic_plate: true,
					cookie: true,
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

	static async getStat() {
		const { db } = await MongoHelper.connectToDatabase()
		const pipeline = [
			{
				$group: {
					_id: {
						username: '$username',
						status: '$status',
					},
					job_count: { $count: {} },
					run_count: { $sum: '$run_count' },
				},
			},
			{
				$project: {
					_id: false,
					username: '$_id.username',
					status: '$_id.status',
					job_count: '$job_count',
					run_count: '$run_count',
				},
			},
			{
				$sort: {
					username: 1,
					status: 1,
				},
			},
		]

		const cursor = await db.collection(this.collection_name).aggregate(pipeline)
		const arr = await cursor.toArray()
		return arr
	}
}