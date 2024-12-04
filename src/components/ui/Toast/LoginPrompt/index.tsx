import { login } from '~/libs/firebase/auth'

import { notoSansJP } from '~/components/fonts'

import style from './index.module.scss'

type LoginPromptProps = {
	text: string
}

export const LoginPrompt = (props: LoginPromptProps) => {
	return (
		<div className={style.toast}>
			<p className={`${style.toast_text} ${notoSansJP.className}`}>{props.text}にはログインが必要です</p>
			<button type="button" className={`${style.toast_btn} ${notoSansJP.className}`} onClick={login}>
				Googleでログイン
			</button>
		</div>
	)
}
