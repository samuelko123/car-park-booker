process.env.TEST_SUITE = __filename

import handler from '../../src/pages/api/logout'
import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../src/utils/constants'

describe('/api/logout', () => {
	describe('happy paths', () => {
		test('logout successfully', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			const res = global.createMockRes()

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.OK)
			expect(res.end).toBeCalledTimes(1)
			expect(res.setHeader).toBeCalledWith(
				'Set-Cookie',
				[
					expect.stringContaining('session_token=;'),
				]
			)
		})
	})

	describe('unhappy paths', () => {
		test('method not allowed', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.GET)
			const res = global.createMockRes()

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.METHOD_NOT_ALLOWED)
		})
	})
})