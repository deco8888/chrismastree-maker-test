import { createContext, useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

import { DecoPositionItem, Decoration, DecorationsByType, SelectedDecoration } from '~/types/editor'

export type EditorContextType = ReturnType<typeof useEditor>
export const EditorContext = createContext<EditorContextType | undefined>(undefined)

export const useEditor = () => {
	const [treeColor, setTreeColor] = useState<string>('#9A9D9C')
	// タイプ別の装飾品情報リスト
	const [decorationsByType, setDecorationByType] = useState<DecorationsByType[]>([])
	// 選択された装飾品情報リスト
	const [decorations, setDecorations] = useState<Decoration[]>([])
	// 選択された装飾品情報
	const [selectedDecoration, setSelectedDecoration] = useState<SelectedDecoration>()
	const [decoPositionList, setDecoPositionList] = useState<DecoPositionItem[]>([])

	const [decoSettingList, setDecoSettingList] = useState<Decoration[]>([])

	// 木の幹
	const treeRef = useRef<THREE.Group>(null)

	/*-------------------------------
		装飾品をシャッフルする
	-------------------------------*/
	const shuffleDecorations = useCallback(() => {
		// 利用可能な位置情報を取得
		const availablePosition = decoPositionList.filter(v => v.isAvailable)

		const shuffledPositions = availablePosition.sort(() => Math.random() - 0.5)
		console.log(shuffledPositions)
	}, [])

	/*-------------------------------
		装飾品を追加(初回追加)
	-------------------------------*/
	useEffect(() => {
		if (selectedDecoration && decoPositionList.length > 0) {
			const availablePosition = decoPositionList.find(v => v.isAvailable)

			if (availablePosition) {
				// 装飾品を追加
				const newDecoPosition = {
					id: selectedDecoration.slug + '_' + 1,
					slug: selectedDecoration.slug,
					position: availablePosition.position,
				}
				setDecorations(prev => [...prev, newDecoPosition])

				// 使用した位置情報を更新
				setDecoPositionList(prev =>
					prev.map(v => {
						return v.slug === availablePosition.slug ? { ...v, isAvailable: false, usedBy: newDecoPosition.id } : v
					}),
				)

				// タイプ別の装飾品情報リストを更新
				setDecorationByType(prev => {
					if (prev.length > 0) {
						return prev
					} else {
						return [...prev, { ...selectedDecoration, count: 1, list: [newDecoPosition] }]
					}
				})
			}
		}
	}, [selectedDecoration])

	/*-------------------------------
		装飾品を追加（個数変更）
	-------------------------------*/
	const addDecoration = useCallback(
		(prevCount: number, currentCount: number) => {
			const slug = selectedDecoration?.slug
			const addCount = currentCount - prevCount

			if (!slug || addCount <= 0) return

			// 利用可能な位置情報を取得
			const availablePositions = decoPositionList.filter(v => v.isAvailable).slice(0, addCount)
			if (availablePositions.length === 0) return

			const newCollections = availablePositions.map((pos, i) => ({
				id: slug + '_' + (prevCount + (i + 1)),
				slug: slug,
				position: pos.position,
			}))

			// 表示用装飾品情報リストを更新
			setDecorations(prev => [...prev, ...newCollections])

			// 使用した位置情報を更新
			setDecoPositionList(prev =>
				prev.map(v => {
					const matchPosDecoration = newCollections.find(item => item.position.equals(v.position))
					return matchPosDecoration ? { ...v, isAvailable: false, usedBy: matchPosDecoration.id } : v
				}),
			)

			// タイプ別の装飾品情報リストを更新
			setDecorationByType(prev =>
				prev.map(v => (v.slug === slug ? { ...v, list: [...(v.list ?? []), ...newCollections] } : v)),
			)
		},
		[decorationsByType, selectedDecoration],
	)

	/*-------------------------------
		装飾品を削除
	-------------------------------*/
	const subtractDecoration = useCallback(
		(currentCount: number) => {
			const targetDecoration = decorationsByType?.find(v => v.slug === selectedDecoration?.slug)
			if (!targetDecoration) return

			const targetDecorationList = targetDecoration.list
			const updatedDecorationList = targetDecorationList?.slice(0, currentCount) ?? []
			// 削除される装飾品リスト
			const subtractedDecorationList = targetDecorationList?.slice(currentCount) ?? []

			if (updatedDecorationList) {
				// 表示用装飾品情報リストを更新
				setDecorations(prev => prev.filter(v => updatedDecorationList.some(item => item.id === v.id)))

				// 使用していた位置情報を更新
				setDecoPositionList(prev =>
					prev.map(v => {
						const target = subtractedDecorationList.some(item => item.id === v.usedBy)
						if (target) {
							return { ...v, isAvailable: true, usedBy: undefined }
						} else {
							return v
						}
					}),
				)

				// タイプ別の装飾品情報リストを更新
				setDecorationByType(v =>
					v.map(v => (v.slug === selectedDecoration?.slug ? { ...v, list: updatedDecorationList } : v)),
				)
			}
		},
		[decorationsByType, selectedDecoration],
	)

	return {
		treeColor,
		setTreeColor,
		decorations,
		setDecorations,
		selectedDecoration,
		setSelectedDecoration,
		decoPositionList,
		setDecoPositionList,
		treeRef,
		shuffleDecorations,
		decoSettingList,
		setDecoSettingList,
		decorationsByType,
		setDecorationByType,
		addDecoration,
		subtractDecoration,
	}
}
