import { useContext, useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import 'react-color-palette/css'

import { EditorContext } from '~/hooks/useEditor'

import { notoSansJP } from '~/components/fonts'
import { DecoPositionItem } from '~/types/editor'

import style from './index.module.scss'

/**
 * 装飾品の編集パネルコントローラー
 * @returns
 */
export const DecorationController = () => {
	const context = useContext(EditorContext)
	const { setValue } = useFormContext()

	// カラー
	const [colors, setColors] = useState(
		context?.decorationsByType?.find(v => v.slug === context.selectedDecoration?.slug)?.setting?.color ?? [],
	)
	// サイズ
	const [size, setSize] = useState<number>(1)
	// 個数
	const [count, setCount] = useState<number>(0)

	const [isAvailable, setIsAvailable] = useState<boolean>(true)
	const [maxCount, setMaxCount] = useState<number>()

	const availablePositionsRef = useRef<DecoPositionItem[]>([])

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
								color: colors,
							},
						}
					: v,
			),
		)

		// フォーム更新
		setValue('decorationsByType', context?.decorationsByType)
	}, [colors])

	const onChangeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
		setColors(prev => {
			if (prev.includes('#9A9D9C')) {
				return prev.filter(v => v !== '#9A9D9C')
			}

			if (prev.includes(e.target.value)) {
				return prev.filter(v => v !== e.target.value)
			} else {
				return [...prev, e.target.value]
			}
		})
	}

	/*-------------------------------
		サイズを変更
	-------------------------------*/
	const onChangeSize = (e: React.ChangeEvent<HTMLInputElement>) => {
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

		// フォーム更新
		setValue('decorationsByType', context?.decorationsByType)
	}

	/*-------------------------------
		個数を変更
	-------------------------------*/
	const updateDecorationByType = (currentCount: number) => {
		try {
			const currentDecoration = context?.decorationsByType?.filter(v => v.slug !== context.selectedDecoration?.slug)
			const otherTotal = currentDecoration?.reduce((acc, cur) => acc + (cur.count ?? 0), 0) ?? 0

			const count =
				otherTotal && maxCount
					? otherTotal + currentCount >= maxCount
						? maxCount - otherTotal
						: currentCount
					: currentCount

			context?.setDecorationByType(prev =>
				prev.map(v => (v.slug === context.selectedDecoration?.slug ? { ...v, count: count } : v)),
			)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : '更新に失敗しました'
			toast.error(errorMessage)
		}
	}

	const onChangeCount = (e: React.ChangeEvent<HTMLInputElement>) => {
		const currentCount = Number(e.target.value)

		// タイプ別の装飾品情報を取得
		const targetDecoration = context?.decorationsByType?.find(v => v.slug === context.selectedDecoration?.slug)
		if (!targetDecoration) return

		// 前回の個数を取得
		const prevCount = targetDecoration.count
		if (context == undefined || prevCount == undefined) return

		// 使用可能な位置情報を取得
		const availablePositions = context.decoPositionList.filter(v => v.isAvailable) ?? []
		availablePositionsRef.current = availablePositions

		if (currentCount !== prevCount) {
			if (currentCount > prevCount) {
				if (availablePositions.length <= 0) {
					if (isAvailable == true) {
						toast.error('利用可能な位置がありません')
					}
					return
				} else {
					try {
						updateDecorationByType(currentCount)

						// 増やす
						context?.addDecoration(prevCount, currentCount)
					} catch (error) {
						toast.error('装飾の追加に失敗しました')
					}
				}
			} else {
				try {
					updateDecorationByType(currentCount)

					// 減らす
					context?.subtractDecoration(currentCount)
				} catch (error) {
					toast.error('装飾の削除に失敗しました')
				}
			}
		}
	}

	/*-------------------------------
		初期値を設定
	-------------------------------*/
	useEffect(() => {
		const currentDecoration = context?.decorationsByType?.find(v => v.slug === context.selectedDecoration?.slug)
		setCount(currentDecoration?.count ?? 0)
		setValue('decorationsByType', context?.decorationsByType)
	}, [context?.selectedDecoration, context?.decorationsByType])

	useEffect(() => {
		if (!context?.decoPositionList) return

		if (maxCount == undefined) {
			setMaxCount(context.decoPositionList.length)
		}

		setIsAvailable(context.decoPositionList.filter(v => v.isAvailable)?.length > 0)
	}, [context?.decoPositionList])

	return (
		<div className={style.container}>
			{/* カラーピッカー */}
			<div className={style.colorPicker}>
				<p className={`${style.item_label} ${notoSansJP.className}`}>カラー</p>
				<ul className={style.colorPicker_list}>
					{['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3'].map((color, i) => (
						<li className={style.colorPicker_item} key={i}>
							<input
								type="checkbox"
								id={`color-${i}`}
								name="color"
								className={style.colorPicker_input}
								onChange={onChangeColor}
								value={color}
								checked={colors.includes(color)}
							/>
							<label
								className={style.colorPicker_label}
								htmlFor={`color-${i}`}
								data-active={!colors.includes(color)}
								style={{ backgroundColor: color }}
							></label>
						</li>
					))}
				</ul>
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
						onChange={onChangeSize}
					/>
					<p className={`${style.item_value} ${notoSansJP.className}`}>{size}</p>
				</div>

				{/* 個数 */}
				<div className={style.item} data-available={isAvailable}>
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
						onChange={onChangeCount}
					/>
					<p className={`${style.item_value} ${notoSansJP.className}`}>{count}</p>
				</div>

				<button
					type="button"
					className={`${style.shuffle} ${notoSansJP.className}`}
					onClick={() => context?.shuffleDecorations()}
				>
					位置シャッフル
				</button>
			</div>
		</div>
	)
}
