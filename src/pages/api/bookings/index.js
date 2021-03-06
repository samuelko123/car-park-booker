import { ErrorHandler } from '../../../utils/ErrorHandler'
import { ApiHelper } from '../../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
	JOB_STATUS,
} from '../../../utils/constants'
import { JobDAO } from '../../../dao/JobDAO'
import moment from 'moment'
import { CarParkBooker } from '../../../utils/CarParkBooker'
import { CryptoHelper } from '../../../utils/CryptoHelper'
import { DateTimeHelper } from '../../../utils/DateTimeHelper'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.GET]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.GET) {
			const user = await ApiHelper.checkUser(req)
			const {
				username,
				hash,
				cookie,
			} = user
			const password = CryptoHelper.decrypt(hash)

			// get confirmed bookings
			const booker = new CarParkBooker(username, password, cookie)
			const bookingsPromise = booker.read_bookings()

			// get jobs
			const filter = {
				username: username,
				to_dt: {
					$gte: DateTimeHelper.getToday(),
				},
				status: {
					$ne: JOB_STATUS.SUCCEEDED,
				},
			}
			const sort = { last_run_at: -1 }
			const fields = ['from_dt', 'to_dt', 'status', 'last_run_at']
			const jobsPromise = JobDAO.get(filter, fields, null, sort)

			// combine bookings and jobs
			const [bookings, jobs] = await Promise.all([bookingsPromise, jobsPromise])

			const slots = DateTimeHelper.getUpcomingWeekDays('YYYY-MM-DD')
				.map(date => {
					for (const booking of bookings) {
						if (booking.from_dt.slice(0, 10) === date) {
							return {
								date: date,
								status: JOB_STATUS.SUCCEEDED,
								car_park: booking.car_park,
								booking_id: booking.id,
							}
						}
					}

					for (const job of jobs) {
						if (moment.utc(job.from_dt).format('YYYY-MM-DD') === date) {
							return {
								date: date,
								status: job.status,
								job_id: job._id,
								last_run_at: job.last_run_at,
							}
						}
					}

					return {
						date: date,
					}
				})

			res.status(HTTP_STATUS.OK).json(slots)
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
