import moment from 'moment'
import { JobDAO } from '../dao/JobDAO'
import {
	CarParkBooker,
	NoBayError,
} from './CarParkBooker'
import {
	ERROR,
	JOB_STATUS,
	UI_TEXT,
} from './constants'
import { CryptoHelper } from './CryptoHelper'
import { Logger } from './Logger'

export class JobRunner {
	static async run(job) {
		let status

		try {
			if (moment.utc(job.from_dt) <= moment().utcOffset(0, true)) {
				throw new ExpiredJobError()
			}

			const password = CryptoHelper.decrypt(job.hash)
			const from_str = moment.utc(job.from_dt).format('YYYY-MM-DD HH:mm:ss', true)
			const to_str = moment.utc(job.to_dt).format('YYYY-MM-DD HH:mm:ss', true)

			const booker = new CarParkBooker()
			await booker.login(job.username, password)
			await booker.book_car_park(from_str, to_str)
			Logger.info({
				message: UI_TEXT.BOOKING_SUCCESS,
				job_id: job._id,
			})

			status = JOB_STATUS.SUCCEEDED
		} catch (err) {
			if (err instanceof NoBayError) {
				Logger.info({
					message: (err.message || '').trim(),
					job_id: job._id,
				})

				status = JOB_STATUS.ACTIVE
			} else {
				Logger.error({
					message: (err.message || '').trim(),
					job_id: job._id,
				})

				if (err instanceof ExpiredJobError) {
					status = JOB_STATUS.EXPIRED
				} else {
					status = JOB_STATUS.FAILED
				}
			}
		} finally {
			const data = {
				run_count: job.run_count + 1,
				last_run_at: new Date(),
				status: status,
			}

			await JobDAO.update(job._id, data)
		}
	}
}

export class ExpiredJobError extends Error {
	constructor() {
		super(ERROR.JOB_EXPIRED)
	}
}