import AppGlobalProvider from '~/components/functional/AppGlobalProvider'
import AuthProvider from '~/components/functional/AuthProvider'
import QueryProvider from '~/components/functional/QueryProvider'

import type { Metadata } from 'next'

import '~/styles/global.scss'
import style from './layout.module.scss'

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
					<AppGlobalProvider>
						<AuthProvider>
							<div className={style.container}>
								<div className={style.bg}></div>
								<div className={style.inner}>
									<div className={style.contents}>{children}</div>
								</div>
							</div>
						</AuthProvider>
					</AppGlobalProvider>
				</QueryProvider>
			</body>
		</html>
	)
}
