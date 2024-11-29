import { useContext, useEffect, useState } from 'react'

import { EditorContext } from '~/hooks/useEditor'

import style from './index.module.scss'

export const DecorationController = () => {
	const context = useContext(EditorContext)
	const [count, setCount] = useState<number>(1)

	const onCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const currentCount = Number(e.target.value)
		setCount(currentCount)

		const targetDecoration = context?.decorationsByType?.find(v => v.slug === context.selectedDecoration?.slug)
		if (!targetDecoration) return

		const prevCount = targetDecoration.count
		if (context == undefined || prevCount == undefined) return

		if (currentCount !== prevCount) {
			context?.setDecorationByType(prev =>
				prev.map(v => (v.slug === context.selectedDecoration?.slug ? { ...v, count: currentCount } : v)),
			)

			if (currentCount > prevCount) {
				// 増やす
				const availablePosition = context?.decoPositionList.find(v => v.isAvailable)
				if (availablePosition) {
					const slug = context.selectedDecoration?.slug || ''
					const newDecoPosition = {
						id: slug + '_' + currentCount,
						slug: slug,
						position: availablePosition.position,
					}
					context?.setDecorations(prev => [...prev, newDecoPosition])

					// 使用した位置情報を更新
					context?.setDecoPositionList(prev =>
						prev.map(v => (v.slug === availablePosition.slug ? { ...v, isAvailable: false } : v)),
					)
				}
			} else {
				// 減らす
				const targetDecorationList = targetDecoration.list
				const targetDecorationItem = targetDecorationList?.pop()

				if (targetDecorationItem) {
					context?.setDecorationByType(v =>
						v.map(v => (v.slug === context.selectedDecoration?.slug ? { ...v, list: targetDecorationList } : v)),
					)

					const decorationsList = context.decorations.filter(v => v.id !== targetDecorationItem.id)
					context?.setDecorations(decorationsList)

					context?.setDecoPositionList(prev =>
						prev.map(v => (v.id == targetDecorationItem.id ? { ...v, isAvailable: true } : v)),
					)
				}
			}
		}
	}

	useEffect(() => {
		console.log(context?.decorationsByType)
	}, [context?.decorationsByType])

	return (
		<div className={style.container}>
			{/* カラーピッカー */}
			<div className={style.colorPicker}>
				<label className={style.label}>カラー</label>
				<input type="color" />
			</div>

			{/* サイズ */}
			<div className={style.range}>
				<label className={style.label}>サイズ</label>
				<input className={style.range_input} name="size" min="0" max="5" step="1" type="range" />
			</div>

			{/* 個数 */}
			<div className={style.range}>
				<label className={style.label}>個数</label>
				<input
					className={style.range_input}
					name="count"
					min="1"
					max="5"
					step="1"
					type="range"
					value={count}
					onChange={onCountChange}
				/>
			</div>
		</div>
	)
}
