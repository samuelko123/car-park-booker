import React from 'react'
import { useRouter } from 'next/router'
import {
	HTTP_METHOD,
	HTTP_STATUS,
} from '../utils/constants'
import { useAjaxRequest } from '../hooks/useAjaxRequest'
import { ErrorAlert } from '../components/Alerts'
import { CircularProgress } from '@mui/material'

export default function Page() {
	const router = useRouter()
	const [errMsg, isLoading, sendRequest] = useAjaxRequest()

	const handleSubmit = React.useCallback(async () => {
		const request = {
			url: '/api/session',
			method: HTTP_METHOD.GET,
		}

		await sendRequest(request, (res) => {
			if (res.status === HTTP_STATUS.OK) {
				router.push('/jobs')
			} else {
				router.push('/login')
			}
		})
	}, [router, sendRequest])

	React.useEffect(() => {
		handleSubmit()
	}, [handleSubmit])

	return (
		<>
			{isLoading && <CircularProgress />}
			{errMsg && <ErrorAlert>{errMsg}</ErrorAlert>}
		</>
	)
}
