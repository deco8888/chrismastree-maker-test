import * as THREE from 'three'

export interface DecorationSettings {
	size?: number
	color?: string
}
export interface DecorationsByType {
	slug: string
	label: string
	path: string
	objType: string
	// size?: number
	// color?: string
	count?: number
	list?: Decoration[]
	setting?: DecorationSettings
	controller?: JSX.Element
}

export interface Decoration {
	id: string
	slug: string
	position?: THREE.Vector3
	rotation?: THREE.Euler
}

export interface SelectedDecoration {
	slug: string
	label: string
	path: string
	objType: string
}

export interface DecoPositionItem {
	id?: string
	slug: string
	position: THREE.Vector3
	rotation?: THREE.Euler
	isAvailable: boolean
	usedBy?: string // 使われている装飾品のID
}
