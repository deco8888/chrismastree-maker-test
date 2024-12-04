'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useContext, useEffect } from 'react'

import { login } from '~/libs/firebase/auth'

import { anton } from '../../fonts'
import { AuthContext } from '../../functional/AuthProvider'

import style from './index.module.scss'

export default function LoginPage() {
	const { user } = useContext(AuthContext)
	const router = useRouter()
	const searchParams = useSearchParams()

	/*---------------------------------------
	  ユーザーがログインしている場合、リダイレクト
	 --------------------------------------*/
	useEffect(() => {
		if (user) {
			const redirectPath = searchParams.get('redirect')

			if (redirectPath) {
				router.push(decodeURIComponent(redirectPath))
			} else if (document.referrer && !document.referrer.includes('login')) {
				// 前ページのURLが存在する場合、そこに戻る
				window.location.href = document.referrer
			} else {
				router.back()
			}
		}
	}, [user, router])

	return (
		<div className={style.container}>
			<div className={style.inner}>
				<h2 className={`${style.title} ${anton.className}`}>
					{'Christmas Tree'.split('').map((char, i) => {
						return (
							<span className={style.title_splitChar} data-char={(i % 3) + 1} key={i}>
								{char}
							</span>
						)
					})}
					<br />
					<span className={style.title_char}>Maker</span>
				</h2>
				<p> 続けるにはログインしてください</p>
				<button type="button" onClick={login}>
					ログイン
				</button>
			</div>
		</div>
	)
}
