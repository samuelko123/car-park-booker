import React from 'react'
import axios from 'axios'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { BackButton } from '../../components/Buttons'
import { BaseLink } from '../../components/Link'
import { ReadOnlyField } from '../../components/TextFields'
import {
	CircularProgress,
	Stack,
	Typography,
} from '@mui/material'
import { UI_TEXT } from '../../utils/constants'
import { ErrorAlert } from '../../components/Alerts'

export default function Page() {
	const router = useRouter()
	const { booking_id } = router.query

	const fetcher = url => axios.get(url).then(res => res.data)
	const {
		data,
		error,
		isValidating,
	} = useSWR(`/api/bookings/${booking_id}`, fetcher)

	return (
		<Stack gap={2}>
			<BaseLink href='/jobs'>
				<BackButton>
					{UI_TEXT.BACK}
				</BackButton>
			</BaseLink>
			{error && <ErrorAlert>{error}</ErrorAlert>}
			<Stack flexDirection='row' gap={2}>
				<Typography variant='h6'>Booking</Typography>
				{isValidating && <CircularProgress size='2rem' />}
			</Stack>
			{data &&
				<>
					<Stack
						gap={3}
						sx={{ width: '100%' }}
					>
						{Object.keys(data).map(field => {
							if (field === 'token') {
								return null
							}

							return (
								<ReadOnlyField
									key={field}
									label={field}
									value={data[field]}
									fullWidth
								/>
							)
						})}
					</Stack>
				</>
			}
		</Stack>
	)
}