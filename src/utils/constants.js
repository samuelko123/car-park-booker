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
	BACK: 'Back',
	BOOK_NOW: 'Book Now',
	CREATE_JOB: 'Create Job',
	DELETE: 'Delete',
	LOGIN: 'Login',
	LOGOUT: 'Logout',
	JOB_CREATE_SUCCESS: 'Job created successfully',
}

export const JOB_STATUS = {
	ACTIVE: 'Active',
	EXPIRED: 'Expired',
	FAILED: 'Failed',
	SUCCEEDED: 'Succeeded',
}

export const LIMIT = {
	AVAILABLE_DAYS_IN_ADVANCE: 21,
	MAX_ACTIVE_JOB_COUNT: 6,
	MAX_JOB_RUN_DELAY_MS: 25 * 60 * 1000, // 25 mins.
	WEBHOOK_TOKEN_LENGTH: 128,
	WEBHOOK_TIMESTAMP_AGE: 1 * 60 * 1000, // 1 min.
}

export const ERROR = {
	BAD_REQUEST: 'Bad Request',
	CANNOT_DELETE_NON_ACTIVE_JOB: 'You can only delete active jobs',
	FORBIDDEN: 'You do not have permission to view this resource',
	INCORRECT_CREDENTIALS: 'The username or password your entered is incorrect',
	INCORRECT_HASH: 'Incorrect credentials',
	INVALID_FROM_DT: 'Invalid "from" date/time',
	INVALID_ID: 'Invalid id',
	INVALID_TIMESTAMP: 'Invalid timestamp',
	INVALID_TO_DT: 'Invalid "to" date/time',
	INVALID_TOKEN: 'Invalid token',
	INVALID_SIGNATURE: 'Invalid signature',
	JOB_EXISTS: 'Job already exists',
	JOB_EXPIRED: 'Job expired',
	METHOD_NOT_ALLOWED: 'HTTP method not allowed',
	MISSING_HASH: 'Missing hash',
	MISSING_SESSION_TOKEN: 'Missing session token',
	MISSING_SIGNATURE: 'Missing signature',
	MISSING_TIMESTAMP: 'Missing timestamp',
	MISSING_TOKEN: 'Missing token',
	MISSING_USERNAME: 'Missing username',
	NOT_FOUND: 'Resource does not exist',
	REACHED_MAX_ACTIVE_JOB: `You can have up to ${LIMIT.MAX_ACTIVE_JOB_COUNT} active jobs at a time`,
	SERVER_ERROR: 'Oops, something went wrong, please try again later.',
	TIMESTAMP_TOO_NEW: 'Timestamp cannot be in the future',
	TIMESTAMP_TOO_OLD: 'Timestamp is too old',
	TOO_FAR_FROM_NOW: `You can only book up to ${LIMIT.AVAILABLE_DAYS_IN_ADVANCE} days from now`,
	UNAUTHORIZED: 'Please login to continue',
	USER_NOT_FOUND: 'User not found',
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