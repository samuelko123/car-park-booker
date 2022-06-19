import cookie from 'cookie'

export class CookieHelper {
	static setCookie(res, cookie_obj, path, maxAge) {
		const cookie_array = Object.keys(cookie_obj)
			.map(key => {
				return cookie.serialize(key, cookie_obj[key], {
					httpOnly: true,
					maxAge: maxAge, // in seconds
					path: path, // only send cookie if path is included in url
					secure: true,
					sameSite: 'lax',
				})
			})

		res.setHeader('Set-Cookie', cookie_array)
	}

	static deleteCookie(res, cookie_obj) {
		this.setCookie(res, cookie_obj, '/', -1)
	}
}