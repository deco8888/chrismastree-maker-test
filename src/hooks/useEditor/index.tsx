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

	// 装飾品の位置をシャッフル
	const shuffleDecorations = useCallback(() => {
		// 利用可能な位置情報を取得
		const availablePosition = decoPositionList.filter(v => v.isAvailable)

		const shuffledPositions = availablePosition.sort(() => Math.random() - 0.5)
		console.log(shuffledPositions)
	}, [])

	useEffect(() => {
		if (selectedDecoration && decoPositionList.length > 0) {
			const availablePosition = decoPositionList.find(v => v.isAvailable)

			if (availablePosition) {
				const newDecoPosition = {
					...selectedDecoration,
					id: selectedDecoration.slug + '_' + 1,
					position: availablePosition.position,
				}
				setDecorations(prev => [...prev, newDecoPosition])

				// 使用した位置情報を更新
				setDecoPositionList(prev =>
					prev.map(v => (v.slug === availablePosition.slug ? { ...v, isAvailable: false } : v)),
				)

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
	}
}
