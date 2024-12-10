import { FadeLoader } from 'react-spinners'

import style from './index.module.scss'

type Props = {
	color?: string
	bg?: boolean
	isFixed?: boolean
}

export const Loading = ({ color = '#16907c', bg = false, isFixed = false }: Props) => {
	return (
		<div className={style.loading} data-bg={bg} data-fixed={isFixed}>
			<FadeLoader color={color} height={20} aria-label="Loading Spinner" data-testid="loader" />
		</div>
	)
}
