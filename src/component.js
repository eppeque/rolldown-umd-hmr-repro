import { value } from './dependency';

export function Component() {
	return value;
}

if (import.meta.hot) {
	import.meta.hot.accept();
}
