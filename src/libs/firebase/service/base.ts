import {
	addDoc,
	collection,
	doc,
	DocumentReference,
	getDocs,
	limit,
	onSnapshot,
	orderBy,
	query,
} from 'firebase/firestore';

import { db } from '../config';

export abstract class BaseFirestorService {

	protected abstract readonly POST_COLLECTION: string
	protected abstract readonly VOTE_COLLECTION_KEY: string
	protected readonly USERS_COLLECTION = 'users';

	/**
	 * コレクションの存在確認
	 * @returns
	 */
	public async collectionExists(): Promise<boolean> {

		// limit(1)で必要最小限のデータのみを取得 ※不要なドキュメントIDの生成を避ける
		const q = query( collection( db, this.POST_COLLECTION ), limit( 1 ) );
		const snapshot = await getDocs( q );
		return ! snapshot.empty;

	}

	/**
	 * 投稿
	 * @param data 投稿データ
	 * @returns
	 */
	public async post<T>( data: T ): Promise<void> {

		try {

			const exists = await this.collectionExists();

			if ( ! exists ) {

				// コレクションが存在しない場合は新規作成
				await addDoc( collection( db, this.POST_COLLECTION ), {
					...data,
					createdAt: new Date(),
				} );

			} else {

				// 既存のコレクションに追加
				await addDoc( collection( db, this.POST_COLLECTION ), {
					...data,
					createdAt: new Date(),
				} );

			}

		} catch ( error ) {

			console.error( 'Post error:', error );
			throw error instanceof Error ? error : new Error( '投稿に失敗しました' );

		}

	}

	/**
	 * 投稿データ 全件取得
	 */
	public async getAllPosts<T>(): Promise<T[]> {

		const q = query( collection( db, this.POST_COLLECTION ), orderBy( 'createdAt', 'desc' ) );

		const snapshot = await getDocs( q );
		const posts = snapshot.docs.map( doc => ( {
			id: doc.id,
			...doc.data(),
		} ) ) as T[];

		return posts;

	}

	/**
	 * 投稿データ 全件取得(リアルタイム)
	 */
	public subscribeToAllPosts<T>( callback: ( posts: T[] ) => void ) {

		const q = query( collection( db, this.POST_COLLECTION ), orderBy( 'createdAt', 'desc' ) );

		return onSnapshot(
			q,
			snapshot => {

				const posts = snapshot.docs.map( doc => ( {
					id: doc.id,
					...doc.data(),
				} ) ) as T[];

				callback( posts );

			},
			error => {

				console.error( 'Subscribe to data error:', error );
				throw error instanceof Error ? error : new Error( 'データの取得に失敗しました' );

			},
		);

	}

	/**
	 * 投稿データ 1件取得
	 * @param id
	 * @param callback
	 * @returns
	 */
	public subscribeToPost<T>( id: string, callback: ( posts: T ) => void ) {

		const ref = doc( db, this.POST_COLLECTION, id ) as DocumentReference<T>;

		return onSnapshot(
			ref,
			snapshot => {

				snapshot.data() as T;
				callback( snapshot.data() as T );

			},
			error => {

				console.error( `Subscribe to ${this.VOTE_COLLECTION_KEY} error:`, error );
				throw error instanceof Error ? error : new Error( 'データの取得に失敗しました' );

			},
		);

	}

}
