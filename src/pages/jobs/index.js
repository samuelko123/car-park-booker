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
import { ErrorAlert } from '../../components/Alerts'
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	CircularProgress,
	Link,
	Stack,
	Typography,
} from '@mui/material'
import { JobList } from '../../components/lists/JobList'
import {
	BaseTextField,
	ReadOnlyField,
} from '../../components/TextFields'
import { useUser } from '../../hooks/useUser'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

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
	const [licPlate, setLicPlate] = React.useState('')
	const [isLicPlateMissing, setIsLicPlateMissing] = React.useState(false)
	const [errMsg, isLoading, sendRequest] = useAjaxRequest()
	const [fetchErrMsg, isFetching, sendFetchingRequest] = useAjaxRequest()
	const [, isFetchingUser, user] = useUser()

	React.useEffect(() => {
		if (!!user?.lic_plate) {
			setLicPlate(user.lic_plate)
		}
	}, [user])

	const handleLicPlateChange = (val) => {
		setLicPlate(val.toUpperCase())
	}

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
		<Stack
			gap={2}
			component='form'
		>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography variant='h6'>Instructions</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						1. Create a job
					</Typography>
					<Typography>
						2. The system will run the job from time to time
					</Typography>
					<Typography>
						3.1. If you get a spot, you will receive an email from {process.env.NEXT_PUBLIC_PARKING_PROVIDER}
					</Typography>
					<Typography>
						3.2. If the job failed, you can re-create the job to try again
					</Typography>
					<Typography>
						4. [Optional] <Link target='_blank' href='https://www.buymeacoffee.com/samuelko'>Buy me a coffee</Link>
					</Typography>
				</AccordionDetails>
			</Accordion>
			{errMsg && <ErrorAlert>{errMsg}</ErrorAlert>}
			<ReadOnlyField
				fullWidth
				label='username'
				value={isFetchingUser ? 'Loading...' : (user?.username || '')}
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
			<BaseDropdown
				label='date'
				value={date}
				onChange={setDate}
				options={dates}
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
