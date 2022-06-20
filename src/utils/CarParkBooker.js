import * as cheerio from 'cheerio'
import * as htmlparser2 from 'htmlparser2'
import superagent from 'superagent'
import prefix from 'superagent-prefix'
import {
	CAR_PARK_ID,
	ERROR,
	STATE_ID,
} from './constants'
import { Logger } from './Logger'
import {
	HttpUnauthorizedError,
	NoBayError,
	RepeatedBookingError,
} from './ErrorHandler'

export class CarParkBooker {
	constructor(job_id) {
		this._agent = superagent.agent()
		this._middleware = prefix(process.env.URL_PREFIX)
		this._job_id = job_id
	}

	async _http_get(endpoint) {
		const res = await this._agent
			.use(this._middleware)
			.get(endpoint)
			.send()

		return res.text
	}

	async _http_post(endpoint, body) {
		const res = await this._agent
			.use(this._middleware)
			.post(endpoint)
			.type('application/x-www-form-urlencoded')
			.send(body)

		return res.text
	}

	_convert_str_to_doc(htmlString) {
		const dom = htmlparser2.parseDocument(htmlString)
		const $ = cheerio.load(dom)
		return $
	}

	async _get_token() {
		const endpoint = '/Account/Login'
		const html_string = await this._http_get(endpoint)
		const $ = this._convert_str_to_doc(html_string)
		const token = $('input[name=__RequestVerificationToken]').val()
		return token
	}

	async login(username, password) {
		Logger.info({
			message: 'Logging in',
			job_id: this._job_id,
		})
		const token = await this._get_token()
		const endpoint = '/Account/Login'
		const body = {
			__RequestVerificationToken: token,
			Email: username,
			Password: password,
		}

		const html_string = await this._http_post(endpoint, body)
		const $ = this._convert_str_to_doc(html_string)
		const title = $('title').html()
		if (title.startsWith('Login')) {
			throw new HttpUnauthorizedError(ERROR.INCORRECT_CREDENTIALS)
		}
	}

	async book_car_park(from_dt, to_dt) {
		const form_data = await this._build_form_data(from_dt, to_dt)
		const html_string = await this._submit_form(form_data)
		if (!!html_string) {
			await this._confirm_booking(html_string)
		}
	}

	async _build_form_data(from_dt, to_dt) {
		Logger.info({
			message: 'Filling form',
			job_id: this._job_id,
		})
		const endpoint = '/BookNow'
		const html_string = await this._http_get(endpoint)
		const $ = this._convert_str_to_doc(html_string)

		const form_data = {}
		$(':input').each((_, elem) => {
			const name = elem.attribs['name']
			const value = elem.attribs['value']
			if (!!name) {
				form_data[name] = value
			}
		})

		const lic_plate = await this._get_lic_plate()
		form_data['StateID'] = STATE_ID.VIC
		form_data['LicensePlate_input'] = lic_plate
		form_data['LicensePlate'] = lic_plate
		form_data['FromDate'] = from_dt.format('YYYY-MM-DD HH:mm:ss.000')
		form_data['ToDate'] = to_dt.format('YYYY-MM-DD HH:mm:ss.000')
		form_data['FromDatePicker'] = from_dt.format('DD/MM/YYYY')
		form_data['ToDatePicker'] = to_dt.format('DD/MM/YYYY')
		form_data['FromTimePicker'] = from_dt.format('HH:mm')
		form_data['ToTimePicker'] = to_dt.format('HH:mm')

		return form_data
	}

	_get_error(html_string) {
		const $ = this._convert_str_to_doc(html_string)
		const error = $('.validation-summary-errors').text()

		if (error.includes('overlapping')) {
			throw new RepeatedBookingError(error)
		}

		return error
	}

	async _submit_form(form_data) {
		const endpoint = '/BookNow/Payment'

		Logger.info({
			message: 'Submitting form - BOT3',
			job_id: this._job_id,
		})
		form_data['CarParkID'] = CAR_PARK_ID.BOT3
		const html_string_1 = await this._http_post(endpoint, form_data)
		if (!this._get_error(html_string_1)) {
			return html_string_1
		}

		Logger.info({
			message: 'Submitting form - BOT9',
			job_id: this._job_id,
		})
		form_data['CarParkID'] = CAR_PARK_ID.BOT9
		const html_string_2 = await this._http_post(endpoint, form_data)
		const error = this._get_error(html_string_2)
		if (!error) {
			return html_string_2
		}

		throw new NoBayError(error)
	}

	async _confirm_booking(html_string) {
		Logger.info({
			message: 'Confirming booking',
			job_id: this._job_id,
		})
		const endpoint = '/BookNow/ProcessPayment'
		const $ = this._convert_str_to_doc(html_string)
		const form_data = {}
		$(':input').each((_, elem) => {
			const name = elem.attribs['name']
			const value = elem.attribs['value']
			if (!!name) {
				form_data[name] = value
			}
		})

		await this._http_post(endpoint, form_data)
		Logger.info({
			message: 'Booked successfully',
			job_id: job._id,
		})
	}

	async _get_lic_plate() {
		const endpoint = '/Vehicle/Read'
		const body = {
			page: 1,
			pageSize: 500,
		}
		const data = await this._http_post(endpoint, body)
		const lic_plate = JSON.parse(data).Data.filter(elem => elem.Active === true)[0].LicensePlate
		return lic_plate
	}
}