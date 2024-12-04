import CreatePage from '~/components/pages/Create'

import AuthGuard from '~/components/functional/AuthGuard'

import styles from './page.module.scss'

export default function Create() {
	return (
		<AuthGuard>
			<main className={styles.main}>
				<CreatePage />
			</main>
		</AuthGuard>
	)
}
