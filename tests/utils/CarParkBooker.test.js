process.env.TEST_SUITE = __filename

import superagent from 'superagent'
import { ERROR } from '../../src/utils/constants'
import { CarParkBooker } from '../../src/utils/CarParkBooker'

describe('Car Park Booker', () => {
	describe('login', () => {
		test('login successfully', async () => {
			// Arrange
			const mock_html = '<html><head><title>Home</title></head></html>'
			superagent.agent = jest.fn().mockImplementation(() => {
				return global.createMockAgent(mock_html)
			})
			const booker = new CarParkBooker('test user', 'test password')

			// Action
			const fn = async () => await booker.login()

			// Assert
			await expect(fn).not.toThrow()
		})

		test('login failed', async () => {
			// Arrange
			const mock_html = '<html><head><title>Login</title></head></html>'
			superagent.agent = jest.fn().mockImplementation(() => {
				return global.createMockAgent(mock_html)
			})
			const booker = new CarParkBooker('test user', 'test password')

			// Action
			const fn = async () => await booker.login()

			// Assert
			await expect(fn).rejects.toThrow(ERROR.INCORRECT_CREDENTIALS)
		})
	})

	describe('book car park', () => {
		test('booked successfully', async () => {
			// Arrange
			const mock_html = `
				<html>
				<head>
					<title>Home</title>
				</head>
				<body>
					<form>
						<input name="RateGroupID" value="123" />
					</form>
				</body>
				</html>
			`
			superagent.agent = jest.fn().mockImplementation(() => {
				return global.createMockAgent(mock_html)
			})
			const booker = new CarParkBooker()
			booker._get_lic_plate = jest.fn()
			booker._logger = {
				log: jest.fn(),
			}

			// Action
			const fn = async () => await booker.book_car_park('2000-01-01 07:00:00', '2000-01-01 19:00:00')

			// Assert
			await expect(fn).not.toThrow()
		})

		test('repeated booking', async () => {
			// Arrange
			const mock_error = 'overlapping booking'
			const mock_html = `
				<html>
				<head>
					<title>Home</title>
				</head>
				<body>
					<form>
						<input name="RateGroupID" value="123" />
					</form>
					<div class="validation-summary-errors">${mock_error}</div>
				</body>
				</html>
			`
			superagent.agent = jest.fn().mockImplementation(() => {
				return global.createMockAgent(mock_html)
			})
			const booker = new CarParkBooker()
			booker._get_lic_plate = jest.fn()
			booker._logger = {
				log: jest.fn(),
			}

			// Action
			const fn = async () => await booker.book_car_park('2000-01-01 07:00:00', '2000-01-01 19:00:00')

			// Assert
			await expect(fn).rejects.toThrow(mock_error)
		})

		test('no bay', async () => {
			// Arrange
			const mock_error = 'car park is full'
			const mock_html = `
				<html>
				<head>
					<title>Home</title>
				</head>
				<body>
					<form>
						<input name="RateGroupID" value="123" />
					</form>
					<div class="validation-summary-errors">${mock_error}</div>
				</body>
				</html>
			`
			superagent.agent = jest.fn().mockImplementation(() => {
				return global.createMockAgent(mock_html)
			})
			const booker = new CarParkBooker()
			booker._get_lic_plate = jest.fn()
			booker._logger = {
				log: jest.fn(),
			}

			// Action
			const fn = async () => await booker.book_car_park('2000-01-01 07:00:00', '2000-01-01 19:00:00')

			// Assert
			await expect(fn).rejects.toThrow(mock_error)
		})
	})
})