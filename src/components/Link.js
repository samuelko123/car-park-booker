import NextLink from 'next/link'

export const BaseLink = (props) => {
	const {
		href,
		children,
		disabled,
	} = props

	if (disabled) {
		return children
	}

	return (
		<NextLink href={href} passHref={true}>
			{children}
		</NextLink>
	)
}