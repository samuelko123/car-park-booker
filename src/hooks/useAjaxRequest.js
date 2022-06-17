import React from 'react'
import axios from 'axios'

export const useAjaxRequest = () => {
	const [errMsg, setErrMsg] = React.useState(null)
	const [isLoading, setLoading] = React.useState(false)

	const submit = React.useCallback(async (request, onSuccess) => {
		try {
			setErrMsg(null)
			setLoading(true)
			const res = await axios.request(request)
			if (onSuccess) {
				onSuccess(res)
			}
		} catch (err) {
			if (err.response?.data) {
				setErrMsg(err.response.data)
			} else {
				setErrMsg(err.toString())
			}
		} finally {
			setLoading(false)
		}
	}, [])

	return [errMsg, isLoading, submit]
}