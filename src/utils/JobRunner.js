import moment from 'moment'
import {
	CarParkBooker,
	NoBayError,
} from './CarParkBooker'
import {
	ERROR,
	JOB_STATUS,
} from './constants'
import { CryptoHelper } from './CryptoHelper'
import { Logger } from './Logger'

export class JobRunner {
	static async run(job) {
		try {
			if (moment.utc(job.from_dt) <= moment().utcOffset(0, true)) {
				throw new ExpiredJobError()
			}

			const password = CryptoHelper.decrypt(job.hash)
			const from_str = moment.utc(job.from_dt).format('YYYY-MM-DD HH:mm:ss', true)
			const to_str = moment.utc(job.to_dt).format('YYYY-MM-DD HH:mm:ss', true)

			const booker = new CarParkBooker(job._id)
			await booker.login(job.username, password)
			await booker.book_car_park(from_str, to_str)

			return JOB_STATUS.SUCCEEDED
		} catch (err) {
			Logger.error({
				message: (err.message || '').trim(),
				job_id: job._id,
			})

			if (err instanceof ExpiredJobError) {
				return JOB_STATUS.EXPIRED
			} else if (err instanceof NoBayError) {
				return JOB_STATUS.ACTIVE
			} else {
				return JOB_STATUS.FAILED
			}
		}
	}
}

export class ExpiredJobError extends Error {
	constructor() {
		super(ERROR.JOB_EXPIRED)
	}
}