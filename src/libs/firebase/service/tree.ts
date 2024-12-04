import { addDoc, collection } from 'firebase/firestore';

import { TreeData } from '~/libs/schema/treeData';

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
	public async saveTree( data: TreeData, userId: string ): Promise<any> {

		// データの整形
		const formattedData = {
			userId,
			treeColor: data.treeColor,
			starColor: data.starColor,
			decorationsByType: data.decorationsByType.map( d => ( {
				slug: d.slug,
				count: d.count,
				setting: {
					color: d.setting?.color ?? null,
					size: Number( d.setting?.size?.toFixed( 2 ) ) ?? null,
				},
				list: d.list?.map( l => ( { id: l.id,
					slug: d.slug,
					position: {
						x: Number( l.position.x.toFixed( 2 ) ),
						y: Number( l.position.y.toFixed( 2 ) ),
						z: Number( l.position.z.toFixed( 2 ) ),
					},
					rotation: l.rotation
						? {
							x: Number( l.rotation.x.toFixed( 2 ) ),
							y: Number( l.rotation.y.toFixed( 2 ) ),
							z: Number( l.rotation.z.toFixed( 2 ) ),
						}
						: null,
					objType: l.objType ?? null,
				} ) ),
			} ) ),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		try {

			const exists = await this.collectionExists();
			const treeId = await this.getTreeNumber();

			if ( ! exists ) {

				// コレクションが存在しない場合は新規作成
				await addDoc( collection( db, this.POST_COLLECTION ), {
					...formattedData,
					treeId,
				} );

			} else {

				// 既存のコレクションに追加
				await addDoc( collection( db, this.POST_COLLECTION ), {
					...formattedData,
					treeId,
				} );

			}

			return {
				treeId,
				success: true,
			};

		} catch ( error ) {

			console.error( 'Post error:', error );
			// throw error instanceof Error ? error : new Error( '投稿に失敗しました' );

			return {
				treeId: '',
				success: false,
				error: error instanceof Error ? error.message : '保存に失敗しました'
			};

		}

	}

}
