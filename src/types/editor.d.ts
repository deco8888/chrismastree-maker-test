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
	list?: DisplayedDecoration[] // 使用されている装飾品のリスト
	setting?: DecorationSettings
	controller?: JSX.Element
}

export interface DisplayedDecoration {
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
	usedBy?: string // 使用されている装飾品のID
}
