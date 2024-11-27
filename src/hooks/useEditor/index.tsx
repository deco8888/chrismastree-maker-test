import { createContext, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export type EditorContextType = ReturnType<typeof useEditor>
export const EditorContext = createContext<EditorContextType | undefined>(undefined)

export const useEditor = () => {
	const [treeColor, setTreeColor] = useState<string>('#9A9D9C')
	const [decorations, setDecorations] = useState<any[]>([])
	const [selectedDecoration, setSelectedDecoration] = useState({})

	const treeRef = useRef<THREE.Group>(null)

	useEffect(() => {
		if (selectedDecoration) {
			console.log('selectedDecoration:', selectedDecoration)
			setDecorations(prev => [...prev, { ...selectedDecoration }])
		}
	}, [selectedDecoration])

	return {
		treeColor,
		setTreeColor,
		decorations,
		setDecorations,
		selectedDecoration,
		setSelectedDecoration,
		treeRef,
	}
}
