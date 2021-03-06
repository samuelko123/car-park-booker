import { ErrorHandler } from '../../utils/ErrorHandler'
import { ApiHelper } from '../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
	LIMIT,
} from '../../utils/constants'
import { JobDAO } from '../../dao/JobDAO'
import { Logger } from '../../utils/Logger'
import { WebHookHelper } from '../../utils/WebhookHelper'
import { JobRunner } from '../../utils/JobRunner'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.POST]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.POST) {
			// verify request
			WebHookHelper.verifyRequest(req)

			// process jobs
			const jobs = await JobDAO.getActiveJobs()

			// schedule jobs to run at different time
			Logger.info(`Scheduling ${jobs.length} jobs`)
			jobs.forEach(job => {
				setTimeout(async () => await JobRunner.run(job), Math.random() * LIMIT.MAX_JOB_RUN_DELAY_MS)
			})

			// acknowledge receipt
			res.status(HTTP_STATUS.OK).end()
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
