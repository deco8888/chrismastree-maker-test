import { useGLTF } from '@react-three/drei'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { EditorContext } from '~/hooks/useEditor'

import { DecorationSettings } from '~/types/editor'

const useLoadModel = (modelPath: string, objType: string): THREE.Mesh | undefined | null => {
	const context = useContext(EditorContext)
	const isLoading = useRef<boolean>(false)
	const { nodes } = useGLTF(`/assets/models/decoration/${modelPath}`)
	useGLTF.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/')

	if (nodes[objType] === undefined) return null
	const model = nodes[objType] as THREE.Mesh

	context?.setModelList(prev => ({
		...prev,
		[modelPath]: model,
	}))
	isLoading.current = false
	return model

	// return useMemo(() => {
	// 	if (isLoading.current || !context?.modelList) return null
	// 	isLoading.current = true

	// 	if (context.modelList[modelPath]) {
	// 		isLoading.current = false
	// 		return context.modelList[modelPath]
	// 	} else {
	// 		const { nodes } = useGLTF(`/assets/models/decoration/${modelPath}`)
	// 		useGLTF.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/')

	// 		if (nodes[objType] === undefined) return null
	// 		const model = nodes[objType] as THREE.Mesh

	// 		context?.setModelList(prev => ({
	// 			...prev,
	// 			[modelPath]: model,
	// 		}))
	// 		isLoading.current = false
	// 		return model
	// 	}
	// }, [context?.modelList, modelPath, objType])
}

type DecorationProps = {
	objType: string
	position: THREE.Vector3
	rotation?: THREE.Euler
	modelPath: string
	setting?: DecorationSettings
	onDragEnd?: any
}

const LoadedDecoration = (props: DecorationProps) => {
	const { position, rotation, modelPath, setting, objType } = props
	const [scale, setScale] = useState<number>(1)
	const meshRef = useRef<THREE.Mesh>(null)

	const model = useLoadModel(modelPath, objType)

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

export const Decoration = (props: DecorationProps) => {
	if (!props.modelPath) return null

	return <LoadedDecoration {...props} />
}
