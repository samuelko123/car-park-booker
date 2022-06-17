import NextLink from 'next/link'

export const BaseLink = (props) => {
	const {
		href,
		children,
	} = props

	return (
		<NextLink href={href} passHref={true}>
			{children}
		</NextLink>
	)
}