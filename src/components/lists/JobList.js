import React from 'react'
import moment from 'moment'
import {
	Chip,
	Divider,
	List,
	ListItemButton,
	ListItemText,
	Typography,
} from '@mui/material'
import { BaseListItem } from '../ListItem'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { JOB_STATUS } from '../../utils/constants'
import { BaseLink } from '../Link'

export const JobList = (props) => {
	const {
		data,
	} = props

	return (
		<>
			{data.length > 0 &&
				<List>
					<Divider />
					{data.map((job, index) => (
						<BaseListItem key={index}>
							<BaseLink href={`/jobs/${job._id}`}>
								<ListItemButton alignItems='flex-start'>
									<ListItemText
										primary={moment.utc(job.from_dt).format('YYYY-MM-DD')}
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
									<ArrowForwardIosIcon sx={{ alignSelf: 'center' }} />
								</ListItemButton>
							</BaseLink>
						</BaseListItem>
					))}
				</List>
			}
		</>
	)
}