import React from 'react'
import moment from 'moment'
import {
	Chip,
	Divider,
	List,
	ListItemText,
} from '@mui/material'
import { BaseListItem } from '../ListItem'

export const LogList = (props) => {
	const {
		data,
	} = props

	return (
		<>
			{!!data && data.length > 0 &&
				<List>
					<Divider />
					{data.map((log, index) => (
						<BaseListItem key={index} alignItems='flex-start'>
							<ListItemText
								primary={moment(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
								sx={{ flex: 1.2 }}
							/>
							<ListItemText
								primary={
									<Chip
										size='small'
										label={log.level}
										color={log.level}
									/>
								}
								sx={{ flex: 0.6 }}
							/>
							<ListItemText
								primary={log.message}
								sx={{ flex: 1.8 }}
							/>
						</BaseListItem>
					))}
				</List>
			}
		</>
	)
}