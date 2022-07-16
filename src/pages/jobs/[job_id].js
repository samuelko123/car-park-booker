import React from 'react'
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
	HTTP_METHOD,
	HTTP_STATUS,
	UI_TEXT,
} from '../../utils/constants'
import { ErrorAlert } from '../../components/Alerts'
import { useAjaxRequest } from '../../hooks/useAjaxRequest'
import { LogList } from '../../components/lists/LogList'
import moment from 'moment'

export default function Page() {
	const router = useRouter()
	const { job_id } = router.query
	const [fetchErrMsg, isFetching, sendFetchingRequest] = useAjaxRequest()
	const [deleteErrMsg, isDeleting, sendDeleteRequest] = useAjaxRequest()
	const [data, setData] = React.useState(null)

	const handleFetchData = React.useCallback(async () => {
		setData(null)

		const request = {
			url: `/api/jobs/${job_id}`,
			method: HTTP_METHOD.GET,
		}

		await sendFetchingRequest(request, (res) => {
			setData(res.data)
		})
	}, [sendFetchingRequest, job_id])

	const handleDelete = async () => {
		const request = {
			url: `/api/jobs/${job_id}`,
			method: HTTP_METHOD.DELETE,
		}

		await sendDeleteRequest(request, (res) => {
			if (res.status === HTTP_STATUS.OK) {
				router.push('/jobs')
			}
		})
	}

	React.useEffect(() => {
		if (!!job_id) {
			handleFetchData()
		}
	}, [handleFetchData, job_id])

	return (
		<Stack gap={2}>
			<BaseLink href='/jobs'>
				<BackButton>
					{UI_TEXT.BACK}
				</BackButton>
			</BaseLink>
			{isFetching && <CircularProgress />}
			{fetchErrMsg && <ErrorAlert>{fetchErrMsg}</ErrorAlert>}
			{deleteErrMsg && <ErrorAlert>{deleteErrMsg}</ErrorAlert>}
			<DeleteButton
				variant='outlined'
				onClick={handleDelete}
				loading={isDeleting}
			>
				{UI_TEXT.DELETE}
			</DeleteButton>
			{data &&
				<>
					<Typography variant='h6'>Job</Typography>
					<Stack
						gap={3}
						sx={{
							width: '100%',
						}}
					>
						{['_id', 'from_dt', 'to_dt', 'status', 'run_count', 'last_run_at', 'created_at'].map(field => {
							let value = data?.job?.[field]
							if (!value) {
								return null
							}

							if (field === 'from_dt' || field === 'to_dt') {
								value = moment.utc(value).format('YYYY-MM-DD HH:mm:ss')
							}

							if (field === 'last_run_at' || field === 'created_at') {
								value = moment(value).format('YYYY-MM-DD HH:mm:ss')
							}

							return (
								<ReadOnlyField
									key={field}
									label={field}
									value={value}
									fullWidth
								/>
							)
						})}
					</Stack>
				</>
			}
			{data?.logs && data.logs.length > 0 &&
				<>
					<Typography variant='h6'>Logs</Typography>
					<LogList data={data?.logs} />
				</>
			}
		</Stack>
	)
}