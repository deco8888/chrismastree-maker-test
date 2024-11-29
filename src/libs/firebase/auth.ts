import { signInWithPopup, signOut, User } from 'firebase/auth';

import { auth, provider } from '~/libs/firebase/config';

/**
 * Googleログイン
 * @returns {Promise<User>} ユーザー情報
 */
export const login = async (): Promise<User> => {

	try {

		const result = await signInWithPopup( auth, provider );
		return result.user;

	} catch ( error ) {

		console.error( 'Google sign in error:', error );
		throw error;

	}

};

/**
 * ログアウト
 * @returns {Promise<void>}
 */
export const logout = async (): Promise<void> => {

	try {

		await signOut( auth );

	} catch ( error ) {

		console.error( 'Sign out error:', error );
		throw error;

	}

};
