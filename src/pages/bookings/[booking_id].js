import React from 'react'
import axios from 'axios'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import {
	BackButton,
	DeleteButton,
} from '../../components/Buttons'
import { BaseLink } from '../../components/Link'
import { ReadOnlyField } from '../../components/TextFields'
import {
	CircularProgress,
	Stack,
	Typography,
} from '@mui/material'
import {
	ERROR,
	HTTP_METHOD,
	HTTP_STATUS,
	UI_TEXT,
} from '../../utils/constants'
import { ErrorAlert } from '../../components/Alerts'
import { DeleteDialog } from '../../components/Dialogs'
import { useAjaxRequest } from '../../hooks/useAjaxRequest'

export default function Page() {
	const router = useRouter()
	const { booking_id } = router.query
	const [openModal, setOpenModal] = React.useState(false)
	const [deleteErrMsg, , sendDeleteRequest] = useAjaxRequest()

	const handleDelete = async () => {
		const request = {
			url: `/api/bookings/${booking_id}`,
			method: HTTP_METHOD.DELETE,
		}

		await sendDeleteRequest(request, (res) => {
			if (res.status === HTTP_STATUS.OK) {
				router.push('/jobs')
			}
		})
	}

	const fetcher = url => {
		return axios
			.get(url)
			.then(res => res.data)
			.catch(err => {
				if (err?.code === 'ERR_BAD_REQUEST') {
					throw new Error('Not Found')
				} else {
					throw err
				}
			})
	}

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
			<Stack flexDirection='row' gap={2}>
				<Typography variant='h6'>Booking</Typography>
				{isValidating && <CircularProgress size='2rem' />}
			</Stack>
			{error && <ErrorAlert>{error?.message || ERROR.UNKNOWN}</ErrorAlert>}
			{deleteErrMsg && <ErrorAlert>{deleteErrMsg}</ErrorAlert>}
			{data &&
				<>
					<Stack
						gap={3}
						sx={{ width: '100%' }}
					>
						<DeleteButton
							variant='outlined'
							onClick={() => { setOpenModal(true) }}
						>
							{UI_TEXT.DELETE}
						</DeleteButton>
						<DeleteDialog
							open={openModal}
							onConfirm={handleDelete}
							handleClose={() => { setOpenModal(false) }}
						/>
						{Object.keys(data).map(field => {
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