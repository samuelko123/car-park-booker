export class FormatHelper {
	static isInt(str) {
		return /^-?\d+$/.test(str)
	}

	static isTimestamp(str) {
		return (new Date(str)).getTime() > 0
	}
}