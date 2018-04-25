import typescriptPlugin from 'rollup-plugin-typescript'
import typescript from 'typescript'

export default {
    input: './src/index.ts',
    external: [
        'react',
        'react-dom',
        'autobind-decorator',
        'rxjs/Observable',
        'rxjs/BehaviorSubject',
        'rxjs/Subject',
        'rxjs/Subscription',
        'rxjs/operators',
        'rxjs/observable/of',
        'rxjs/observable/fromEvent',
        'rxjs/observable/fromPromise',
        'rxjs/observable/merge'
    ],
    plugins: [
        typescriptPlugin({
            typescript,
        }),
    ]
}
