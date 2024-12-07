import GUI from 'lil-gui'
import { useContext, useEffect, useRef } from 'react'
import * as THREE from 'three'

import { EditorContext } from '~/hooks/useEditor'

import { DecoPositionItem } from '~/types/editor'

interface DebugGUIProps {
	decorations: DecoPositionItem[]
	onUpdate: (updatedDeco: DecoPositionItem) => void
}

const DebugGUI = (props: DebugGUIProps) => {
	const { decorations, onUpdate } = props
	const guiRef = useRef<GUI>()

	useEffect(() => {
		// 既存のGUIを破棄
		if (guiRef.current) {
			guiRef.current.destroy()
		}

		// 新しいGUIを作成
		const gui = new GUI({ width: 300 })
		guiRef.current = gui

		// フォルダを作成してグループ化
		const positionsFolder = gui.addFolder('Decoration Positions')

		decorations.forEach((deco, index) => {
			const decoFolder = positionsFolder.addFolder(`${deco.slug} (${index})`)

			// Position
			const posFolder = decoFolder.addFolder('Position')
			posFolder.add(deco.position, 'x', -10, 10, 0.1).name('X')
			posFolder.add(deco.position, 'y', -10, 10, 0.1).name('Y')
			posFolder.add(deco.position, 'z', -10, 10, 0.1).name('Z')

			// Rotation (degrees for easier debugging)
			const rotFolder = decoFolder.addFolder('Rotation')
			const rotationDegrees = {
				x: deco.rotation ? THREE.MathUtils.radToDeg(deco.rotation.x) : 0,
				y: deco.rotation ? THREE.MathUtils.radToDeg(deco.rotation.y) : 0,
				z: deco.rotation ? THREE.MathUtils.radToDeg(deco.rotation.z) : 0,
			}

			rotFolder
				.add(rotationDegrees, 'x', -180, 180, 1)
				.name('X (deg)')
				.onChange((value: number) => {
					if (deco.rotation) {
						deco.rotation.x = THREE.MathUtils.degToRad(value)
						onUpdate(deco)
					}
				})

			rotFolder
				.add(rotationDegrees, 'y', -180, 180, 1)
				.name('Y (deg)')
				.onChange((value: number) => {
					if (deco.rotation) {
						deco.rotation.y = THREE.MathUtils.degToRad(value)
						onUpdate(deco)
					}
				})

			rotFolder
				.add(rotationDegrees, 'z', -180, 180, 1)
				.name('Z (deg)')
				.onChange((value: number) => {
					if (deco.rotation) {
						deco.rotation.z = THREE.MathUtils.degToRad(value)
						onUpdate(deco)
					}
				})

			// Available状態
			decoFolder.add(deco, 'isAvailable').name('Is Available')

			// 初期状態では折りたたむ
			decoFolder.close()
		})

		// クリーンアップ関数
		return () => {
			if (guiRef.current) {
				guiRef.current.destroy()
			}
		}
	}, [decorations])

	return null
}

export const GuiComponent: React.FC = () => {
	const context = useContext(EditorContext)

	const handleUpdate = (updatedDeco: DecoPositionItem) => {
		context?.setDisplayedDecorations(prev =>
			prev.map(item =>
				item.id === updatedDeco.id
					? {
							...item,
							position: updatedDeco.position,
							rotation: updatedDeco.rotation,
						}
					: item,
			),
		)
	}

	return <DebugGUI decorations={context?.decoPositionList || []} onUpdate={handleUpdate} />
}
