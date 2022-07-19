process.env.TEST_SUITE = __filename

import moment from 'moment'
import { ObjectId } from 'mongodb'
import { JobDAO } from '../../src/dao/JobDAO'
import {
	CarParkBooker,
	NoBayError,
} from '../../src/utils/CarParkBooker'
import {
	ERROR,
	JOB_STATUS,
	UI_TEXT,
} from '../../src/utils/constants'
import { JobRunner } from '../../src/utils/JobRunner'
import { Logger } from '../../src/utils/Logger'

jest.mock('../../src/utils/CarParkBooker')
jest.mock('../../src/utils/Logger')
jest.mock('../../src/dao/JobDAO')

describe('Job Runner', () => {
	describe('happy paths', () => {
		test('booked successfully', async () => {
			// Arrange
			const job = {
				_id: new ObjectId(),
				from_dt: new Date('2000-01-10T07:00:00Z'),
				to_dt: new Date('2000-01-10T19:00:00Z'),
				username: 'john_doe@example.com',
				hash: 'password hash',
			}
			moment.now = jest.fn().mockReturnValue(+new Date('2000-01-01T07:00:00'))

			// Action
			await JobRunner.run(job)

			// Assert
			expect(Logger.info).toBeCalledWith({
				job_id: job._id,
				message: UI_TEXT.BOOKING_SUCCESS,
			})
			expect(JobDAO.updateById).toBeCalledWith(
				job._id,
				expect.objectContaining({ status: JOB_STATUS.SUCCEEDED }),
			)
		})
	})

	describe('unhappy paths', () => {
		test('expired job', async () => {
			// Arrange
			const job = {
				_id: new ObjectId(),
				from_dt: new Date('2000-01-01T07:00:00Z'),
			}
			moment.now = jest.fn().mockReturnValue(+new Date('2000-01-01T07:00:00'))

			// Action
			await JobRunner.run(job)

			// Assert
			expect(JobDAO.updateById).toBeCalledWith(
				job._id,
				expect.objectContaining({ status: JOB_STATUS.EXPIRED }),
			)
			expect(Logger.error).toBeCalledWith({
				job_id: job._id,
				message: ERROR.JOB_EXPIRED,
			})
		})

		test('no bay', async () => {
			// Arrange
			const job = {
				_id: new ObjectId(),
				from_dt: new Date('2000-01-10T07:00:00Z'),
			}
			moment.now = jest.fn().mockReturnValue(+new Date('2000-01-01T07:00:00'))
			const mock_error = new NoBayError('no bay')
			CarParkBooker.prototype.book_car_park = jest.fn().mockImplementation(() => { throw mock_error })

			// Action
			await JobRunner.run(job)

			// Assert
			expect(JobDAO.updateById).toBeCalledWith(
				job._id,
				expect.objectContaining({ status: JOB_STATUS.ACTIVE }),
			)
			expect(Logger.info).toBeCalledWith({
				job_id: job._id,
				message: mock_error.message,
			})
		})

		test('unknown error', async () => {
			// Arrange
			const job = {
				_id: new ObjectId(),
				from_dt: new Date('2000-01-10T07:00:00Z'),
			}
			moment.now = jest.fn().mockReturnValue(+new Date('2000-01-01T07:00:00'))
			const mock_error = new Error('unknown error')
			CarParkBooker.prototype.book_car_park = jest.fn().mockImplementation(() => { throw mock_error })

			// Action
			await JobRunner.run(job)

			// Assert
			expect(JobDAO.updateById).toBeCalledWith(
				job._id,
				expect.objectContaining({ status: JOB_STATUS.FAILED }),
			)
			expect(Logger.error).toBeCalledWith({
				job_id: job._id,
				message: mock_error.message,
			})
		})
	})
})