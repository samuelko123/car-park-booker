import { CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'
import { useUser } from '../hooks/useUser'

export const AuthGuard = (props) => {
	const router = useRouter()
	const [, isLoading, user] = useUser()
	const { children } = props

	if (typeof window !== 'undefined' && !isLoading) {
		if (!user && router.asPath !== '/login') {
			router.push('/login')
		}

		if (
			user && (
				router.asPath === '/' ||
				router.asPath === '/login'
			)
		) {
			router.push('/jobs')
		}
	}

	return (
		<>
			{isLoading && <CircularProgress />}
			{!isLoading &&
				<>
					{(
						(!user && router.asPath === '/login') ||
						(user && router.asPath !== '/login')
					) &&
						children
					}
				</>
			}
		</>
	)
}