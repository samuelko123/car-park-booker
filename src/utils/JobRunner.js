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

		const {
			_id: job_id,
			username,
			hash,
			cookie,
			from_dt,
			to_dt,
			lic_plate,
			run_count,
		} = job

		try {
			if (moment.utc(from_dt) <= moment().utcOffset(0, true)) {
				throw new ExpiredJobError()
			}

			const password = CryptoHelper.decrypt(hash)
			const from_str = moment.utc(from_dt).format('YYYY-MM-DD HH:mm:ss', true)
			const to_str = moment.utc(to_dt).format('YYYY-MM-DD HH:mm:ss', true)

			const booker = new CarParkBooker(username, password, cookie)
			await booker.book_car_park(from_str, to_str, lic_plate)
			Logger.info({
				message: UI_TEXT.BOOKING_SUCCESS,
				job_id: job_id,
			})

			status = JOB_STATUS.SUCCEEDED
		} catch (err) {
			if (err instanceof NoBayError) {
				Logger.info({
					message: (err.message || '').trim(),
					job_id: job_id,
				})

				status = JOB_STATUS.ACTIVE
			} else {
				Logger.error({
					message: (err?.response?.error?.message || err.message || '').trim(),
					job_id: job_id,
				})

				if (err instanceof ExpiredJobError) {
					status = JOB_STATUS.EXPIRED
				} else {
					status = JOB_STATUS.FAILED
				}
			}
		} finally {
			const data = {
				run_count: run_count + 1,
				last_run_at: new Date(),
				status: status,
			}

			await JobDAO.updateById(job_id, data)
		}
	}
}

export class ExpiredJobError extends Error {
	constructor() {
		super(ERROR.JOB_EXPIRED)
	}
}