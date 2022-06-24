import { MongoMemoryReplSet } from 'mongodb-memory-server'

export default async function setup() {
	// start a mongodb server instance
	global.mongod = await MongoMemoryReplSet.create({
		replSet: {
			count: 1,
			storageEngine: 'wiredTiger',
		},
	})

	process.env.MONGO_URI = global.mongod.getUri()
}