import { useContext, useEffect, useState } from 'react'
import { ColorPicker, useColor } from 'react-color-palette'
import 'react-color-palette/css'

import { EditorContext } from '~/hooks/useEditor'

import { notoSansJP } from '~/components/fonts'

import style from './index.module.scss'

export const DecorationController = () => {
	const context = useContext(EditorContext)
	// カラー
	const [color, setColor] = useColor(
		context?.decorationsByType?.find(v => v.slug === context.selectedDecoration?.slug)?.setting?.color ?? '#9A9D9C',
	)
	// サイズ
	const [size, setSize] = useState<number>(1)
	// 個数
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
		サイズを変更
	-------------------------------*/
	const onCountSize = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSize(Number(e.target.value))
		context?.setDecorationByType(prev =>
			prev.map(v =>
				v.slug === context?.selectedDecoration?.slug
					? {
							...v,
							setting: {
								...v.setting,
								size: Number(e.target.value),
							},
						}
					: v,
			),
		)
	}

	const updateDecorationByType = (currentCount: number) => {
		context?.setDecorationByType(prev =>
			prev.map(v => (v.slug === context.selectedDecoration?.slug ? { ...v, count: currentCount } : v)),
		)
	}

	/*-------------------------------
		個数を変更
	-------------------------------*/
	const onCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const currentCount = Number(e.target.value)

		// タイプ別の装飾品情報を取得
		const targetDecoration = context?.decorationsByType?.find(v => v.slug === context.selectedDecoration?.slug)
		if (!targetDecoration) return

		// 前回の個数を取得
		const prevCount = targetDecoration.count
		if (context == undefined || prevCount == undefined) return

		// 使用可能な位置情報を取得
		const availablePosition = context.decoPositionList.filter(v => v.isAvailable) ?? []

		if (currentCount !== prevCount) {
			if (currentCount > prevCount) {
				if (availablePosition.length <= 0) return
				updateDecorationByType(currentCount)

				// 増やす
				context?.addDecoration(prevCount, currentCount)
			} else {
				updateDecorationByType(currentCount)

				// 減らす
				context?.subtractDecoration(currentCount)
			}
		}
	}

	/*-------------------------------
		初期値を設定
	-------------------------------*/
	useEffect(() => {
		const currentDecoration = context?.decorationsByType?.find(v => v.slug === context.selectedDecoration?.slug)
		setCount(currentDecoration?.count ?? 0)
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
					<input
						id="size"
						className={style.item_input}
						name="size"
						min="1"
						max="5"
						step="0.1"
						type="range"
						value={size ?? 1}
						onChange={onCountSize}
					/>
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

				<button className={`${style.shuffle} ${notoSansJP.className}`} onClick={() => context?.shuffleDecorations()}>
					位置シャッフル
				</button>
			</div>
		</div>
	)
}
