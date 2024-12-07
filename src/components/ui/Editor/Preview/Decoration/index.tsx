import { useGLTF } from '@react-three/drei'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { EditorContext } from '~/hooks/useEditor'

import { DecorationSettings } from '~/types/editor'

type DecorationProps = {
	objType: string
	position: THREE.Vector3
	rotation?: THREE.Euler
	modelPath: string
	setting?: DecorationSettings
	onDragEnd?: any
	model: THREE.Mesh | null
	type: 'new' | 'clone'
}

/**
 * 新規追加の場合、useGLTFでモデルを読み込む
 * @param props
 * @returns
 */
const LoadedDecoration = (props: DecorationProps) => {
	const context = useContext(EditorContext)
	const { modelPath, objType } = props
	const { nodes } = useGLTF(`/assets/models/decoration/${modelPath}`)
	useGLTF.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/')

	useEffect(() => {
		if (!nodes[objType]) return
		context?.setModelList(prev => {
			if (!prev[objType]) {
				prev[objType] = nodes[objType] as THREE.Mesh
			}
			return prev
		})
	}, [nodes, objType])

	if (!nodes[objType]) return null

	return <DecorationItem {...props} model={nodes[objType] as THREE.Mesh} />
}

/**
 * 装飾品の設定
 * @param props
 * @returns
 */
const DecorationItem = (props: DecorationProps) => {
	const { position, rotation, setting, model } = props
	const [scale, setScale] = useState<number>(1)
	const meshRef = useRef<THREE.Mesh>(null)

	/*-------------------------------
		ジオメトリ設定
	-------------------------------*/
	const geometry = useMemo(() => {
		const geometry = (model as THREE.Mesh).geometry
		return geometry
	}, [model])

	/*-------------------------------
		マテリアル設定
	-------------------------------*/

	const material = useMemo(() => {
		let material = (model as THREE.Mesh).material as THREE.MeshStandardMaterial
		const newMaterial = new THREE.MeshStandardMaterial()
		Object.keys(material).forEach(key => {
			if (!['color', 'type', 'isMaterial', 'isMeshStandardMaterial'].includes(key) && key in newMaterial) {
				const materialKey = key as keyof THREE.MeshStandardMaterial
				newMaterial.setValues({ [key]: material[materialKey] })
			}
		})
		material = newMaterial

		const color = setting?.color ? setting.color[Math.floor(Math.random() * setting.color.length)] : '#9A9D9C'
		material.color = new THREE.Color(color)
		material.emissiveIntensity = 0
		return material
	}, [])

	useEffect(() => {
		if (meshRef.current === null) return
		const material = meshRef.current.material as THREE.MeshStandardMaterial
		const color = setting?.color ? setting.color[Math.floor(Math.random() * setting.color.length)] : '#9A9D9C'
		material.color = new THREE.Color(color)
		material.needsUpdate = true
	}, [setting?.color])

	/*-------------------------------
		サイズ設定
	-------------------------------*/
	useEffect(() => {
		if (!setting?.size) return
		setScale(1 + setting.size * 0.1)
	}, [setting?.size])

	if (!model) return null

	return (
		<mesh position={position}>
			<group dispose={null}>
				<mesh
					ref={meshRef}
					castShadow
					receiveShadow
					geometry={geometry}
					material={material}
					scale={scale}
					position={position}
					rotation={rotation ? rotation : model.rotation}
				></mesh>
			</group>
		</mesh>
	)
}

/**
 * 装飾品
 * @param props
 * @returns
 */
export const Decoration = (props: Omit<DecorationProps, 'type'>) => {
	if (props.model) {
		return <DecorationItem {...props} model={props.model} type="clone" />
	} else {
		return <LoadedDecoration {...props} type="new" />
	}
}
