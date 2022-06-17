import React from 'react'
import {
	MenuItem,
	TextField,
} from '@mui/material'

export const BaseDropdown = (props) => {
	const {
		label,
		value,
		options,
		onChange,
	} = props

	return (
		<TextField
			select
			size='small'
			value={value}
			label={label}
			onChange={(e) => onChange(e.target.value)}
			sx={{
				alignSelf: 'flex-start',
				minWidth: theme => theme.spacing(20),
			}}
		>
			{
				options.map(option => {
					if (!option || !option.label || !option.value) {
						return null
					}

					return (
						<MenuItem
							key={option.value}
							value={option.value}
							disableRipple
						>
							{option.label}
						</MenuItem>
					)
				})
			}
		</TextField>
	)
}