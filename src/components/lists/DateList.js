import React from 'react'
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
				data.map((date, index) => {
					let url
					if (date.status === JOB_STATUS.SUCCEEDED) {
						url = `/bookings/${date.booking_id}`
					} else if (!!date.status) {
						url = `/jobs/${date.job_id}`
					} else {
						url = `/jobs/create?date=${date.date}`
					}

					return (
						<BaseListItem key={index}>
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
													label={date.status === JOB_STATUS.SUCCEEDED ? date.car_park : date.status}
													color={
														date.status === JOB_STATUS.SUCCEEDED ? 'success' :
															date.status === JOB_STATUS.FAILED ? 'error' :
																date.status === JOB_STATUS.ACTIVE ? 'primary' :
																	undefined
													}
												/>
											}
											sx={{ flex: 1 }}
										/>
									}
									<ArrowForwardIosIcon
										sx={{ alignSelf: 'center' }}
									/>
								</ListItemButton>
							</BaseLink>
						</BaseListItem>
					)
				})
			}
		</List>
	)
}