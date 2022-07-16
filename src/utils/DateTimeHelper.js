import moment from 'moment'
import { LIMIT } from './constants'

export class DateTimeHelper {
	static getToday() {
		const momentObj = moment().utcOffset(0, true).set({
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0,
		})

		return momentObj.toDate()
	}

	static getUpcomingWeekDays(format) {
		const dates = [...Array(LIMIT.AVAILABLE_DAYS_IN_ADVANCE + 1).keys()]
			.map((index) => {
				const momentObj = moment()
					.utcOffset(0, true)
					.startOf('days')
					.add(index, 'days')

				// skip weekend
				const weekday = momentObj.weekday()
				if ([0, 6].includes(weekday)) {
					return null
				}

				return momentObj.format(format)
			})
			.filter(elem => !!elem)

		return dates
	}

	static convertToShortFormat(date) {
		return moment.utc(date).format('DD/MM (ddd)')
	}
}