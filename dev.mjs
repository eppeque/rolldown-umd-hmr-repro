import { styleText } from 'node:util';
import nodeVm from 'node:vm';
import { dev } from 'rolldown/experimental';
import { DevRuntime } from 'rolldown/experimental/runtime';

function blue(text) {
	return styleText('blue', text);
}

const formats = ['esm', 'umd'];
for (const format of formats) {
	const runtime = new DevRuntime('...');
	const accepted = [];

	runtime.hooks = {
		createModuleHotContext: (id) => ({
			accept() {
				accepted.push(id);
			}
		}),
		onModuleCacheRemoval() {}
	};

	const context = nodeVm.createContext({ runtime });

	let output;
	const engine = await dev(
		{
			input: './src/entry.js',
			experimental: {
				devMode: {
					skipCommonRuntimeInjection: true,
					implement: 'globalThis.__rolldown_runtime__ = runtime;'
				}
			}
		},
		{ format, name: 'Repro' },
		{
			watch: { enabled: false, skipWrite: true },
			onOutput(result) {
				output = result;
			}
		}
	);

	try {
		await engine.run();
		await engine.ensureCurrentBuildFinish();

		if (!output) throw new Error('No initial output');
		if (output instanceof Error) {
			throw output;
		}

		for (const chunk of output.output) {
			if (chunk.type === 'chunk') {
				nodeVm.runInContext(chunk.code, context);
			}
		}

		console.log(
			`${blue(`[${format}]`)}\nAccepted: ${accepted.join(', ')}\nImporters of "dependency.js": ${runtime.getImporters('src/dependency.js')}`
		);
	} finally {
		await engine.close();
	}
}
