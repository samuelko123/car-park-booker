import React from 'react'
import { CircularProgress } from '@mui/material'
import { ErrorAlert } from './Alerts'
import { AuthContext } from './AuthProvider'
import { LoginWidget } from './LoginWidget'
import { ERROR } from '../utils/constants'

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
		return <ErrorAlert>{error?.message || ERROR.UNKNOWN}</ErrorAlert>
	}

	if (isClientSide && !loading && !user) {
		return <LoginWidget />
	}

	return children
}