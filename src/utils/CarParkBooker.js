import * as cheerio from 'cheerio'
import * as htmlparser2 from 'htmlparser2'
import moment from 'moment'
import superagent from 'superagent'
import prefix from 'superagent-prefix'
import cookiejar from 'cookiejar'
import {
	CAR_PARK_ID,
	ERROR,
	HTTP_STATUS,
	STATE_ID,
} from './constants'
import { HttpUnauthorizedError } from './ErrorHandler'
import { UserDAO } from '../dao/UserDAO'

export class CarParkBooker {
	constructor(username, password, cookie) {
		this._username = username
		this._password = password

		this._agent = superagent.agent()
		if (!!cookie) {
			const cookie_list = cookie.split(';')
			this._agent.jar.setCookies(cookie_list, this._domain, '/')
		}

		this._middleware = prefix(process.env.URL_PREFIX)
		this._domain = process.env.URL_PREFIX.replace('https://', '').replace('/', '')
	}

	async _http_get(endpoint) {
		const res = await this._agent
			.use(this._middleware)
			.get(endpoint)
			.send()

		return res
	}

	async _http_post(endpoint, body) {
		const res = await this._agent
			.use(this._middleware)
			.post(endpoint)
			.type('application/x-www-form-urlencoded')
			.send(body)

		return res
	}

	_convert_str_to_doc(htmlString) {
		const dom = htmlparser2.parseDocument(htmlString)
		const $ = cheerio.load(dom)
		return $
	}

	async _get_token() {
		const endpoint = '/Account/Login'
		const res = await this._http_get(endpoint)
		const html_string = res.text
		const $ = this._convert_str_to_doc(html_string)
		const token = $('input[name=__RequestVerificationToken]').val()
		return token
	}

	async login() {
		// get verification token
		const token = await this._get_token()

		// send login request
		const endpoint = '/Account/Login'
		const body = {
			__RequestVerificationToken: token,
			Email: this._username,
			Password: this._password,
		}
		const res = await this._http_post(endpoint, body)
		const html_string = res.text

		// check login status
		const $ = this._convert_str_to_doc(html_string)
		const title = $('title').html()
		if (title.includes('Login')) {
			throw new HttpUnauthorizedError(ERROR.INCORRECT_CREDENTIALS)
		}

		// return cookie
		const access_info = new cookiejar.CookieAccessInfo(this._domain, '/', true, false)
		const cookie_str = this._agent.jar.getCookies(access_info).toValueString()
		return cookie_str
	}

	async read_bookings() {
		const endpoint = '/UserPermit/Read?HistoricalItems=False'
		const body = {
			page: 1,
			pageSize: 500,
		}
		let res = await this._http_post(endpoint, body)
		if (!res.headers['content-type'].includes('application/json')) {
			const cookie = await this.login()
			UserDAO.update({ username: this._username }, { cookie: cookie })
			res = await this._http_post(endpoint, body)
		}
		const data = res.text
		return JSON.parse(data).Data.map(elem => {
			return {
				id: elem.ID,
				from_dt: elem.EffectiveFrom,
				to_dt: elem.EffectiveTo,
				car_park: 'BOT ' + elem.CarParkName.slice(-1),
			}
		})
	}

	async read_booking_detail(booking_id) {
		// get html
		const endpoint = `/UserPermit/Edit?id=${booking_id}`
		let res = await this._http_get(endpoint)
		let html_string = res.text
		let $ = this._convert_str_to_doc(html_string)

		// login if necessary
		const title = $('title').html()
		if (title.includes('Login')) {
			const cookie = await this.login()
			UserDAO.update({ username: this._username }, { cookie: cookie })
			res = await this._http_get(endpoint)
			html_string = res.text
			$ = this._convert_str_to_doc(html_string)
		}

		const obj = {}
		$('.display-label').each((_, elem) => {
			const key = $(elem).text().replace('\n', '').trim()
			const value = $(elem).next().text().replace('\n', '').trim()

			if (!!key) {
				obj[key] = value
			}
		})

		return obj
	}

	async cancel_booking(booking_id) {
		// get html
		const endpoint = `/UserPermit/CancelPermit?id=${booking_id}`
		let res = await this._http_get(endpoint)
		let html_string = res.text
		let $ = this._convert_str_to_doc(html_string)

		// login if necessary
		const title = $('title').text()
		if (title.includes('Login')) {
			const cookie = await this.login()
			UserDAO.update({ username: this._username }, { cookie: cookie })
			res = await this._http_get(endpoint)
			html_string = res.text
			$ = this._convert_str_to_doc(html_string)
		}

		// send cancel request
		const token = $('input[name=__RequestVerificationToken]').val()
		const body = {
			__RequestVerificationToken: token,
			UserPermitID: booking_id,
			'X-Requested-With': 'XMLHttpRequest',
		}

		try {
			await this._http_post(endpoint, body)
		} catch (err) {
			if (err?.status === HTTP_STATUS.SERVER_ERROR) {
				// it sometimes give 500, but in fact operation succeeded
				// therefore ignore it
			} else {
				throw err
			}
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
		let res = await this._http_get(endpoint)
		let html_string = res.text
		let $ = this._convert_str_to_doc(html_string)
		const title = $('title').html()
		if (title.includes('Login')) {
			await this.login()
			res = await this._http_get(endpoint)
			html_string = res.text
			$ = this._convert_str_to_doc(html_string)
		}

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
		const res1 = await this._http_post(endpoint, form_data)
		const html_string_1 = res1.text
		if (!this._get_error(html_string_1)) {
			return html_string_1
		}

		form_data['CarParkID'] = CAR_PARK_ID.BOT9
		const res2 = await this._http_post(endpoint, form_data)
		const html_string_2 = res2.text
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
		if ((message || '').trim() === 'No bays available, please try different dates') {
			super('No bays available')
		} else {
			super(message)
		}
	}
}

class RepeatedBookingError extends Error {
	constructor(message) {
		super(message)
	}
}