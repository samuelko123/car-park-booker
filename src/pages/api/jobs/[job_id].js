import { ErrorHandler } from '../../../utils/ErrorHandler'
import { ApiHelper } from '../../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../../utils/constants'
import { JobDAO } from '../../../dao/JobDAO'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.DELETE]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		const { job_id } = req.query
		ApiHelper.checkMongoId(job_id)

		if (req.method === HTTP_METHOD.DELETE) {
			await ApiHelper.checkUser(req)
			await JobDAO.delete(job_id)
			res.status(HTTP_STATUS.OK).end()
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
