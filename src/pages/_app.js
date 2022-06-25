import React from 'react'
import Head from 'next/head'

import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../styles/theme'

import {
	CssBaseline,
	Stack,
} from '@mui/material'
import { AppBar } from '../components/AppBar'
import { AuthGuard } from '../components/AuthGuard'

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
				<AuthGuard>
					{children}
				</AuthGuard>
			</Stack>
		</ThemeProvider>
	)
}

export default function App(props) {
	const {
		Component,
		pageProps: { ...pageProps },
	} = props

	return (
		<AppWrapper>
			<Component {...pageProps} />
		</AppWrapper>
	)
}
