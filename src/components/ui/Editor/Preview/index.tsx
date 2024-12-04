'use client'

import { Environment, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { CSSProperties, useCallback, useContext, useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { EditorContext, EditorContextType } from '~/hooks/useEditor'

import { ChristmasTreeGLTF } from '~/types/christmasTree'

import { Decoration } from './Decoration'
import { TreeLeaf } from './Leaf'
import { Star } from './Star'

const MODEL_PATH = '/assets/models/christmasTree.glb'

const DEG_TO_RAD = Math.PI / 180

const meshOptions = {
	castShadow: true,
	receiveShadow: true,
}

const useEditorPreviewScene = () => {
	/*-------------------------------
		モデルを読み込む
	-------------------------------*/
	const { nodes, materials, cameras } = useGLTF(MODEL_PATH) as ChristmasTreeGLTF
	useGLTF.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/')

	/*-------------------------------
		カメラの視野角を取得
	-------------------------------*/
	const camera = cameras[0] as THREE.PerspectiveCamera
	const verticalFov = ((camera.fov * Math.PI) / 180) * 2 // カメラの視野角をラジアンに変換

	const initDecoPositions = useCallback(() => {
		return Object.entries(nodes)
			.filter(([key, _]) => key.startsWith('decoPosition'))
			.map(([key, value]) => {
				// 装飾品(キャンディ)の初期回転位置を取得
				let rotation: THREE.Euler | undefined = undefined

				const candyRotation = value.userData.candyRotation
				if (candyRotation) {
					rotation = new THREE.Euler(
						candyRotation[0] * DEG_TO_RAD,
						candyRotation[2] * DEG_TO_RAD,
						-candyRotation[1] * DEG_TO_RAD,
					)
				}

				return {
					slug: key,
					position: new THREE.Vector3(value.position.x * 0.5, value.position.y * 0.5, value.position.z * 0.5),
					rotation: rotation,
					isAvailable: true,
				}
			})
	}, [nodes])

	return {
		nodes,
		materials,
		camera,
		verticalFov,
		initDecoPositions,
	}
}

type ChristmasTreeModelSceneProps = {
	children: React.ReactNode
}

/**
 * クリスマスツリーモデルシーン
 * @param children
 * @returns
 */
const EditorPreviewScene = ({ children }: ChristmasTreeModelSceneProps) => {
	const data = useEditorPreviewScene()
	const { nodes, camera, verticalFov, initDecoPositions } = data
	const context = useContext(EditorContext)

	/*-------------------------------
		装飾品の位置情報を取得
	-------------------------------*/
	useEffect(() => {
		if (!context?.decoPositionList || context.decoPositionList.length > 0) return
		const positions = initDecoPositions()
		context?.setDecoPositionList(positions)
	}, [context?.decoPositionList, data.initDecoPositions])

	return (
		<Canvas
			style={
				{
					width: '100%',
					height: '100%',
					position: 'absolute',
					top: 0,
					left: 0,
					aspectRatio: 960 / 1080,
				} as CSSProperties
			}
			gl={{ antialias: true, alpha: true }}
		>
			{/* ライト */}
			<ambientLight intensity={1} />
			<directionalLight intensity={1} position={nodes.FrontLight?.position} rotation={nodes.FrontLight?.rotation} />
			<directionalLight intensity={3} position={nodes.LeftLight?.position} rotation={nodes.LeftLight?.rotation} />
			<directionalLight intensity={0.5} position={nodes.RightLight?.position} rotation={nodes.RightLight?.rotation} />
			<directionalLight intensity={1} position={nodes.BackLight?.position} rotation={nodes.BackLight?.rotation} />

			{/* 環境 */}
			<Environment preset="forest" />

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
			{children}

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
				target={new THREE.Vector3(0, 0, 0)}
			/>

			{/* エフェクト */}
			<EffectComposer>
				<Bloom
					intensity={0.5} // ブルームの強さ
					luminanceThreshold={0} // 輝度しきい値
					luminanceSmoothing={1.0} // 輝度しきい値の滑らかさ
				/>
				<ToneMapping adaptive={true} />
			</EffectComposer>
		</Canvas>
	)
}

/**
 * クリスマスツリーモデル
 * @returns
 */
const ChristmasTreeModel = () => {
	const data = useEditorPreviewScene()
	const { nodes, materials } = data
	const context = useContext(EditorContext)

	const TreeBase = useMemo(
		() => (
			<>
				{/* 星 */}
				<Star nodes={nodes} color={context?.starColor} />

				{/* 葉っぱ */}
				<group ref={context?.treeRef}>
					<TreeLeaf nodes={nodes} color={context?.treeColor} />
				</group>

				{/* 木の幹 */}
				<mesh {...meshOptions} geometry={nodes.Tree!.geometry} material={materials.tree} />
			</>
		),
		[nodes, materials, context?.starColor, context?.treeColor],
	)

	return (
		<group position={[0, -1.5, 0]}>
			{/* ツリー + 基本パーツ */}
			{TreeBase}

			{/* 装飾品 */}
			<ChristmasTreeDecoration context={context} />
		</group>
	)
}

/**
 * クリスマスツリー装飾品
 * @returns
 */
const ChristmasTreeDecoration = ({ context }: { context: EditorContextType | undefined }) => {
	return (
		<group>
			{context?.decorations.map((decoration, i) => {
				const targetDecoration = context?.decorationsByType.find(v => v.slug === decoration.slug)
				if (!targetDecoration) return null

				console.log(decoration)

				return (
					<Decoration
						key={i}
						position={decoration.position ?? new THREE.Vector3()}
						rotation={decoration.rotation ?? undefined}
						modelPath={targetDecoration.path ?? ''}
						setting={targetDecoration.setting}
						objType={targetDecoration.objType ?? ''}
					/>
				)
			})}
		</group>
	)
}

/**
 * クリスマスツリーコンポーネント
 * @returns
 */
export function EditorPreview() {
	return (
		<EditorPreviewScene>
			<ChristmasTreeModel />
		</EditorPreviewScene>
	)
}
