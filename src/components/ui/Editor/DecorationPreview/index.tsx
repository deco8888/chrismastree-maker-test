import { useGLTF } from '@react-three/drei'
import { ThreeEvent, useThree } from '@react-three/fiber'
import { useContext, useRef, useState } from 'react'
import * as THREE from 'three'

import { EditorContext } from '~/hooks/useEditor'

type DecorationPreviewProps = {
	position: THREE.Vector3
	modelPath: string
	onDragEnd: any
}

const LoadedDecorationPreview = (props: DecorationPreviewProps) => {
	const { position, modelPath, onDragEnd } = props
	const { nodes } = useGLTF(`/assets/models/decoration/${modelPath}`)
	useGLTF.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/')

	const meshRef = useRef<THREE.Mesh>(null)
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const { gl } = useThree()
	const context = useContext(EditorContext)

	const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation()
		setIsDragging(true)
		gl.domElement.style.cursor = 'grabbing'
	}

	const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
		setIsDragging(false)
		gl.domElement.style.cursor = 'grab'

		if (onDragEnd) {
			// onDragEnd(meshRef.current?.position.clone())
		}
	}

	const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
		if (!isDragging || !context?.treeRef.current) return

		const raycaster = new THREE.Raycaster()
		const mouse = new THREE.Vector2()

		// マウス位置を正規化デバイス座標(-1 ~ 1)に変換
		const rect = gl.domElement.getBoundingClientRect()
		mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
		mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

		console.log(meshRef.current?.position)

		// raycaster.setFromCamera(mouse, camera)

		// const intersects = raycaster.intersectObject(context.treeRef.current, true)

		// if (intersects.length > 0) {
		// 	// 交差点を取得
		// 	const intersectionPoint = intersects[0]?.point

		// 	const normal = intersects[0]?.face?.normal
		// 	const offset = 0.1
		// 	if (intersectionPoint && normal) {
		// 		const finalPosition = intersectionPoint.clone().add(normal.multiplyScalar(offset))
		// 		meshRef.current?.position.copy(finalPosition)
		// 	}
		// }
	}

	return (
		<mesh
			ref={meshRef}
			position={position ?? nodes.Ball?.position}
			scale={[1, 1, 1]}
			onPointerDown={onPointerDown}
			onPointerUp={onPointerUp}
			onPointerMove={onPointerMove}
			onPointerOver={() => (gl.domElement.style.cursor = 'grab')}
			onPointerOut={() => (gl.domElement.style.cursor = 'auto')}
		>
			{nodes.Ball && (
				<group {...props} dispose={null}>
					<mesh
						castShadow
						receiveShadow
						geometry={(nodes.Ball as THREE.Mesh).geometry}
						material={(nodes.Ball as THREE.Mesh).material}
					/>
				</group>
			)}
		</mesh>
	)
}

export const DecorationPreview = (props: DecorationPreviewProps) => {
	if (!props.modelPath) return null

	return <LoadedDecorationPreview {...props} />
}
