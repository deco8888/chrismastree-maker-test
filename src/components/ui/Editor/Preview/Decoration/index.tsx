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
	}, [model, props.objType])

	/*-------------------------------
		マテリアル設定
	-------------------------------*/
	const material = useMemo(() => {
		const material = (model as THREE.Mesh).material as THREE.MeshStandardMaterial
		material.color = new THREE.Color(setting?.color ?? '#9A9D9C')
		material.emissiveIntensity = 0
		return material
	}, [model, props.objType, setting?.color])

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
export const Decoration = (props: DecorationProps) => {
	if (props.model) {
		return <DecorationItem {...props} model={props.model} />
	} else {
		return <LoadedDecoration {...props} />
	}
}
