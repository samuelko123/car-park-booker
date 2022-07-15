import * as cheerio from 'cheerio'
import * as htmlparser2 from 'htmlparser2'
import moment from 'moment'
import superagent from 'superagent'
import prefix from 'superagent-prefix'
import {
	CAR_PARK_ID,
	ERROR,
	STATE_ID,
} from './constants'
import { HttpUnauthorizedError } from './ErrorHandler'

export class CarParkBooker {
	constructor() {
		this._agent = superagent.agent()
		this._middleware = prefix(process.env.URL_PREFIX)
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

	async book_car_park(from_dt, to_dt, lic_plate) {
		const form_data = await this._build_form_data(from_dt, to_dt, lic_plate)
		const html_string = await this._submit_form(form_data)
		if (!!html_string) {
			await this._confirm_booking(html_string)
		}
	}

	async _build_form_data(from_str, to_str, lic_plate) {
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

		form_data['StateID'] = STATE_ID.VIC
		form_data['LicensePlate_input'] = lic_plate
		form_data['LicensePlate'] = lic_plate

		const from_dt = moment(from_str, true)
		const to_dt = moment(to_str, true)
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

		form_data['CarParkID'] = CAR_PARK_ID.BOT3
		const html_string_1 = await this._http_post(endpoint, form_data)
		if (!this._get_error(html_string_1)) {
			return html_string_1
		}

		form_data['CarParkID'] = CAR_PARK_ID.BOT9
		const html_string_2 = await this._http_post(endpoint, form_data)
		const error = this._get_error(html_string_2)
		if (!error) {
			return html_string_2
		}

		throw new NoBayError(error)
	}

	async _confirm_booking(html_string) {
		const endpoint = '/BookNow/ProcessPayment'
		const $ = this._convert_str_to_doc(html_string)
		const form_data = {}
		$('#formEdit :input').each((_, elem) => {
			const name = elem.attribs['name']
			const value = elem.attribs['value']
			if (!!name) {
				form_data[name] = value
			}
		})

		await this._http_post(endpoint, form_data)
	}
}

export class NoBayError extends Error {
	constructor(message) {
		super(message)
	}
}

class RepeatedBookingError extends Error {
	constructor(message) {
		super(message)
	}
}