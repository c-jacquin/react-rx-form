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
        'rxjs/add/observable/merge',
        'rxjs/add/observable/fromEvent',
        'rxjs/add/observable/of',
        'rxjs/add/operator/do',
        'rxjs/add/operator/filter',
        'rxjs/add/operator/map',
        'rxjs/add/operator/merge',
        'rxjs/add/operator/mergeMap',
        'rxjs/add/operator/switchMap',
        'rxjs/add/operator/debounceTime',
        'rxjs/add/operator/throttleTime', 
        'rxjs/Subject',
        'rxjs/Subscription'
    ],
    plugins: [
        typescriptPlugin({
            typescript,
        }),
    ]
}
