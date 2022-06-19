import { ObjectId } from 'mongodb'
import { UserDAO } from '../dao/UserDAO'
import { CryptoHelper } from './CryptoHelper'
import {
	HttpBadRequestError,
	HttpMethodNotAllowedError,
	HttpUnauthorizedError,
} from './ErrorHandler'

export class ApiHelper {
	static checkHttpMethod(req, allowed_methods) {
		if (!allowed_methods.includes(req.method)) {
			throw new HttpMethodNotAllowedError(allowed_methods)
		}
	}

	static checkMongoId(id) {
		if (!ObjectId.isValid(id)) {
			throw new HttpBadRequestError()
		}
	}

	static async checkSessionToken(req) {
		const { session_token } = req.cookies
		if (!session_token) {
			throw new HttpUnauthorizedError()
		}

		const decrypted = JSON.parse(CryptoHelper.decrypt(session_token))
		const { username } = decrypted
		if (!username) {
			throw new HttpUnauthorizedError()
		}

		const filter = { username: username }
		const user = await UserDAO.getOne(filter, ['username', 'hash'])
		if (!user) {
			throw new HttpUnauthorizedError()
		}

		// update user record
		UserDAO.upsert(filter, {
			last_active_at: new Date(),
		})

		return user
	}

	static async checkUser(req) {
		const user = await this.checkSessionToken(req)
		return user
	}
}