'use client'

import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { CSSProperties, Suspense, useContext, useEffect, useState } from 'react'
import * as THREE from 'three'

import { EditorContext } from '~/hooks/useEditor'

import { ChristmasTreeGLTF } from '~/types/christmasTree'

import { TreeLeaf } from './Leaf'
import { DecorationPreview } from '../DecorationPreview'

const MODEL_PATH = '/assets/models/christmasTree.glb'

const meshOptions = {
	castShadow: true,
	receiveShadow: true,
}

const ChristmasTreeModel = () => {
	const context = useContext(EditorContext)
	const { nodes, materials, cameras } = useGLTF(MODEL_PATH) as ChristmasTreeGLTF
	useGLTF.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/')

	const camera = cameras[0] as THREE.PerspectiveCamera
	const verticalFov = ((camera.fov * Math.PI) / 180) * 2 // カメラの視野角をラジアンに変換
	return (
		<Canvas
			style={
				{
					width: '100%',
					height: '100%',
					position: 'absolute',
					top: 0,
					left: 0,
					aspectRatio: 16 / 9,
				} as CSSProperties
			}
			gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
		>
			{/* ライト */}
			<ambientLight intensity={2} />
			<directionalLight position={nodes.FrontLight?.position} rotation={nodes.FrontLight?.rotation} />
			<directionalLight position={nodes.BackLight?.position} rotation={nodes.BackLight?.rotation} />

			{/* カメラ */}
			<PerspectiveCamera
				makeDefault
				far={camera.far}
				near={camera.near}
				fov={camera.fov}
				position={camera.position}
				rotation={camera.rotation}
			/>

			{/* モデル */}
			<Suspense fallback={null}>
				<group ref={context?.treeRef}>
					<TreeLeaf nodes={nodes} materials={materials} color={context?.treeColor} />
				</group>

				{/* 木の幹 */}
				<mesh {...meshOptions} geometry={nodes.Tree!.geometry} material={materials.tree} />

				{/* 装飾品 */}
				{context?.decorations.map((decoration, i) => (
					<DecorationPreview
						key={i}
						position={decoration.position}
						modelPath={decoration.path}
						onDragEnd={(newPos: any) => {
							context?.setDecorations(prev =>
								prev.map(v => (v.id === decoration.id ? { ...v, position: newPos } : visualViewport)),
							)
						}}
					/>
				))}
			</Suspense>

			{/* カメラコントロール */}
			<OrbitControls
				enablePan={false}
				enableZoom={false}
				// 回転のみ許可
				enableRotate={true}
				// X軸回転はなし
				minPolarAngle={verticalFov}
				maxPolarAngle={verticalFov}
				// Y軸回転のみ許可
				maxAzimuthAngle={Infinity}
				minAzimuthAngle={-Infinity}
				// 回転速度の調整
				rotateSpeed={0.5}
				target={new THREE.Vector3(0, 1.2, 0)}
			/>
		</Canvas>
	)
}

export function ChristmasTree() {
	const [modelPath, setModelPath] = useState<string | null>(null)

	/*---------------------------------
		モデルを読み込む
	---------------------------------*/
	useEffect(() => {
		const loadModel = async () => {
			try {
				const response = await fetch(MODEL_PATH)
				const blob = await response.blob()
				const url = URL.createObjectURL(blob)
				setModelPath(url)
			} catch (error) {
				console.error('Error loading model:', error)
			}
		}

		loadModel()
	}, [])

	if (!modelPath) {
		return <div>Loading...</div>
	}

	return <ChristmasTreeModel />
}
