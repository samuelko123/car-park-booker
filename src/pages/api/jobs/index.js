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
	LIMIT,
} from '../../../utils/constants'
import { Validator } from '../../../utils/Validator'
import { jobSchema } from '../../../schemas/jobSchema'
import { JobDAO } from '../../../dao/JobDAO'
import moment from 'moment'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.GET, HTTP_METHOD.POST]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.GET) {
			const user = await ApiHelper.checkUser(req)
			const { username } = user

			const filter = { username: username }
			const sort = { date: 1 }
			const jobs = await JobDAO.get(filter, null, null, sort)

			res.status(HTTP_STATUS.OK).json(jobs)
		}

		if (req.method === HTTP_METHOD.POST) {
			const user = await ApiHelper.checkUser(req)
			const {
				username,
			} = user

			// check data
			const data = req.body
			Validator.validate(jobSchema, data)
			const {
				date,
				from_time,
				to_time,
			} = data

			const from_dt = moment.utc(`${date} ${from_time}:00`, 'YYYY.MM.DD HH:mm:ss', true)
			if (!from_dt.isValid()) {
				throw new HttpBadRequestError(ERROR.INVALID_FROM_DT)
			}

			const to_dt = moment.utc(`${date} ${to_time}:00`, 'YYYY.MM.DD HH:mm:ss', true)
			if (!to_dt.isValid()) {
				throw new HttpBadRequestError(ERROR.INVALID_TO_DT)
			}

			// check for duplicate job
			const existing_job_count = await JobDAO.getCount({
				username: username,
				date: date,
				status: JOB_STATUS.ACTIVE,
			})
			if (existing_job_count > 0) {
				throw new HttpBadRequestError(ERROR.JOB_EXISTS)
			}

			// check max active job
			const active_job_count = await JobDAO.getCount({
				username: username,
				status: JOB_STATUS.ACTIVE,
			})
			if (active_job_count >= LIMIT.MAX_ACTIVE_JOB_COUNT) {
				throw new HttpBadRequestError(ERROR.REACHED_MAX_ACTIVE_JOB)
			}

			// create job
			await JobDAO.create({
				from_dt: from_dt.toDate(),
				to_dt: to_dt.toDate(),
				username: username,
				status: JOB_STATUS.ACTIVE,
				run_count: 0,
				created_at: new Date(),
			})

			// done
			res.status(HTTP_STATUS.CREATED).end()
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
