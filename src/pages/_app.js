import React from 'react'
import Router from 'next/router'
import Head from 'next/head'

import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../styles/theme'

import {
	CircularProgress,
	CssBaseline,
	Stack,
} from '@mui/material'
import { AppBar } from '../components/AppBar'

export const AppWrapper = (props) => {
	const { children } = props

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>{process.env.NEXT_PUBLIC_APP_TITLE}</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<CssBaseline />
			<AppBar title={process.env.NEXT_PUBLIC_APP_TITLE} />
			<Stack
				component='main'
				gap={2}
				p={2}
				sx={{
					maxWidth: 600,
					margin: 'auto',
				}}
			>
				{children}
			</Stack>
		</ThemeProvider>
	)
}

export default function App(props) {
	const {
		Component,
		pageProps: { ...pageProps },
	} = props

	const [isLoading, setLoading] = React.useState(false)

	Router.onRouteChangeStart = () => {
		setLoading(true)
	}

	Router.onRouteChangeComplete = () => {
		setLoading(false)
	}

	Router.onRouteChangeError = () => {
		setLoading(false)
	}

	return (
		<AppWrapper>
			{isLoading &&
				<CircularProgress />
			}
			{!isLoading &&
				<Component {...pageProps} />
			}
		</AppWrapper>
	)
}