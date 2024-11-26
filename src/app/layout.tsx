import { Suspense } from 'react'

import AppGlobalProvider from '~/components/functional/AppGlobalProvider'
import QueryProvider from '~/components/functional/QueryProvider'

import type { Metadata } from 'next'

import '~/styles/global.scss'

export const metadata: Metadata = {
	title: '',
	description: '',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="ja">
			<body>
				<QueryProvider>
					<Suspense>
						<AppGlobalProvider>{children}</AppGlobalProvider>
					</Suspense>
				</QueryProvider>
			</body>
		</html>
	)
}
