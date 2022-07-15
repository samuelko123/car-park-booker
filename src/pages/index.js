import React from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../components/AuthProvider'

export default function Page() {
	const router = useRouter()
	const { user } = React.useContext(AuthContext)

	React.useEffect(() => {
		if (user) {
			router.push('/jobs')
		}
	}, [user, router])
}