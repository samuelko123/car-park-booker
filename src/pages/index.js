import React from 'react'
import Head from 'next/head'
import moment from 'moment'
import {
	BaseTextField,
	ReadOnlyField,
} from '../components/TextFields'
import { BaseDropdown } from '../components/Dropdowns'
import { BaseButton } from '../components/Buttons'
import {
	HTTP_METHOD,
	MESSAGE,
} from '../utils/constants'
import { useAjaxRequest } from '../hooks/useAjaxRequest'
import {
	ErrorAlert,
	InfoAlert,
	SuccessAlert,
} from '../components/Alerts'

export default function Page() {
	const dates = [...Array(14).keys()].map((index) => {
		const momentObj = moment().add(index + 1, 'days')

		// skip weekend
		const weekday = momentObj.weekday()
		if ([0, 6].includes(weekday)) {
			return null
		}

		return {
			label: momentObj.format('YYYY.MM.DD ddd'),
			value: momentObj.format('YYYY.MM.DD'),
		}
	}).filter(elem => !!elem)

	const [username, setUsername] = React.useState('')
	const [password, setPassword] = React.useState('')
	const [date, setDate] = React.useState(dates[0].value)
	const [successMsg, setSuccessMsg] = React.useState('')
	const [infoMsg, setInfoMsg] = React.useState('')
	const [errMsg, isLoading, sendRequest] = useAjaxRequest()

	const handleSubmit = async () => {
		setSuccessMsg('')
		setInfoMsg('')

		const request = {
			url: '/api/booking',
			method: HTTP_METHOD.POST,
			data: {
				username: username,
				password: password,
				date: date,
			},
		}

		await sendRequest(request, (res) => {
			if (res.data === MESSAGE.BOOKING_SUCCESS) {
				setSuccessMsg(res.data)
			} else {
				setInfoMsg(res.data)
			}
		})
	}

	return (
		<>
			<Head>
				<title>{process.env.NEXT_PUBLIC_APP_TITLE}</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>

			{errMsg && <ErrorAlert>{errMsg}</ErrorAlert>}
			{infoMsg && <InfoAlert>{infoMsg}</InfoAlert>}
			{successMsg && <SuccessAlert>{successMsg}</SuccessAlert>}

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
			<BaseDropdown
				label='Date'
				value={date}
				onChange={setDate}
				options={dates}
			/>
			<ReadOnlyField
				label='From'
				value='07:00:00'
			/>
			<ReadOnlyField
				label='To'
				value='19:00:00'
			/>
			<BaseButton
				variant='contained'
				onClick={handleSubmit}
				loading={isLoading}
			>
				{MESSAGE.BOOK_NOW}
			</BaseButton>
		</>
	)
}
