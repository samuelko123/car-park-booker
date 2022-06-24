import {
	ERROR,
	LIMIT,
} from './constants'
import { CryptoHelper } from './CryptoHelper'
import { HttpBadRequestError } from './ErrorHandler'
import { FormatHelper } from './FormatHelper'

export class WebHookHelper {
	static verifyRequest(req) {
		// check integrity of request
		const signature = req.headers['x-webhook-signature']
		const {
			token,
			timestamp,
		} = req.body

		if (!token) {
			throw new HttpBadRequestError(ERROR.MISSING_TOKEN)
		}

		if (token.length !== LIMIT.WEBHOOK_TOKEN_LENGTH) {
			throw new HttpBadRequestError(ERROR.INVALID_TOKEN)
		}

		if (!timestamp) {
			throw new HttpBadRequestError(ERROR.MISSING_TIMESTAMP)
		}

		if (!FormatHelper.isTimestamp(timestamp)) {
			throw new HttpBadRequestError(ERROR.INVALID_TIMESTAMP)
		}

		if (timestamp + LIMIT.WEBHOOK_TIMESTAMP_AGE < Date.now()) {
			throw new HttpBadRequestError(ERROR.TIMESTAMP_TOO_OLD)
		}

		if (timestamp > Date.now()) {
			throw new HttpBadRequestError(ERROR.TIMESTAMP_TOO_NEW)
		}

		if (!signature) {
			throw new HttpBadRequestError(ERROR.MISSING_SIGNATURE)
		}

		const digest = CryptoHelper.hash(JSON.stringify(req.body), process.env.WEBHOOK_SECRET)
		if (signature.length !== digest.length || !CryptoHelper.isEqual(digest, signature)) {
			throw new HttpBadRequestError(ERROR.INVALID_SIGNATURE)
		}
	}
}