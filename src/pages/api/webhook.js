import { CarParkBooker } from '../../utils/CarParkBooker'
import {
	ErrorHandler,
	ExpiredJobError,
	HttpBadRequestError,
	NoBayError,
} from '../../utils/ErrorHandler'
import { ApiHelper } from '../../utils/ApiHelper'
import {
	ERROR,
	HTTP_METHOD,
	HTTP_STATUS,
	JOB_STATUS,
	LIMIT,
} from '../../utils/constants'
import { JobDAO } from '../../dao/JobDAO'
import { CryptoHelper } from '../../utils/CryptoHelper'
import moment from 'moment'
import { Logger } from '../../utils/Logger'
import { FormatHelper } from '../../utils/FormatHelper'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.POST]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.POST) {
			// check integrity of request
			const signature = req.headers['x-webhook-signature']
			const {
				token,
				timestamp,
			} = req.body

			if (!token) {
				throw new HttpBadRequestError(ERROR.MISSING_TOKEN)
			}

			if (token.length !== LIMIT.WEBHOOK_TOKEN_LENGTH) {
				throw new HttpBadRequestError(ERROR.INVALID_TOKEN)
			}

			if (!timestamp) {
				throw new HttpBadRequestError(ERROR.MISSING_TIMESTAMP)
			}

			if (!FormatHelper.isTimestamp(timestamp)) {
				throw new HttpBadRequestError(ERROR.INVALID_TIMESTAMP)
			}

			if (timestamp + LIMIT.WEBHOOK_TIMESTAMP_AGE < Date.now()) {
				throw new HttpBadRequestError(ERROR.TIMESTAMP_TOO_OLD)
			}

			if (timestamp > Date.now()) {
				throw new HttpBadRequestError(ERROR.TIMESTAMP_TOO_NEW)
			}

			if (!signature) {
				throw new HttpBadRequestError(ERROR.MISSING_SIGNATURE)
			}

			const digest = CryptoHelper.hash(JSON.stringify(req.body), process.env.WEBHOOK_SECRET)
			if (signature.length !== digest.length || !CryptoHelper.isEqual(digest, signature)) {
				throw new HttpBadRequestError(ERROR.INVALID_SIGNATURE)
			}

			// process jobs
			const jobs = await JobDAO.getActiveJobs()

			Logger.info(`Scheduling ${jobs.length} jobs`)

			for (const job of jobs) {
				const delay_ms = Math.random() * LIMIT.MAX_JOB_RUN_DELAY_MS

				setTimeout(async () => {
					const data = {
						run_count: job.run_count + 1,
						last_run_at: new Date(),
					}

					try {
						const {
							username,
							hash,
							from_dt,
							to_dt,
						} = job

						if (moment.utc(from_dt) <= moment().utcOffset(0, true)) {
							throw new ExpiredJobError()
						}

						const password = CryptoHelper.decrypt(hash)
						const from_str = moment.utc(from_dt).format('YYYY.MM.DD HH:mm:ss', true)
						const to_str = moment.utc(to_dt).format('YYYY.MM.DD HH:mm:ss', true)

						const booker = new CarParkBooker(job._id)
						await booker.login(username, password)
						await booker.book_car_park(from_str, to_str)

						data.status = JOB_STATUS.SUCCEEDED
					} catch (err) {
						Logger.error({
							message: (err.message || '').trim(),
							job_id: job._id,
						})

						if (err instanceof ExpiredJobError) {
							data.status = JOB_STATUS.EXPIRED
						} else if (err instanceof NoBayError) {
							data.status = JOB_STATUS.ACTIVE
						} else {
							data.status = JOB_STATUS.FAILED
						}
					} finally {
						JobDAO.update(job._id, data)
					}
				}, delay_ms)
			}

			res.status(HTTP_STATUS.OK).end()
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
