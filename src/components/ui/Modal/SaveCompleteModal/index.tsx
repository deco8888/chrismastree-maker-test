import Modal from '..'

import style from './style.module.scss'

const modalId = 'save-complete-modal'

export const SaveCompleteModal = () => {
	return (
		<Modal id={modalId} options={{ 'aria-labelledby': modalId, 'aria-describedby': modalId }}>
			<div className={style.container}>
				<div className={style.inner}></div>
			</div>
		</Modal>
	)
}
