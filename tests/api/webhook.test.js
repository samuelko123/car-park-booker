process.env.TEST_SUITE = __filename

import handler from '../../src/pages/api/webhook'
import {
	DB,
	HTTP_METHOD,
	HTTP_STATUS,
	JOB_STATUS,
} from '../../src/utils/constants'
import { JobRunner } from '../../src/utils/JobRunner'
import { SEEDS } from '../fixtures/seeds'

jest.mock('../../src/utils/WebhookHelper')
jest.mock('../../src/utils/JobRunner')

describe('/api/webhook', () => {
	describe('happy paths', () => {
		test('called webhook successfully', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			const res = global.createMockRes()
			await global.seedDatabase(DB.JOBS)

			jest.spyOn(global, 'setTimeout').mockImplementation(fn => fn())

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.OK)
			expect(res.end).toBeCalledTimes(1)
			expect(JobRunner.run).toBeCalledTimes(SEEDS[DB.JOBS].filter(job => job.status === JOB_STATUS.ACTIVE).length)
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
	})
})