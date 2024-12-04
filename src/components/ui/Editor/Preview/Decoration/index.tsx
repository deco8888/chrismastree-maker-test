import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { DecorationSettings } from '~/types/editor'

type DecorationProps = {
	objType: string
	position: THREE.Vector3
	rotation?: THREE.Euler
	modelPath: string
	setting?: DecorationSettings
	onDragEnd?: any
}

const LoadedDecoration = (props: DecorationProps) => {
	const { position, rotation, modelPath, setting, onDragEnd } = props
	const { nodes } = useGLTF(`/assets/models/decoration/${modelPath}`)
	useGLTF.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/')

	const [scale, setScale] = useState<number>(1)
	const meshRef = useRef<THREE.Mesh>(null)

	/*-------------------------------
		マテリアル設定
	-------------------------------*/
	const material = useMemo(() => {
		const material = (nodes[props.objType] as THREE.Mesh).material as THREE.MeshStandardMaterial
		material.color = new THREE.Color(setting?.color ?? '#9A9D9C')
		material.emissiveIntensity = 0
		return material
	}, [setting?.color])

	/*-------------------------------
		サイズ設定
	-------------------------------*/
	useEffect(() => {
		if (!setting?.size) return
		setScale(1 + setting.size * 0.1)
	}, [setting?.size])

	return (
		<mesh
			ref={meshRef}
			position={position}
			rotation={rotation ? rotation : (nodes[props.objType] as THREE.Mesh).rotation}
		>
			{nodes[props.objType] && (
				<group {...props} dispose={null}>
					<mesh
						castShadow
						receiveShadow
						geometry={(nodes[props.objType] as THREE.Mesh).geometry}
						material={material}
						scale={scale}
					/>
				</group>
			)}
		</mesh>
	)
}

export const Decoration = (props: DecorationProps) => {
	if (!props.modelPath) return null

	return <LoadedDecoration {...props} />
}
