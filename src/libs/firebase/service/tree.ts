import { addDoc, collection, getDocs, query, QuerySnapshot, updateDoc, where } from 'firebase/firestore';

import { TreeTextData } from '~/libs/schema/treeData';

import { ChristmasTreeData } from '~/types/firebase/chrestmasTree';

import { BaseFirestorService } from './base';
import { db } from '../config';

export class TreeService extends BaseFirestorService {

	protected readonly POST_COLLECTION = 'trees';
	protected readonly VOTE_COLLECTION_KEY = '';

	public async getTreeNumber(): Promise<number> {

		let treeNumber = 1;

		await this.getAllPosts().then( posts => {

			treeNumber = posts.length;

		} );

		return treeNumber;

	}

	/**
	 * ツリーデータ保存
	 * @param data ツリーデータ
	 * @param userId ユーザーID
	 * @returns
	 */
	public async saveTree( data: Omit<ChristmasTreeData, 'userId' | 'treeId'>, userId: string ): Promise<any> {

		try {

			const exists = await this.collectionExists();
			const treeId = await this.getTreeNumber();

			if ( ! exists ) {

				// コレクションが存在しない場合は新規作成
				await addDoc( collection( db, this.POST_COLLECTION ), {
					...data,
					treeId,
					userId,
				} );

			} else {

				// 既存のコレクションに追加
				await addDoc( collection( db, this.POST_COLLECTION ), {
					...data,
					treeId,
					userId,
				} );

			}

			return {
				treeId,
				success: true,
			};

		} catch ( error ) {

			console.error( 'Post error:', error );

			return {
				treeId: '',
				success: false,
				error: error instanceof Error ? error.message : '保存に失敗しました',
			};

		}

	}

	/**
	 * 特定のツリーデータ取得
	 * @param treeId
	 * @returns
	 */
	public async getSnapshot( treeId: string ): Promise<QuerySnapshot> {

		const q = query( collection( db, this.POST_COLLECTION ), where( 'treeId', '==', treeId ) );
		const snapshot = await getDocs( q );
		return snapshot;

	}

	/**
	 * ツリーデータ取得
	 * @param treeId
	 * @returns
	 */
	public async getTreeData( treeId: string ) {

		try {

			const snapshot = await this.getSnapshot( treeId );

			if ( ! snapshot.empty ) {

				const data = snapshot.docs.map( doc => doc.data() )[ 0 ] as ChristmasTreeData;

				return data;

			}

			return null;

		} catch ( error ) {

			console.error( 'Get Tree Data Error:', error );
			throw error instanceof Error ? error : new Error( 'ツリーデータの取得に失敗しました' );

		}

	}

	/**
	 *	ツリーデータ更新
	 * @param treeId
	 * @param data
	 */
	public async updateTreeData( treeId: string, data: TreeTextData ) {

		try {

			const snapshot = await this.getSnapshot( treeId );

			if ( ! snapshot.empty ) {

				const qDoc = snapshot.docs.find( doc => doc.data().treeId === treeId );

				if ( qDoc ) {

					await updateDoc( qDoc.ref, {
						...data,
						updatedAt: new Date(),
					} );

				}

			}

		} catch ( error ) {

			console.error( 'Update error:', error );
			throw error instanceof Error ? error : new Error( 'ニックネーム・コメントに失敗しました' );

		}

	}

}
