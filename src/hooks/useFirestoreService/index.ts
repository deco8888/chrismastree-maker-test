import { useMemo } from "react";

import { BaseFirestorService } from "~/libs/firebase/service/base";

export const useFirestoreService = <T extends BaseFirestorService> ( ServiceClass: new () => T ) => {

	const service = useMemo( () => new ServiceClass(), [ ServiceClass ] );
	return service;

};
