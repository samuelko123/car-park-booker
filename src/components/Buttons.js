import React from 'react'
import LoadingButton from '@mui/lab/LoadingButton'

export const BaseButton = React.forwardRef((props, ref) => {
	const {
		children,
		...btnProps
	} = props

	return (
		<LoadingButton
			sx={{ alignSelf: 'flex-start' }}
			ref={ref}
			{...btnProps}
		>
			{children}
		</LoadingButton>
	)
})