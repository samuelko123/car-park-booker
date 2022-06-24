export default async function teardown() {
	// stop a mongodb server instance
	await global.mongod.stop()
}