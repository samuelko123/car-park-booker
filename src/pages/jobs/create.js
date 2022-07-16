import React from 'react'
import moment from 'moment'
import { useRouter } from 'next/router'
import { BaseDropdown } from '../../components/Dropdowns'
import {
	BackButton,
	BaseButton,
} from '../../components/Buttons'
import {
	HTTP_METHOD,
	UI_TEXT,
} from '../../utils/constants'
import { useAjaxRequest } from '../../hooks/useAjaxRequest'
import { ErrorAlert } from '../../components/Alerts'
import { Stack } from '@mui/material'
import {
	BaseTextField,
	ReadOnlyField,
} from '../../components/TextFields'
import { AuthContext } from '../../components/AuthProvider'
import { BaseLink } from '../../components/Link'

export default function Page() {
	const router = useRouter()
	const date = router.query?.date || moment().format('YYYY-MM-DD')

	const times = [...Array(48).keys()].map((index) => {
		const momentObj = moment().startOf('day').add(index * 30, 'minutes')

		return {
			label: momentObj.format('HH:mm'),
			value: momentObj.format('HH:mm'),
		}
	})

	const [fromTime, setFromTime] = React.useState('07:00')
	const [toTime, setToTime] = React.useState('19:00')
	const [licPlate, setLicPlate] = React.useState('')
	const [isLicPlateMissing, setIsLicPlateMissing] = React.useState(false)
	const [errMsg, isLoading, sendRequest] = useAjaxRequest()
	const { user } = React.useContext(AuthContext)

	React.useEffect(() => {
		setLicPlate(user?.lic_plate || '')
	}, [user])

	const handleLicPlateChange = (val) => {
		setLicPlate(val.toUpperCase())
	}

	const handleSubmit = async () => {
		if (!licPlate) {
			setIsLicPlateMissing(true)
			return
		} else {
			setIsLicPlateMissing(false)
		}

		const request = {
			url: '/api/jobs',
			method: HTTP_METHOD.POST,
			data: {
				date: date,
				from_time: fromTime,
				to_time: toTime,
				lic_plate: licPlate,
			},
		}

		await sendRequest(request, () => {
			router.push('/jobs')
		})
	}

	return (
		<Stack
			gap={2}
			component='form'
		>
			<BaseLink href='/jobs'>
				<BackButton>
					{UI_TEXT.BACK}
				</BackButton>
			</BaseLink>
			{errMsg && <ErrorAlert>{errMsg}</ErrorAlert>}
			<ReadOnlyField
				fullWidth
				label='username'
				value={user?.username || ''}
				InputLabelProps={{ shrink: true }}
			/>
			<BaseTextField
				label='license plate'
				value={licPlate}
				onChange={handleLicPlateChange}
				InputLabelProps={{ shrink: true }}
				required={true}
				error={isLicPlateMissing}
			/>
			<ReadOnlyField
				fullWidth
				label='date'
				value={date}
				InputLabelProps={{ shrink: true }}
			/>
			<BaseDropdown
				label='from'
				value={fromTime}
				onChange={setFromTime}
				options={times}
			/>
			<BaseDropdown
				label='to'
				value={toTime}
				onChange={setToTime}
				options={times}
			/>
			<BaseButton
				variant='contained'
				onClick={handleSubmit}
				loading={isLoading}
				type='submit'
			>
				{UI_TEXT.CREATE_JOB}
			</BaseButton>
		</Stack>
	)
}
