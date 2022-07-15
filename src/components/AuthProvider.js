import React from 'react'
import axios from 'axios'
import useSWR from 'swr'

export const AuthContext = React.createContext({})

export const AuthProvider = (props) => {
	const { children } = props

	const fetcher = url => axios.get(url).then(res => res.data)
	const {
		data: user,
		error,
	} = useSWR('/api/session', fetcher)

	return (
		<AuthContext.Provider
			value={{
				user: user,
				error: error,
				loading: user === undefined,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}