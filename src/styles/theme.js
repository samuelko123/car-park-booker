import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
	typography: {
		link: {
			color: (theme) => theme.palette.primary.main,
			textDecoration: 'underline',
		},
	},
	palette: {
		background: {
			default: '#eeeeee',
		},
	},
})