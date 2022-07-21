import {
	ErrorHandler,
	HttpNotFoundError,
} from '../../../utils/ErrorHandler'
import { ApiHelper } from '../../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../../utils/constants'
import { CarParkBooker } from '../../../utils/CarParkBooker'
import { CryptoHelper } from '../../../utils/CryptoHelper'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.GET, HTTP_METHOD.DELETE]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		// get booking id
		const { booking_id } = req.query

		// get user
		const user = await ApiHelper.checkUser(req)
		const {
			username,
			hash,
			cookie,
			lic_plate,
		} = user
		const password = CryptoHelper.decrypt(hash)

		// create CarParkBooker
		const booker = new CarParkBooker(username, password, cookie)

		if (req.method === HTTP_METHOD.GET) {
			// get booking
			const booking = await booker.read_booking_detail(booking_id)
			if ((booking?.['Number Plate'] || '').toUpperCase() !== lic_plate.toUpperCase()) {
				throw new HttpNotFoundError()
			}

			// return booking
			res.status(HTTP_STATUS.OK).json(booking)
		}

		if (req.method === HTTP_METHOD.DELETE) {
			// cancel booking
			await booker.cancel_booking(booking_id)
			res.status(HTTP_STATUS.OK).end()
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
