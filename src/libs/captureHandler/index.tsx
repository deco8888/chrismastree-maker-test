import { useThree } from '@react-three/fiber'
import { useCallback } from 'react'

export const useTreeCapture = () => {
	const { gl, scene, camera } = useThree()

	const captureTree = useCallback(async () => {
		gl.render(scene, camera)

		const imageUrl = gl.domElement.toDataURL('image/png')

		return imageUrl
	}, [gl, scene, camera])

	return { captureTree }
}
