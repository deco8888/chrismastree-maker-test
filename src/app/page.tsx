import TopPage from '~/components/Top'

import styles from './page.module.scss'

export default function Home() {
	return (
		<main className={styles.main}>
			<TopPage />
		</main>
	)
}
