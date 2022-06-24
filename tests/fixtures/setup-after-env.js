import { MongoHelper } from '../../src/utils/MongoHelper'
import { SEEDS } from './seeds'

beforeAll(async () => {
	// create a db for each test suite
	const path = require('path')
	process.env.MONGO_DB_NAME = 'db-' + path.basename(process.env.TEST_SUITE).split('.').join('-')

	// req factory
	global.createMockReq = (method) => {
		return {
			method: method,
			query: {},
			params: {},
			headers: {},
			body: {},
			session: {},
			cookies: {},
		}
	}

	// res factory
	global.createMockRes = () => {
		const res = {}
		res.status = jest.fn().mockReturnValue(res)
		res.json = jest.fn().mockReturnValue(res)
		res.send = jest.fn()
		res.end = jest.fn()
		res.setHeader = jest.fn()
		res.redirect = jest.fn()
		return res
	}

	// seeding helper
	global.seedDatabase = async (collection_name) => {
		const { db } = await MongoHelper.connectToDatabase()
		// const data = structuredClone(SEEDS[collection_name])
		const data = SEEDS[collection_name]
		await db.collection(collection_name).insertMany(data)
	}
})

beforeEach(async () => {
	await MongoHelper.clearDatabase()
})

afterAll(async () => {
	await new Promise(process.nextTick)
	await MongoHelper.disconnectFromDatabase()
})