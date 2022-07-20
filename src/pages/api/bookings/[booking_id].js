import { ErrorHandler } from '../../../utils/ErrorHandler'
import { ApiHelper } from '../../../utils/ApiHelper'
import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../../utils/constants'
import { CarParkBooker } from '../../../utils/CarParkBooker'
import { CryptoHelper } from '../../../utils/CryptoHelper'

export default async function handler(req, res) {
	try {
		const allowed_methods = [HTTP_METHOD.GET]
		ApiHelper.checkHttpMethod(req, allowed_methods)

		if (req.method === HTTP_METHOD.GET) {
			const { booking_id } = req.query

			// get user
			const user = await ApiHelper.checkUser(req)
			const {
				username,
				hash,
				cookie,
			} = user
			const password = CryptoHelper.decrypt(hash)

			// get booking
			const booker = new CarParkBooker(username, password, cookie)
			const booking = await booker.read_booking_detail(booking_id)

			// return booking
			res.status(HTTP_STATUS.OK).json(booking)
		}
	} catch (err) {
		ErrorHandler.handleApiError(err, req, res)
	}
}
