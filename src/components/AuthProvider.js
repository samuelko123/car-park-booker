import axios from 'axios'
import React from 'react'
import { HTTP_METHOD } from '../utils/constants'

export const AuthContext = React.createContext({})

export const AuthProvider = (props) => {
	const { children } = props

	const [user, setUser] = React.useState(null)
	const [error, setError] = React.useState(null)
	const [loading, setLoading] = React.useState(true)

	React.useEffect(() => {
		async function sendRequest() {
			try {
				setError(null)
				setLoading(true)
				const request = {
					url: '/api/session',
					method: HTTP_METHOD.GET,
				}
				const res = await axios.request(request)
				setUser(res.data)
			} catch (err) {
				setError(err)
			} finally {
				setLoading(false)
			}
		}
		sendRequest()
	}, [])

	return (
		<AuthContext.Provider
			value={{
				user: user,
				error: error,
				loading: loading,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}