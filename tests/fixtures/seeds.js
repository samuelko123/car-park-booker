import {
	DB,
	JOB_STATUS,
	LOG_LEVEL,
} from '../../src/utils/constants'

export const MOCK_DATE = {
	NOW: 1234567890123,
}

export const SEEDS = {
	[DB.JOBS]: [
		{
			username: 'john_doe@example.com',
			status: JOB_STATUS.ACTIVE,
			run_count: 0,
			last_run_at: new Date(),
			created_at: new Date(),
			from_dt: new Date('2000-01-01T07:00:00Z'),
			to_dt: new Date('2000-01-01T19:00:00Z'),
		},
		{
			username: 'jane_doe@example.com',
			status: JOB_STATUS.EXPIRED,
			run_count: 0,
			last_run_at: new Date(),
			created_at: new Date(),
			from_dt: new Date('2000-01-01T07:00:00Z'),
			to_dt: new Date('2000-01-01T19:00:00Z'),
		},
		{
			username: 'joe_doe@example.com',
			status: JOB_STATUS.ACTIVE,
			run_count: 0,
			last_run_at: new Date(),
			created_at: new Date(),
			from_dt: new Date('2000-01-01T07:00:00Z'),
			to_dt: new Date('2000-01-01T19:00:00Z'),
		},
	],
	[DB.LOGS]: [
		{
			timestamp: new Date(),
			level: LOG_LEVEL.INFO,
			message: 'Logging in',
		},
	],
	[DB.USERS]: [
		{
			username: 'john_doe@example.com',
			hash: 'password hash',
			last_active_at: new Date(),
		},
	],
}