'use client'

import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useAriaHidden } from '~/hooks/useAriaHidden'
import { useDisableScroll } from '~/hooks/useDisableScroll'
import { useFocusTrap } from '~/hooks/useFocusTrap'
import { GlobalContext } from '~/hooks/useGlobal'

import style from './style.module.scss'

type Props = {
	id: string
	theme?: {
		readonly [key: string]: string
	}
	children: React.ReactNode
	options?: {
		onOpen?: () => void
		onClose?: () => void
		'aria-labelledby'?: string
		'aria-describedby'?: string
	}
}

const Modal: React.FC<Props> = ({ id, options, children, theme }) => {
	const { eventEmitter } = useContext(GlobalContext)

	const [isOpen, setIsOpen] = useState<boolean>(false)
	const isOpenRef = useRef<boolean>(false)

	const ref = useRef<HTMLDivElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)

	const onOpen = useCallback(() => {
		// optionsが変更された場合にのみ、この関数を更新
		options?.onOpen?.()
		setIsOpen(true)
		isOpenRef.current = true
	}, [options])

	const onClose = useCallback(() => {
		if (options?.onClose) {
			options.onClose()
		}
		setIsOpen(false)
		isOpenRef.current = false
	}, [options])

	const modalCheck = useCallback(
		(arg: [string]) => {
			// arg[0]が現在のモーダルのidと異なり、かつモーダルが開いている場合
			if (id !== arg[0] && isOpenRef.current === true) {
				onClose() // モーダルを閉じる
			}
		},
		[id, onClose],
	)

	useAriaHidden(ref, isOpen)
	useFocusTrap({ ref, isOpen, onClose })
	useDisableScroll(wrapperRef, isOpen)

	useEffect(() => {
		if (eventEmitter) {
			eventEmitter.addListener(`${id}.open`, onOpen)
			eventEmitter.addListener(`${id}.close`, onClose)
			eventEmitter.addListener(`modalCheck`, modalCheck)
		}
		return () => {
			if (eventEmitter) {
				eventEmitter.removeEvent(`${id}.open`)
				eventEmitter.removeEvent(`${id}.close`)
			}
		}
	}, [eventEmitter, id, modalCheck, onClose, onOpen])

	if (!isOpen) {
		return null
	}

	return createPortal(
		<div className={`${style.container} ${theme?.container}`} ref={wrapperRef}>
			<div
				ref={ref}
				role="dialog"
				aria-modal="true"
				aria-labelledby={options?.['aria-labelledby']}
				aria-describedby={options?.['aria-describedby']}
				className={`${style.content} ${theme?.content}`}
			>
				<div className={`${style.cover} ${theme?.cover}`} onClick={onClose}></div>
				<div className={`${style.main} ${theme?.main}`} data-ignore-scroll-lock>
					{children}
				</div>
			</div>
		</div>,
		document.body,
	)
}

export default Modal
