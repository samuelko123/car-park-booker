import React from 'react'
import { TextField } from '@mui/material'

export const BaseTextField = (props) => {
	const {
		label,
		value,
		onChange,
		...textFieldProp
	} = props

	const handleChange = (e) => {
		onChange(e.target.value)
	}

	return (
		<TextField
			fullWidth
			size='small'
			label={label}
			value={value}
			onChange={handleChange}
			inputProps={{
				autoComplete: 'password',
			}}
			{...textFieldProp}
		/>
	)
}

export const ReadOnlyField = (props) => {
	const {
		label,
		value,
		...textFieldProp
	} = props

	return (
		<BaseTextField
			label={label}
			value={value}
			inputProps={{
				readOnly: true,
			}}
			{...textFieldProp}
		/>
	)
}