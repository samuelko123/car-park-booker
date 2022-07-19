process.env.TEST_SUITE = __filename

import { ObjectId } from 'mongodb'
import waitForExpect from 'wait-for-expect'
import handler from '../../src/pages/api/login'
import {
	DB,
	HTTP_METHOD,
	HTTP_STATUS,
} from '../../src/utils/constants'
import { CryptoHelper } from '../../src/utils/CryptoHelper'
import { MongoHelper } from '../../src/utils/MongoHelper'
import { MOCK_DATE } from '../fixtures/seeds'

jest.mock('../../src/utils/CarParkBooker')

describe('/api/login', () => {
	describe('happy paths', () => {
		test('login successfully', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			const res = global.createMockRes()

			req.body = {
				username: 'job_doe@example.com',
				password: 'password',
			}

			jest.spyOn(Date, 'now').mockReturnValue(MOCK_DATE.NOW)

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.OK)
			expect(res.end).toBeCalledTimes(1)
			expect(res.setHeader).toBeCalledWith(
				'Set-Cookie',
				[expect.stringContaining('session_token=')]
			)

			const { db } = await MongoHelper.connectToDatabase()
			await waitForExpect(async () => {
				const user = await db.collection(DB.USERS).findOne({})
				expect(user).toEqual(expect.objectContaining({
					_id: expect.any(ObjectId),
					username: req.body.username,
					hash: CryptoHelper.encrypt(req.body.password),
					last_active_at: new Date(MOCK_DATE.NOW),
				}))
			})
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

		test('invalid body', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			const res = global.createMockRes()

			req.body = {}

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.BAD_REQUEST)
		})
	})
})