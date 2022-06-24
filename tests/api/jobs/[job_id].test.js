process.env.TEST_SUITE = __filename

import { ObjectId } from 'mongodb'
import handler from '../../../src/pages/api/jobs/[job_id]'
import { ApiHelper } from '../../../src/utils/ApiHelper'
import {
	DB,
	ERROR,
	HTTP_METHOD,
	HTTP_STATUS,
	JOB_STATUS,
} from '../../../src/utils/constants'
import { SEEDS } from '../../fixtures/seeds'

describe('GET /api/jobs/[job_id]', () => {
	describe('happy paths', () => {
		test('retrieved job successfully', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.GET)
			const res = global.createMockRes()
			await global.seedDatabase(DB.JOBS)

			const username = 'jane_doe@example.com'
			const job = SEEDS[DB.JOBS].filter(job => job.username === username)[0]
			req.query = { job_id: job._id }

			ApiHelper.checkUser = jest.fn().mockReturnValue({
				username: username,
			})

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.OK)
			expect(res.json).toBeCalledWith({
				job: expect.objectContaining({
					_id: job._id.toString(),
				}),
				logs: [],
			})
		})
	})

	describe('unhappy paths', () => {
		test('job does not exist', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.GET)
			const res = global.createMockRes()

			const username = 'john_doe@example.com'
			const job_id = new ObjectId()
			req.query = { job_id: job_id }

			ApiHelper.checkUser = jest.fn().mockReturnValue({
				username: username,
			})

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.NOT_FOUND)
		})

		test('job does not belong to user', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.GET)
			const res = global.createMockRes()
			await global.seedDatabase(DB.JOBS)

			const job = SEEDS[DB.JOBS][0]
			req.query = { job_id: job._id }

			ApiHelper.checkUser = jest.fn().mockReturnValue({
				username: 'no_such_user@example.com',
			})

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.FORBIDDEN)
		})
	})
})

describe('DELETE /api/jobs/[job_id]', () => {
	describe('happy paths', () => {
		test('deleted job successfully', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.DELETE)
			const res = global.createMockRes()
			await global.seedDatabase(DB.JOBS)

			const username = 'joe_doe@example.com'
			const job = SEEDS[DB.JOBS].filter(job => job.username === username)[0]
			req.query = { job_id: job._id }

			ApiHelper.checkUser = jest.fn().mockReturnValue({
				username: username,
			})

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.OK)
			expect(res.end).toBeCalledTimes(1)
		})
	})

	describe('unhappy paths', () => {
		test('job is not active', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.DELETE)
			const res = global.createMockRes()
			await global.seedDatabase(DB.JOBS)

			const job = SEEDS[DB.JOBS].filter(job => job.status === JOB_STATUS.EXPIRED)[0]
			req.query = { job_id: job._id }

			ApiHelper.checkUser = jest.fn().mockReturnValue({
				username: job.username,
			})

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.BAD_REQUEST)
			expect(res.send).toBeCalledWith(ERROR.CANNOT_DELETE_NON_ACTIVE_JOB)
		})
	})
})