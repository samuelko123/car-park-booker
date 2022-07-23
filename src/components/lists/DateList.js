import React from 'react'
import moment from 'moment'
import {
	Chip,
	Divider,
	List,
	ListItemButton,
	ListItemText,
} from '@mui/material'
import { BaseListItem } from '../ListItem'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { JOB_STATUS } from '../../utils/constants'
import { BaseLink } from '../Link'
import { DateTimeHelper } from '../../utils/DateTimeHelper'

export const DateList = (props) => {
	const {
		data,
	} = props

	if (!data || data.length <= 0) {
		return null
	}

	return (
		<List>
			<Divider />
			{
				data.map((date) => {
					// hide past days
					const now = moment()
					const itemDate = moment(date.date)
					if (itemDate.diff(now, 'days', true) < 0) {
						return null
					}

					let url
					if (date.status === JOB_STATUS.SUCCEEDED) {
						url = `/bookings/${date.booking_id}`
					} else if (!!date.status) {
						url = `/jobs/${date.job_id}`
					} else {
						url = `/jobs/create?date=${date.date}`
					}

					let chipText
					if (date.status === JOB_STATUS.SUCCEEDED) {
						chipText = date.car_park
					} else if (date.status === JOB_STATUS.ACTIVE) {
						chipText = `Last run: ${moment(date.last_run_at).format('DD/MM HH:mm')}`
					} else {
						chipText = date.status
					}

					let chipColor
					if (date.status === JOB_STATUS.SUCCEEDED) {
						chipColor = 'success'
					}
					else if (date.status === JOB_STATUS.FAILED) {
						chipColor = 'error'
					}
					else if (date.status === JOB_STATUS.ACTIVE) {
						chipColor = 'primary'
					} else {
						chipColor = undefined
					}

					return (
						<React.Fragment key={date.date}>
							<BaseListItem>
								<BaseLink href={url}>
									<ListItemButton alignItems='flex-start'>
										<ListItemText
											primary={DateTimeHelper.convertToShortFormat(date.date)}
											sx={{ flex: 1 }}
										/>
										{
											date.status &&
											<ListItemText
												primary={
													<Chip
														size='small'
														label={chipText}
														color={chipColor}
													/>
												}
												sx={{ flex: 1.5 }}
											/>
										}
										<ArrowForwardIosIcon
											sx={{ alignSelf: 'center' }}
										/>
									</ListItemButton>
								</BaseLink>
							</BaseListItem>
							{itemDate.weekday() === 5 &&
								<Divider sx={{ borderWidth: 1 }} />
							}
						</React.Fragment>
					)
				})
			}
		</List>
	)
}