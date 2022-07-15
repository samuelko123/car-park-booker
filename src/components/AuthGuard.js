import React from 'react'
import { CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'
import { ErrorAlert } from './Alerts'
import { AuthContext } from './AuthProvider'

export const AuthGuard = (props) => {
	const router = useRouter()
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

	if (isClientSide && !loading) {
		if (!user && router.asPath !== '/login') {
			router.push('/login')
		} else if (
			user && (
				router.asPath === '/' ||
				router.asPath === '/login'
			)
		) {
			router.push('/jobs')
		}
	}

	return children
}