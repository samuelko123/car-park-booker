process.env.TEST_SUITE = __filename

import waitForExpect from 'wait-for-expect'
import handler from '../../src/pages/api/session'
import { ApiHelper } from '../../src/utils/ApiHelper'
import {
	DB,
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../src/utils/constants'
import { CryptoHelper } from '../../src/utils/CryptoHelper'
import { MongoHelper } from '../../src/utils/MongoHelper'
import {
	MOCK_DATE,
	SEEDS,
} from '../fixtures/seeds'

jest.mock('../../src/utils/CarParkBooker')

describe('/api/session', () => {
	describe('happy paths', () => {
		test('return user', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.GET)
			const res = global.createMockRes()
			await global.seedDatabase(DB.USERS)

			const username = SEEDS[DB.USERS][0].username
			req.cookies = {
				session_token: CryptoHelper.encrypt(JSON.stringify({
					username: username,
				})),
			}

			jest.spyOn(Date, 'now').mockReturnValue(MOCK_DATE.NOW)

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.OK)
			expect(res.json).toBeCalledWith({
				username: username,
			})

			const { db } = await MongoHelper.connectToDatabase()
			await waitForExpect(async () => {
				const user = await db.collection(DB.USERS).findOne({ username: username })
				expect(user).toEqual(
					expect.objectContaining({
						last_active_at: new Date(MOCK_DATE.NOW),
					})
				)
			})
		})
	})

	describe('unhappy paths', () => {
		test('method not allowed', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.PATCH)
			const res = global.createMockRes()

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.METHOD_NOT_ALLOWED)
		})

		test('no session token', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.GET)
			const res = global.createMockRes()

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.NO_CONTENT)
			expect(res.end).toBeCalledTimes(1)
		})

		test('no username', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.GET)
			const res = global.createMockRes()
			req.cookies = {
				session_token: CryptoHelper.encrypt(JSON.stringify({
					invalid: 'token',
				})),
			}

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.NO_CONTENT)
			expect(res.end).toBeCalledTimes(1)
		})

		test('user not found in db', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.GET)
			const res = global.createMockRes()
			req.cookies = {
				session_token: CryptoHelper.encrypt(JSON.stringify({
					username: 'no such user',
				})),
			}

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.NO_CONTENT)
			expect(res.end).toBeCalledTimes(1)

			expect(res.setHeader).toBeCalledWith(
				'Set-Cookie',
				[expect.stringContaining('session_token=;')]
			)
		})

		test('error handling', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.GET)
			const res = global.createMockRes()

			const mock_error = new Error('unexpected error')
			ApiHelper.checkSessionToken = jest.fn().mockImplementation(() => {
				throw mock_error
			})

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.SERVER_ERROR)
			expect(res.send).toBeCalledWith(mock_error.message)
		})
	})
})