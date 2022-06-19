import React from 'react'
import moment from 'moment'
import {
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
								primary={job.date}
								secondary={`${job.from_time} - ${job.to_time}`}
							/>
							<ListItemText
								primary={job.status}
								secondary={
									<>
										<Typography>
											Last run: {moment(job.last_run_at).format('YYYY.MM.DD HH:mm')}
										</Typography>
										<Typography>
											Run count: {job.run_count}
										</Typography>
									</>
								}
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