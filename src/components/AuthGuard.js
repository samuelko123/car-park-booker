import React from 'react'
import { CircularProgress } from '@mui/material'
import { ErrorAlert } from './Alerts'
import { AuthContext } from './AuthProvider'
import { LoginWidget } from './LoginWidget'

export const AuthGuard = (props) => {
	const { children } = props

	const {
		user,
		error,
		loading,
	} = React.useContext(AuthContext)
	const isClientSide = (typeof window !== 'undefined')

	if (loading) {
		return <CircularProgress />
	}

	if (error) {
		return <ErrorAlert>{error}</ErrorAlert>
	}

	if (isClientSide && !loading && !user) {
		return <LoginWidget />
	}

	return children
}