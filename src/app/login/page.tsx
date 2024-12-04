'use client'

import LoginPage from '~/components/pages/Login'

import style from './page.module.scss'

export default function Login() {
	return (
		<main className={style.main}>
			<LoginPage />
		</main>
	)
}
