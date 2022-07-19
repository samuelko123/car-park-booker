import React from 'react'
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material'
import {
	BaseButton,
	DeleteButton,
} from './Buttons'
import { ErrorAlert } from './Alerts'
import { UI_TEXT } from '../utils/constants'

export const DeleteDialog = (props) => {
	const {
		onConfirm,
		open,
		handleClose,
	} = props

	const [isLoading, setLoading] = React.useState(false)
	const [error, setError] = React.useState(null)
	const handleConfirm = async () => {
		try {
			setLoading(true)
			await onConfirm()
		} catch (err) {
			setError(err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog
			open={open}
			onClose={handleClose}
		>
			<DialogTitle>
				{UI_TEXT.DELETE}
			</DialogTitle>
			{error && <ErrorAlert>{error}</ErrorAlert>}
			<DialogContent>
				<DialogContentText>
					Are you sure you want to delete?
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<BaseButton onClick={handleClose}>
					{UI_TEXT.CANCEL}
				</BaseButton>
				<DeleteButton
					onClick={handleConfirm}
					loading={isLoading}
				>
					{UI_TEXT.DELETE}
				</DeleteButton>
			</DialogActions>
		</Dialog>
	)
}