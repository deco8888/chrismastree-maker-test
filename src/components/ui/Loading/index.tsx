import { FadeLoader } from 'react-spinners'

import style from './index.module.scss'

type Props = {
	color?: string
	bg?: boolean
}

export const Loading = ({ color = '#16907c', bg = false }: Props) => {
	return (
		<div className={style.loading} data-bg={bg}>
			<FadeLoader color={color} height={20} aria-label="Loading Spinner" data-testid="loader" />
		</div>
	)
}
