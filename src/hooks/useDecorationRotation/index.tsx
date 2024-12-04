import { useMemo } from 'react'
import * as THREE from 'three'

export const useDecorationRotation = (position?: THREE.Vector3, type?: string) => {
	return useMemo(() => {
		if (type === 'candy' && position) {
			// ツリーの中心軸からの方向ベクトルを計算
			const direction = new THREE.Vector3().subVectors(position, new THREE.Vector3(0, position.y, 0)).normalize()

			// 上向きベクトル
			const up = new THREE.Vector3(0, 1, 0)

			// 回転行列を作成
			const matrix = new THREE.Matrix4()
			matrix.lookAt(new THREE.Vector3(0, 0, 0), direction, up)

			// オイラー角に変換
			const rotation = new THREE.Euler()
			rotation.setFromRotationMatrix(matrix)

			// キャンディの場合は90度傾ける
			// rotation.x += Math.PI / 2

			return rotation
		}

		// その他の装飾品はランダムな回転
		return new THREE.Euler(0, Math.random() * Math.PI * 2, 0)
	}, [position, type])
}
