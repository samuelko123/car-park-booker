import React from 'react'
import { useRouter } from 'next/router'
import { BaseTextField } from '../components/TextFields'
import { BaseButton } from '../components/Buttons'
import {
	HTTP_METHOD,
	UI_TEXT,
} from '../utils/constants'
import { useAjaxRequest } from '../hooks/useAjaxRequest'
import {
	ErrorAlert,
	InfoAlert,
} from '../components/Alerts'

export default function Page() {
	const router = useRouter()
	const [errMsg, isLoading, sendRequest] = useAjaxRequest()

	const [username, setUsername] = React.useState('')
	const [password, setPassword] = React.useState('')

	const handleSubmit = async () => {
		const request = {
			url: '/api/login',
			method: HTTP_METHOD.POST,
			data: {
				username: username,
				password: password,
			},
		}

		await sendRequest(request, () => {
			router.push('/')
		})
	}

	return (
		<>
			{errMsg && <ErrorAlert>{errMsg}</ErrorAlert>}
			<InfoAlert>
				Please login with your {process.env.NEXT_PUBLIC_PARKING_PROVIDER} credentials
			</InfoAlert>
			<BaseTextField
				label='Username'
				value={username}
				onChange={setUsername}
			/>
			<BaseTextField
				type='password'
				label='Password'
				value={password}
				onChange={setPassword}
			/>
			<BaseButton
				variant='contained'
				onClick={handleSubmit}
				loading={isLoading}
			>
				{UI_TEXT.LOGIN}
			</BaseButton>
		</>
	)
}
