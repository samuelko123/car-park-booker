import React from 'react'
import axios from 'axios'
import { HTTP_METHOD } from '../utils/constants'

export const useUser = () => {
	const [user, setUser] = React.useState(null)
	const [errMsg, setErrMsg] = React.useState(null)
	const [isLoading, setLoading] = React.useState(false)

	React.useEffect(() => {
		async function sendRequest() {
			try {
				setErrMsg(null)
				setLoading(true)
				const request = {
					url: '/api/session',
					method: HTTP_METHOD.GET,
				}
				const res = await axios.request(request)
				setUser(res.data)
			} catch (err) {
				setErrMsg(err)
			} finally {
				setLoading(false)
			}
		}
		sendRequest()
	}, [])

	return [errMsg, isLoading, user]
}