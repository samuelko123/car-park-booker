import React from 'react'
import axios from 'axios'
import useSWR from 'swr'
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	CircularProgress,
	Link,
	Stack,
	Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { DateList } from '../../components/lists/DateList'
import { ErrorAlert } from '../../components/Alerts'

export default function Page() {
	const fetcher = url => axios.get(url).then(res => res.data)
	const {
		data: dates,
		error,
		isValidating,
	} = useSWR('/api/bookings', fetcher)

	if (dates === undefined) {
		return <CircularProgress />
	}

	return (
		<>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography variant='h6'>Instructions</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						1. Click on a date that you want to book
					</Typography>
					<Typography>
						2. Create a job
					</Typography>
					<Typography>
						3. The system will try to book from time to time
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
			{error && <ErrorAlert>{error}</ErrorAlert>}
			<Stack flexDirection='row' gap={2}>
				<Typography variant='h6'>Upcoming</Typography>
				{isValidating && <CircularProgress size='2rem' />}
			</Stack>
			<DateList data={dates} />
		</>
	)
}
