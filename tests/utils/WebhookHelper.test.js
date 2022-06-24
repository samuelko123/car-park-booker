process.env.TEST_SUITE = __filename

import {
	ERROR,
	HTTP_METHOD,
	LIMIT,
} from '../../src/utils/constants'
import { CryptoHelper } from '../../src/utils/CryptoHelper'
import { WebHookHelper } from '../../src/utils/WebhookHelper'
import { MOCK_DATE } from '../fixtures/seeds'

describe('Webhook Helper', () => {
	describe('happy paths', () => {
		test('verified successfully', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			jest.spyOn(Date, 'now').mockReturnValue(MOCK_DATE.NOW)

			req.body = {
				token: 'x'.repeat(LIMIT.WEBHOOK_TOKEN_LENGTH),
				timestamp: MOCK_DATE.NOW,
			}
			req.headers['x-webhook-signature'] = CryptoHelper.hash(JSON.stringify(req.body), process.env.WEBHOOK_SECRET)

			// Action
			const fn = () => WebHookHelper.verifyRequest(req)

			// Assert
			expect(fn).not.toThrow()
		})
	})

	describe('unhappy paths', () => {
		test('missing token', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)

			// Action
			const fn = () => WebHookHelper.verifyRequest(req)

			// Assert
			expect(fn).toThrow(ERROR.MISSING_TOKEN)
		})

		test('invalid token', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)

			req.body = {
				token: 'invalid token',
			}

			// Action
			const fn = () => WebHookHelper.verifyRequest(req)

			// Assert
			expect(fn).toThrow(ERROR.INVALID_TOKEN)
		})

		test('missing timestamp', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)

			req.body = {
				token: 'x'.repeat(LIMIT.WEBHOOK_TOKEN_LENGTH),
			}

			// Action
			const fn = () => WebHookHelper.verifyRequest(req)

			// Assert
			expect(fn).toThrow(ERROR.MISSING_TIMESTAMP)
		})

		test('invalid timestamp', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)

			req.body = {
				token: 'x'.repeat(LIMIT.WEBHOOK_TOKEN_LENGTH),
				timestamp: 'invalid timestamp',
			}

			// Action
			const fn = () => WebHookHelper.verifyRequest(req)

			// Assert
			expect(fn).toThrow(ERROR.INVALID_TIMESTAMP)
		})

		test('old timestamp', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			jest.spyOn(Date, 'now').mockReturnValue(MOCK_DATE.NOW)

			req.body = {
				token: 'x'.repeat(LIMIT.WEBHOOK_TOKEN_LENGTH),
				timestamp: MOCK_DATE.NOW - LIMIT.WEBHOOK_TIMESTAMP_AGE - 1,
			}

			// Action
			const fn = () => WebHookHelper.verifyRequest(req)

			// Assert
			expect(fn).toThrow(ERROR.TIMESTAMP_TOO_OLD)
		})

		test('future timestamp', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			jest.spyOn(Date, 'now').mockReturnValue(MOCK_DATE.NOW)

			req.body = {
				token: 'x'.repeat(LIMIT.WEBHOOK_TOKEN_LENGTH),
				timestamp: MOCK_DATE.NOW + 1,
			}

			// Action
			const fn = () => WebHookHelper.verifyRequest(req)

			// Assert
			expect(fn).toThrow(ERROR.TIMESTAMP_TOO_NEW)
		})

		test('missing signature', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			jest.spyOn(Date, 'now').mockReturnValue(MOCK_DATE.NOW)

			req.body = {
				token: 'x'.repeat(LIMIT.WEBHOOK_TOKEN_LENGTH),
				timestamp: MOCK_DATE.NOW,
			}

			// Action
			const fn = () => WebHookHelper.verifyRequest(req)

			// Assert
			expect(fn).toThrow(ERROR.MISSING_SIGNATURE)
		})

		test('invalid signature', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			jest.spyOn(Date, 'now').mockReturnValue(MOCK_DATE.NOW)

			req.body = {
				token: 'x'.repeat(LIMIT.WEBHOOK_TOKEN_LENGTH),
				timestamp: MOCK_DATE.NOW,
			}
			req.headers['x-webhook-signature'] = 'invalid signature'

			// Action
			const fn = () => WebHookHelper.verifyRequest(req)

			// Assert
			expect(fn).toThrow(ERROR.INVALID_SIGNATURE)
		})
	})
})