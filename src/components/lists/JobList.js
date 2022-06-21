import React from 'react'
import moment from 'moment'
import {
	Chip,
	CircularProgress,
	Divider,
	IconButton,
	List,
	ListItemText,
	Typography,
} from '@mui/material'
import { BaseListItem } from '../ListItem'
import DeleteIcon from '@mui/icons-material/Delete'
import {
	HTTP_METHOD,
	HTTP_STATUS,
	JOB_STATUS,
} from '../../utils/constants'
import { ErrorAlert } from '../Alerts'
import { useAjaxRequest } from '../../hooks/useAjaxRequest'

export const JobList = (props) => {
	const {
		data,
		onDelete,
	} = props

	const [errMsg, isLoading, sendRequest] = useAjaxRequest()
	const [jobId, setJobId] = React.useState('')

	const handleDelete = async (job_id) => {
		setJobId(job_id)

		const request = {
			url: `/api/jobs/${job_id}`,
			method: HTTP_METHOD.DELETE,
		}

		await sendRequest(request, (res) => {
			if (res.status === HTTP_STATUS.OK) {
				onDelete()
			}
		})
	}

	return (
		<>
			{errMsg && <ErrorAlert>{errMsg}</ErrorAlert>}
			{data.length > 0 &&
				<List>
					<Divider />
					{data.map((job, index) => (
						<BaseListItem key={index} alignItems='flex-start'>
							<ListItemText
								primary={moment.utc(job.from_dt).format('YYYY.MM.DD')}
								secondary={`${moment.utc(job.from_dt).format('HH:mm')} - ${moment.utc(job.to_dt).format('HH:mm')}`}
								sx={{
									flex: 0.5,
								}}
							/>
							<ListItemText
								primary={
									<Chip
										size='small'
										label={job.status}
										color={
											job.status === JOB_STATUS.SUCCEEDED ? 'success' :
												job.status === JOB_STATUS.FAILED ? 'error' :
													job.status === JOB_STATUS.ACTIVE ? 'primary' :
														undefined
										}
									/>
								}
								secondary={
									<>
										<Typography component='span' sx={{ display: 'block' }}>
											Last run: {job.last_run_at ? moment(job.last_run_at).format('DD/MM HH:mm') : 'N/A'}
										</Typography>
										<Typography component='span' sx={{ display: 'block' }}>
											Run count: {job.run_count}
										</Typography>
									</>
								}
								sx={{
									flex: 1,
								}}
							/>
							{isLoading && (
								job._id === jobId ?
									<CircularProgress /> :
									<IconButton disabled>
										<DeleteIcon />
									</IconButton>
							)}
							{!isLoading &&
								<IconButton
									color='error'
									onClick={() => handleDelete(job._id)}
								>
									<DeleteIcon />
								</IconButton>
							}
						</BaseListItem>
					))}
				</List>
			}
		</>
	)
}