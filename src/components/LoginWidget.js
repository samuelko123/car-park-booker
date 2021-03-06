import React from 'react'
import { useRouter } from 'next/router'
import { BaseTextField } from './TextFields'
import { BaseButton } from './Buttons'
import {
	HTTP_METHOD,
	UI_TEXT,
} from '../utils/constants'
import { useAjaxRequest } from '../hooks/useAjaxRequest'
import {
	ErrorAlert,
	InfoAlert,
} from './Alerts'
import { Stack } from '@mui/material'

export const LoginWidget = () => {
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
			router.reload()
		})
	}

	return (
		<>
			{errMsg && <ErrorAlert>{errMsg}</ErrorAlert>}
			<InfoAlert>
				{`Please login with your ${process.env.NEXT_PUBLIC_PARKING_PROVIDER} credentials`}
			</InfoAlert>
			<Stack gap={2} component='form'>
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
					type='submit'
				>
					{UI_TEXT.LOGIN}
				</BaseButton>
			</Stack>
		</>
	)
}