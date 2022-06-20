export const HTTP_METHOD = {
	GET: 'GET',
	POST: 'POST',
	PATCH: 'PATCH',
	DELETE: 'DELETE',
}

export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	SERVER_ERROR: 500,
}

export const LOG_LEVEL = {
	ERROR: 'error',
	WARN: 'warn',
	INFO: 'info',
	HTTP: 'http',
	DEBUG: 'debug',
}

export const DB = {
	JOBS: 'jobs',
	LOGS: 'logs',
	USERS: 'users',
}

export const UI_TEXT = {
	BOOKING_SUCCESS: 'Booked successfully',
	BOOK_NOW: 'Book Now',
	CREATE_JOB: 'Create Job',
	DELETE: 'Delete',
	LOGIN: 'Login',
	JOB_CREATE_SUCCESS: 'Job created successfully',
}

export const JOB_STATUS = {
	ACTIVE: 'Active',
	EXPIRED: 'Expired',
	FAILED: 'Failed',
	SUCCEEDED: 'Succeeded',
}

export const LIMIT = {
	MAX_ACTIVE_JOB_COUNT: 6,
	MAX_JOB_RUN_DELAY_MS: 25 * 60 * 1000,
}

export const ERROR = {
	BAD_REQUEST: 'Bad Request',
	INCORRECT_CREDENTIALS: 'The username or password your entered is incorrect',
	INVALID_FROM_DT: 'Invalid "from" date/time',
	INVALID_ID: 'Invalid id',
	INVALID_TO_DT: 'Invalid "to" date/time',
	JOB_EXISTS: 'Job already exists',
	METHOD_NOT_ALLOWED: 'HTTP method not allowed',
	REACHED_MAX_ACTIVE_JOB: `You can have up to ${LIMIT.MAX_ACTIVE_JOB_COUNT} active jobs at a time`,
	SERVER_ERROR: 'Oops, something went wrong, please try again later.',
	UNAUTHORIZED: 'Please login to continue',
}

// https://bunnings.ubipark.com/State/GetList?countryID=1
export const STATE_ID = {
	ACT: 3,
	NSW: 2,
	NT: 7,
	QLD: 4,
	SA: 6,
	TAS: 5,
	VIC: 1,
	WA: 8,
}

// https://bunnings.ubipark.com/BookNow/GetCarParkList?rateGroupID=70
export const CAR_PARK_ID = {
	BOT3: 9803,
	BOT9: 9836,
}