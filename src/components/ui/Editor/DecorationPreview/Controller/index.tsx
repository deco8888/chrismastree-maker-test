import { useContext, useEffect, useState } from 'react'
import { ColorPicker, useColor } from 'react-color-palette'
import 'react-color-palette/css'

import { EditorContext } from '~/hooks/useEditor'

import { notoSansJP } from '~/components/fonts'

import style from './index.module.scss'

export const DecorationController = () => {
	const context = useContext(EditorContext)
	const [color, setColor] = useColor('#9A9D9C')
	const [count, setCount] = useState<number>(0)

	/*-------------------------------
		カラーを変更
	-------------------------------*/
	useEffect(() => {
		context?.setDecorationByType(prev =>
			prev.map(v =>
				v.slug === context?.selectedDecoration?.slug
					? {
							...v,
							setting: {
								...v.setting,
								color: color.hex,
							},
						}
					: v,
			),
		)
	}, [color])

	/*-------------------------------
		個数を変更
	-------------------------------*/
	const onCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const currentCount = Number(e.target.value)

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
				context?.addDecoration(prevCount, currentCount)
			} else {
				// 減らす
				context?.subtractDecoration(currentCount)
			}
		}
	}

	useEffect(() => {
		const currentCount = context?.decorationsByType?.find(v => v.slug === context.selectedDecoration?.slug)?.count
		setCount(currentCount ?? 0)
	}, [context?.selectedDecoration, context?.decorationsByType])

	return (
		<div className={style.container}>
			{/* カラーピッカー */}
			<div className={style.colorPicker}>
				<ColorPicker color={color} onChange={setColor} height={100} hideInput={['hex', 'rgb', 'hsv']} />
			</div>

			<div className={style.block}>
				{/* サイズ */}
				<div className={style.item}>
					<label htmlFor="size" className={`${style.item_label} ${notoSansJP.className}`}>
						サイズ
					</label>
					<input id="size" className={style.item_input} name="size" min="0" max="5" step="1" type="range" />
				</div>

				{/* 個数 */}
				<div className={style.item}>
					<label htmlFor="count" className={`${style.item_label} ${notoSansJP.className}`}>
						個数
					</label>
					<input
						id="count"
						className={style.item_input}
						name="count"
						min="0"
						max="27"
						step="1"
						type="range"
						value={count ?? 0}
						onChange={onCountChange}
					/>
				</div>
			</div>
		</div>
	)
}
