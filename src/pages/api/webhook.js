import { CarParkBooker } from '../../utils/CarParkBooker'
import {
	ErrorHandler,
	ExpiredJobError,
	NoBayError,
} from '../../utils/ErrorHandler'
import { ApiHelper } from '../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
	JOB_STATUS,
} from '../../utils/constants'
import { JobDAO } from '../../dao/JobDAO'
import { CryptoHelper } from '../../utils/CryptoHelper'
import moment from 'moment'
import { Logger } from '../../utils/Logger'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.POST]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.POST) {
			const jobs = await JobDAO.get({ status: JOB_STATUS.SCHEDULED })

			Logger.info(`Scheduling ${jobs.length} jobs`)
			for (const job of jobs) {
				const delay_ms = Math.random() * 25 * 60 * 1000 // within 25 mins.

				setTimeout(async () => {
					const data = {
						run_count: job.run_count + 1,
						last_run_at: new Date(),
					}

					try {
						const {
							username,
							hash,
							date,
							from_time,
							to_time,
						} = job

						if (moment(date, 'YYYY.MM.DD', true) <= moment()) {
							throw new ExpiredJobError()
						}

						const password = CryptoHelper.decrypt(hash)
						const from_dt = moment(`${date} ${from_time}:00`, 'YYYY.MM.DD HH:mm:ss', true)
						const to_dt = moment(`${date} ${to_time}:00`, 'YYYY.MM.DD HH:mm:ss', true)

						const booker = new CarParkBooker()
						await booker.login(username, password)
						await booker.book_car_park(from_dt, to_dt)

						data.status = JOB_STATUS.SUCCEEDED
					} catch (err) {
						Logger.error(err)

						data.error = (err.message || '').trim()
						if (err instanceof ExpiredJobError) {
							data.status = JOB_STATUS.EXPIRED
						} else if (err instanceof NoBayError) {
							data.status = JOB_STATUS.SCHEDULED
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
