import { Toaster } from 'sonner'

import AppGlobalProvider from '~/components/functional/AppGlobalProvider'
import AuthProvider from '~/components/functional/AuthProvider'
import QueryProvider from '~/components/functional/QueryProvider'

import { anton, notoSansJP } from '~/components/fonts'

import type { Metadata } from 'next'

// import { Suspense } from 'react'
// import { Loading } from '~/components/ui/Loading'

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
		<html lang="ja" className={`${notoSansJP.variable} ${anton.variable}`}>
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
							<Toaster position="bottom-center" richColors={true} duration={3000} expand={false} closeButton={true} />
						</AuthProvider>
					</AppGlobalProvider>
				</QueryProvider>
			</body>
		</html>
	)
}
