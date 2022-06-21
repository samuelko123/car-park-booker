import { DB } from '../utils/constants'
import { BaseDAO } from './BaseDAO'

export class LogDAO {
	static collection_name = DB.LOGS
	static create = BaseDAO.create
	static getOne = BaseDAO.getOne
	static getOneById = BaseDAO.getOneById
	static get = BaseDAO.get
	static update = BaseDAO.update
	static upsert = BaseDAO.upsert
	static delete = BaseDAO.delete
}