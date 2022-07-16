import {
	ErrorHandler,
	HttpForbiddenError,
	HttpNotFoundError,
} from '../../../utils/ErrorHandler'
import { ApiHelper } from '../../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../../utils/constants'
import { JobDAO } from '../../../dao/JobDAO'
import { LogDAO } from '../../../dao/LogDAO'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.GET, HTTP_METHOD.DELETE]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		const { job_id } = req.query
		ApiHelper.checkMongoId(job_id)
		const user = await ApiHelper.checkUser(req)

		const job = await JobDAO.getOneById(job_id)
		if (!job) {
			throw new HttpNotFoundError()
		}

		if (user.username !== job.username) {
			throw new HttpForbiddenError()
		}

		if (req.method === HTTP_METHOD.GET) {
			const logs = await LogDAO.get({ job_id: job_id }, null, null, { timestamp: 1 })

			res.status(HTTP_STATUS.OK).json({
				job: job,
				logs: logs,
			})
		}

		if (req.method === HTTP_METHOD.DELETE) {
			await JobDAO.delete(job_id)
			res.status(HTTP_STATUS.OK).end()
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
