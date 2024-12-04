'use client'

import Link from 'next/link'
import { useContext } from 'react'

import { Loading } from '~/components/ui/Loading'

import { login } from '~/libs/firebase/auth'

import { anton, notoSansJP } from '../../fonts'
import { AuthContext } from '../../functional/AuthProvider'

import style from './index.module.scss'

export default function TopPage() {
	const { user, loading } = useContext(AuthContext)

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

				<div className={style.start}>
					{loading ? (
						<Loading />
					) : (
						<div className={style.start_btn}>
							{user?.id ? (
								<Link className={`${style.start_btn_link} ${anton.className}`} href="/create">
									START
								</Link>
							) : (
								<button type="button" className={`${style.start_btn_login} ${notoSansJP.className}`} onClick={login}>
									ログイン
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
