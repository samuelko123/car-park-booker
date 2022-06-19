import { DB } from '../utils/constants'
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
}