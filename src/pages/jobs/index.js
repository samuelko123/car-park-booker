import React from 'react'
import moment from 'moment'
import { BaseDropdown } from '../../components/Dropdowns'
import { BaseButton } from '../../components/Buttons'
import {
	HTTP_METHOD,
	HTTP_STATUS,
	LIMIT,
	UI_TEXT,
} from '../../utils/constants'
import { useAjaxRequest } from '../../hooks/useAjaxRequest'
import {
	ErrorAlert,
	InfoAlert,
} from '../../components/Alerts'
import {
	Box,
	CircularProgress,
	Stack,
} from '@mui/material'
import { JobList } from '../../components/lists/JobList'
import { ReadOnlyField } from '../../components/TextFields'
import { useUser } from '../../hooks/useUser'

export default function Page() {
	const dates = [...Array(LIMIT.AVAILABLE_DAYS_IN_ADVANCE).keys()].map((index) => {
		const momentObj = moment().add(index + 1, 'days')

		// skip weekend
		const weekday = momentObj.weekday()
		if ([0, 6].includes(weekday)) {
			return null
		}

		return {
			label: momentObj.format('YYYY-MM-DD (ddd)'),
			value: momentObj.format('YYYY-MM-DD'),
		}
	}).filter(elem => !!elem)

	const times = [...Array(48).keys()].map((index) => {
		const momentObj = moment().startOf('day').add(index * 30, 'minutes')

		return {
			label: momentObj.format('HH:mm'),
			value: momentObj.format('HH:mm'),
		}
	})

	const [data, setData] = React.useState([])
	const [date, setDate] = React.useState(dates[0].value)
	const [fromTime, setFromTime] = React.useState('07:00')
	const [toTime, setToTime] = React.useState('19:00')
	const [errMsg, isLoading, sendRequest] = useAjaxRequest()
	const [fetchErrMsg, isFetching, sendFetchingRequest] = useAjaxRequest()
	const [, isFetchingUser, user] = useUser()

	const handleFetchData = React.useCallback(async () => {
		const request = {
			url: '/api/jobs',
			method: HTTP_METHOD.GET,
		}

		await sendFetchingRequest(request, (res) => {
			setData(res.data)
		})
	}, [sendFetchingRequest])

	const handleSubmit = async () => {
		const request = {
			url: '/api/jobs',
			method: HTTP_METHOD.POST,
			data: {
				date: date,
				from_time: fromTime,
				to_time: toTime,
			},
		}

		await sendRequest(request, (res) => {
			if (res.status === HTTP_STATUS.CREATED) {
				handleFetchData()
			}
		})
	}

	React.useEffect(() => {
		handleFetchData()
	}, [handleFetchData])

	return (
		<Stack gap={2}>
			{errMsg && <ErrorAlert>{errMsg}</ErrorAlert>}
			<InfoAlert>
				The system will try to book car park for active jobs for every half an hour.
			</InfoAlert>
			<ReadOnlyField
				fullWidth
				label='username'
				value={isFetchingUser ? 'Loading...' : (user?.username || '')}
				InputLabelProps={{ shrink: true }}
			/>
			<BaseDropdown
				label='Date'
				value={date}
				onChange={setDate}
				options={dates}
			/>
			<BaseDropdown
				label='From'
				value={fromTime}
				onChange={setFromTime}
				options={times}
			/>
			<BaseDropdown
				label='To'
				value={toTime}
				onChange={setToTime}
				options={times}
			/>
			<BaseButton
				variant='contained'
				onClick={handleSubmit}
				loading={isLoading}
			>
				{UI_TEXT.CREATE_JOB}
			</BaseButton>
			{isFetching && <CircularProgress />}
			{!isFetching &&
				<Box sx={{ width: '100%' }}>
					{fetchErrMsg && <ErrorAlert>{fetchErrMsg}</ErrorAlert>}
					<JobList
						data={data}
						onDelete={handleFetchData}
					/>
				</Box>
			}
		</Stack>
	)
}
