'use client'

import { onAuthStateChanged, User as FirebaseUser, getRedirectResult } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { createContext, useCallback, useEffect, useState } from 'react'

import { login } from '~/libs/firebase/auth'
import { auth, db } from '~/libs/firebase/config'

import { UserData } from '~/types/user'

interface AuthContextType {
	user: Partial<UserData> | null
	loading: boolean
	error: Error | null
	signIn: () => Promise<void>
	signOut: () => Promise<void>
}

const initialContext: AuthContextType = {
	user: null,
	loading: true,
	error: null,
	signIn: async () => {},
	signOut: async () => {},
}

export const AuthContext = createContext<AuthContextType>(initialContext)

type AuthProviderProps = {
	children: React.ReactNode
}

/**
 * ログイン認証
 * @param children
 * @returns
 */
export default function AuthProvider({ children }: AuthProviderProps) {
	const [state, setState] = useState<Omit<AuthContextType, 'signIn' | 'signOut'>>(initialContext)

	/*-------------------------------
		ユーザー情報の作成または更新
	-------------------------------*/
	const createOrUpdateUser = useCallback(async (firebaseUser: FirebaseUser) => {
		try {
			const docRef = doc(db, 'users', firebaseUser.uid)
			const userDoc = await getDoc(docRef)

			// ユーザー情報
			const userData = {
				id: firebaseUser.uid,
				name: firebaseUser.displayName ?? '',
				email: firebaseUser.email ?? '',
			}

			if (!userDoc.exists()) {
				// 新規ユーザー情報を保存
				await setDoc(docRef, {
					...userData,
					createdAt: serverTimestamp(),
				})
			} else {
				// 既存ユーザー情報を更新
				await setDoc(docRef, userData, { merge: true })
			}

			// 更新後のユーザー情報を取得
			const updatedDoc = await getDoc(docRef)

			return {
				...updatedDoc.data(),
			}
		} catch (error) {
			console.error('Error creating/updating user:', error)
			throw error
		}
	}, [])

	/*-------------------------------
		ログイン状態の監視
	-------------------------------*/
	useEffect(() => {
		// onAuthStateChanged: 認証情報の変更を監視
		const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
			try {
				if (firebaseUser) {
					// ユーザー情報の作成または更新
					const user = await createOrUpdateUser(firebaseUser)
					setState({ user, loading: false, error: null })
				} else {
					// ログインしていない場合
					setState({ user: null, loading: false, error: null })
				}
			} catch (error) {
				console.error('Error in onAuthStateChanged:', error)
			}
		})

		return () => unsubscribe()
	}, [createOrUpdateUser])

	/*-------------------------------
		ログイン処理
	-------------------------------*/
	const signIn = async () => {
		try {
			setState(prev => ({ ...prev, loading: true }))
			// Google認証プロバイダーを使ってログイン
			await login()
		} catch (error) {
			setState(prev => ({
				...prev,
				error: error instanceof Error ? error : new Error('Sign in failed'),
			}))
			throw error
		} finally {
			setState(prev => ({ ...prev, loading: false }))
		}
	}

	/*-------------------------------
		ログアウト処理
	-------------------------------*/
	const signOut = async () => {
		try {
			setState(prev => ({ ...prev, loading: true }))
			// ログアウト
			await auth.signOut()
		} catch (error) {
			setState(prev => ({
				...prev,
				error: error instanceof Error ? error : new Error('Sign out failed'),
			}))
			throw error
		} finally {
			setState(prev => ({ ...prev, loading: false }))
		}
	}

	/*-------------------------------
		ログイン結果を取得
	-------------------------------*/
	useEffect(() => {
		getRedirectResult(auth).catch(error => {
			console.error('Error in getRedirectResult:', error)
		})
	}, [])

	return <AuthContext.Provider value={{ ...state, signIn, signOut }}>{children}</AuthContext.Provider>
}
