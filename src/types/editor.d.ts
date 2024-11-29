import * as THREE from 'three'

export interface DecorationsByType {
	slug: string
	label: string
	path: string
	size?: number
	count?: number
	list?: Decoration[]
}

export interface Decoration {
	id: string
	slug: string
	position?: THREE.Vector3
	color?: string
}

export interface SelectedDecoration {
	slug: string
	label: string
	path: string
}

export interface DecoPositionItem {
	id: string
	slug: string
	position: THREE.Vector3
	isAvailable: boolean
}
