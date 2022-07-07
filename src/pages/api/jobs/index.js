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
import { JobRunner } from '../../../utils/JobRunner'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.GET, HTTP_METHOD.POST]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.GET) {
			const user = await ApiHelper.checkUser(req)
			const { username } = user

			const today = moment().utcOffset(0, true).set({
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0,
			}).toDate()

			const filter = {
				username: username,
				to_dt: {
					$gte: today,
				},
			}
			const sort = { to_dt: 1 }
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

			const from_dt = moment.utc(`${date} ${from_time}:00`, 'YYYY-MM-DD HH:mm:ss', true)
			if (!from_dt.isValid()) {
				throw new HttpBadRequestError(ERROR.INVALID_FROM_DT)
			}

			const to_dt = moment.utc(`${date} ${to_time}:00`, 'YYYY-MM-DD HH:mm:ss', true)
			if (!to_dt.isValid()) {
				throw new HttpBadRequestError(ERROR.INVALID_TO_DT)
			}

			if (from_dt.diff(moment().utcOffset(0, true), 'days', true) >= LIMIT.AVAILABLE_DAYS_IN_ADVANCE) {
				throw new HttpBadRequestError(ERROR.TOO_FAR_FROM_NOW)
			}

			// check for duplicate job
			const existing_job_count = await JobDAO.getCount({
				username: username,
				from_dt: {
					$gte: moment.utc(`${date} 00:00:00`, 'YYYY-MM-DD HH:mm:ss', true).toDate(),
					$lt: moment.utc(`${date} 00:00:00`, 'YYYY-MM-DD HH:mm:ss', true).add(1, 'days').toDate(),
				},
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
			const { insertedId } = await JobDAO.create({
				from_dt: from_dt.toDate(),
				to_dt: to_dt.toDate(),
				username: username,
				status: JOB_STATUS.ACTIVE,
				run_count: 0,
				created_at: new Date(),
			})

			const job = await JobDAO.getOneById(insertedId)

			// run job for once
			await JobRunner.run(job)

			// done
			res.status(HTTP_STATUS.CREATED).end()
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
