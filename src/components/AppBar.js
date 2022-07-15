import React from 'react'
import { useRouter } from 'next/router'
import {
	CircularProgress,
	IconButton,
	AppBar as MuiAppBar,
	Tooltip,
	Typography,
} from '@mui/material'
import { BaseLink } from './Link'
import {
	HTTP_METHOD,
	UI_TEXT,
} from '../utils/constants'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAjaxRequest } from '../hooks/useAjaxRequest'
import { ErrorAlert } from './Alerts'
import { AuthContext } from './AuthProvider'

export const AppBar = (props) => {
	const {
		title,
	} = props

	const router = useRouter()
	const { user } = React.useContext(AuthContext)
	const [errMsg, isLoading, sendRequest] = useAjaxRequest()

	const handleSubmit = async () => {
		const request = {
			url: '/api/logout',
			method: HTTP_METHOD.POST,
		}

		await sendRequest(request, () => {
			router.reload()
		})
	}

	return (
		<>
			<MuiAppBar
				elevation={2}
				sx={{
					position: 'static',
					padding: (theme) => theme.spacing(1),
					paddingLeft: (theme) => theme.spacing(2),
					paddingRight: (theme) => theme.spacing(2),
					marginBottom: (theme) => theme.spacing(2),
					height: (theme) => theme.spacing(7),
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
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
				{isLoading &&
					<CircularProgress
						sx={{ color: 'inherit' }}
					/>
				}
				{user &&
					<Tooltip title={UI_TEXT.LOGOUT}>
						<IconButton
							onClick={handleSubmit}
							sx={{
								color: 'inherit',
							}}
						>
							<LogoutIcon />
						</IconButton>
					</Tooltip>
				}
			</MuiAppBar>
			{errMsg && <ErrorAlert>{errMsg}</ErrorAlert>}
		</>
	)
}