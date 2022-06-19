import React from 'react'
import { Alert } from '@mui/material'

export const BaseAlert = React.forwardRef((props, ref) => {
	const {
		children,
		...alertProps
	} = props

	return (
		<Alert
			sx={{
				display: 'inline-flex',
				width: 'fit-content',
				whiteSpace: 'pre-wrap',
			}}
			ref={ref}
			{...alertProps}
		>
			{typeof children === 'object' ?
				JSON.stringify(children, null, 2) :
				children
			}
		</Alert>
	)
})

export const ErrorAlert = React.forwardRef((props, ref) => (
	<BaseAlert
		severity='error'
		ref={ref}
		{...props}
	/>
))

export const SuccessAlert = React.forwardRef((props, ref) => (
	<BaseAlert
		severity='success'
		ref={ref}
		{...props}
	/>
))