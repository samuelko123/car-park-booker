import { DB } from '../utils/constants'
import { BaseDAO } from './BaseDAO'

export class JobDAO {
	static collection_name = DB.JOBS
	static create = BaseDAO.create
	static getOneById = BaseDAO.getOneById
	static get = BaseDAO.get
	static update = BaseDAO.update
	static delete = BaseDAO.delete
}