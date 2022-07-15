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
import { Stack } from '@mui/material'
import { AuthContext } from '../components/AuthProvider'

export default function Page() {
	const router = useRouter()
	const [errMsg, isLoading, sendRequest] = useAjaxRequest()
	const { user } = React.useContext(AuthContext)

	React.useEffect(() => {
		if (!!user) {
			router.push('/jobs')
		}
	}, [user, router])

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
