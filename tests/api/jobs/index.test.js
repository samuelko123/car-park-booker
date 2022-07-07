process.env.TEST_SUITE = __filename

import moment from 'moment'
import handler from '../../../src/pages/api/jobs/index'
import { ApiHelper } from '../../../src/utils/ApiHelper'
import {
	DB,
	ERROR,
	HTTP_METHOD,
	HTTP_STATUS,
	LIMIT,
} from '../../../src/utils/constants'
import { MongoHelper } from '../../../src/utils/MongoHelper'
import { Validator } from '../../../src/utils/Validator'
import { JobRunner } from '../../../src/utils/JobRunner'
import { SEEDS } from '../../fixtures/seeds'

jest.mock('../../../src/utils/JobRunner')

describe('GET /api/jobs', () => {
	describe('happy paths', () => {
		test('retrieved jobs successfully', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.GET)
			const res = global.createMockRes()
			ApiHelper.checkUser = jest.fn().mockReturnValue({
				username: SEEDS[DB.JOBS][0].username,
			})
			await global.seedDatabase(DB.JOBS)
			moment.now = jest.fn().mockReturnValue(+new Date('2000-01-01T07:00:00'))

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.OK)
			expect(res.json).toBeCalledWith([
				expect.objectContaining({
					username: SEEDS[DB.JOBS][0].username,
				}),
			])
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

describe('POST /api/jobs', () => {
	describe('happy paths', () => {
		test('created job successfully', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			const res = global.createMockRes()

			const test_username = SEEDS[DB.JOBS][0].username
			ApiHelper.checkUser = jest.fn().mockReturnValue({
				username: test_username,
			})
			await global.seedDatabase(DB.USERS)

			moment.now = jest.fn().mockReturnValue(+new Date('2000-01-01T07:00:00'))
			req.body = {
				date: '2000-01-02',
				from_time: '07:00',
				to_time: '19:00',
			}

			JobRunner.run = jest.fn()

			// Action
			await handler(req, res)

			// Assert
			expect(JobRunner.run).toBeCalledWith(expect.objectContaining({
				_id: expect.any(String),
				username: test_username,
				hash: expect.any(String),
				run_count: 0,
			}))
			expect(res.status).toBeCalledWith(HTTP_STATUS.CREATED)
		})
	})

	describe('unhappy paths', () => {
		test('invalid body', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			const res = global.createMockRes()

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.BAD_REQUEST)
		})

		test('invalid from datetime', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			const res = global.createMockRes()

			req.body = {
				date: '2000-00-00',
				from_time: '07:00',
				to_time: '19:00',
			}

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.BAD_REQUEST)
			expect(res.send).toBeCalledWith(ERROR.INVALID_FROM_DT)
		})

		test('invalid to datetime', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			const res = global.createMockRes()
			Validator.validate = jest.fn()

			req.body = {
				date: '2000-01-01',
				from_time: '07:00',
				to_time: '44:44',
			}

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.BAD_REQUEST)
			expect(res.send).toBeCalledWith(ERROR.INVALID_TO_DT)
		})

		test('too far from now', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			const res = global.createMockRes()
			moment.now = jest.fn().mockReturnValue(+new Date('2000-01-01T07:00:00'))

			req.body = {
				date: '2000-02-01',
				from_time: '07:00',
				to_time: '19:00',
			}

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.BAD_REQUEST)
			expect(res.send).toBeCalledWith(ERROR.TOO_FAR_FROM_NOW)
		})

		test('job exists', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			const res = global.createMockRes()

			ApiHelper.checkUser = jest.fn().mockReturnValue({
				username: SEEDS[DB.JOBS][0].username,
			})
			await global.seedDatabase(DB.JOBS)
			await global.seedDatabase(DB.USERS)

			moment.now = jest.fn().mockReturnValue(+new Date('2000-01-01T07:00:00'))
			req.body = {
				date: '2000-01-01',
				from_time: '07:00',
				to_time: '19:00',
			}

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.BAD_REQUEST)
			expect(res.send).toBeCalledWith(ERROR.JOB_EXISTS)
		})

		test('reached max active job', async () => {
			// Arrange
			const req = global.createMockReq(HTTP_METHOD.POST)
			const res = global.createMockRes()

			const job = structuredClone(SEEDS[DB.JOBS][0])
			delete job._id
			ApiHelper.checkUser = jest.fn().mockReturnValue({
				username: job.username,
			})

			const { db } = await MongoHelper.connectToDatabase()
			const data = new Array(LIMIT.MAX_ACTIVE_JOB_COUNT).fill().map(() => structuredClone(job))
			await db.collection(DB.JOBS).insertMany(data)

			moment.now = jest.fn().mockReturnValue(+new Date('2000-01-01T07:00:00'))
			req.body = {
				date: '2000-01-02',
				from_time: '07:00',
				to_time: '19:00',
			}

			// Action
			await handler(req, res)

			// Assert
			expect(res.status).toBeCalledWith(HTTP_STATUS.BAD_REQUEST)
			expect(res.send).toBeCalledWith(ERROR.REACHED_MAX_ACTIVE_JOB)
		})
	})
})