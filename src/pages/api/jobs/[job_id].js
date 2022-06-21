import {
	ErrorHandler,
	HttpBadRequestError,
} from '../../../utils/ErrorHandler'
import { ApiHelper } from '../../../utils/ApiHelper'
import {
	ERROR,
	HTTP_METHOD,
	HTTP_STATUS,
	JOB_STATUS,
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
			const job = await JobDAO.getOneById(job_id, ['status'])
			if (job.status !== JOB_STATUS.ACTIVE) {
				throw new HttpBadRequestError(ERROR.CANNOT_DELETE_NON_ACTIVE_JOB)
			}
			await JobDAO.delete(job_id)
			res.status(HTTP_STATUS.OK).end()
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
