import React from 'react'
import {
	AppBar as MuiAppBar,
	Typography,
} from '@mui/material'
import { BaseLink } from './Link'

export const AppBar = (props) => {
	const {
		title,
	} = props

	return (
		<MuiAppBar
			elevation={2}
			sx={{
				position: 'static',
				padding: (theme) => theme.spacing(1),
				paddingLeft: (theme) => theme.spacing(2),
				paddingRight: (theme) => theme.spacing(2),
				marginBottom: (theme) => theme.spacing(10),
				height: (theme) => theme.spacing(7),
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<BaseLink href='/'>
				<Typography
					variant='h6'
					component='h6'
					noWrap
					sx={{ cursor: 'pointer' }}
				>
					{title}
				</Typography>
			</BaseLink>
		</MuiAppBar>
	)
}