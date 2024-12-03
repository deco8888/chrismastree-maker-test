import { notoSansJP } from '~/components/fonts'

import style from './index.module.scss'

type LoginPromptProps = {
	message: string
}

export const PostPrompt = (props: LoginPromptProps) => {
	return (
		<div className={style.toast}>
			<p className={`${style.toast_text} ${notoSansJP.className}`}>{props.message}</p>
		</div>
	)
}
