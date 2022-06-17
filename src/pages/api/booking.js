import moment from 'moment'
import { CarParkBooker } from '../../utils/CarParkBooker'
import {
	ErrorHandler,
	HttpBadRequestError,
	NoBayError,
} from '../../utils/ErrorHandler'
import { ApiHelper } from '../../utils/ApiHelper'
import {
	ERROR,
	HTTP_METHOD,
	HTTP_STATUS,
	MESSAGE,
} from '../../utils/constants'
import { Validator } from '../../utils/Validator'
import { bookingRequestSchema } from '../../schemas/bookingRequestSchema'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.POST]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.POST) {
			const data = req.body
			Validator.validate(bookingRequestSchema, data)

			const {
				username,
				password,
				date,
			} = data

			const from_dt = moment(`${date} 07:00:00`, 'YYYY.MM.DD HH:mm:ss', true)
			if (!from_dt.isValid()) {
				throw new HttpBadRequestError(ERROR.INVALID_FROM_DT)
			}

			const to_dt = moment(`${date} 19:00:00`, 'YYYY.MM.DD HH:mm:ss', true)
			if (!to_dt.isValid()) {
				throw new HttpBadRequestError(ERROR.INVALID_TO_DT)
			}

			const booker = new CarParkBooker()
			await booker.login(username, password)
			await booker.book_car_park(from_dt, to_dt)

			res.status(HTTP_STATUS.OK).send(MESSAGE.BOOKING_SUCCESS)
		}
	} catch (err) {
		if (err instanceof NoBayError) {
			res.status(HTTP_STATUS.OK).send(err.message)
		} else {
			ErrorHandler.handleApiError(err, req, res)
		}
	}
}
