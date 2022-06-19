import React from 'react'
import { ListItem } from '@mui/material'

export const BaseListItem = React.forwardRef((props, ref) => {
	const {
		children,
		...listItemProps
	} = props

	return (
		<ListItem
			disablePadding
			divider
			ref={ref}
			{...listItemProps}
		>
			{children}
		</ListItem>
	)
})