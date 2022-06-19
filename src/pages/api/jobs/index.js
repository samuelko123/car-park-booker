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
			const jobs = await JobDAO.get(filter)

			res.status(HTTP_STATUS.OK).json(jobs)
		}

		if (req.method === HTTP_METHOD.POST) {
			const user = await ApiHelper.checkUser(req)
			const {
				username,
				hash,
			} = user

			// check data
			const data = req.body
			Validator.validate(jobSchema, data)
			const {
				date,
				from_time,
				to_time,
			} = data

			const from_dt = moment(`${date} ${from_time}:00`, 'YYYY.MM.DD HH:mm:ss', true)
			if (!from_dt.isValid()) {
				throw new HttpBadRequestError(ERROR.INVALID_FROM_DT)
			}

			const to_dt = moment(`${date} ${to_time}:00`, 'YYYY.MM.DD HH:mm:ss', true)
			if (!to_dt.isValid()) {
				throw new HttpBadRequestError(ERROR.INVALID_TO_DT)
			}

			// check for duplicate job
			const existing_jobs = await JobDAO.get({
				username: username,
				date: date,
			})
			if (existing_jobs.length > 0) {
				throw new HttpBadRequestError(ERROR.JOB_EXISTS)
			}

			// create job
			await JobDAO.create({
				...data,
				username: username,
				hash: hash,
				status: JOB_STATUS.SCHEDULED,
				run_count: 0,
				last_run_at: new Date(0),
				created_at: new Date(),
			})

			// done
			res.status(HTTP_STATUS.CREATED).end()
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
