import typescriptPlugin from 'rollup-plugin-typescript'
import typescript from 'typescript'

export default {
    input: './src/index.ts',
    external: [
        'react',
        'react-dom',
        'autobind-decorator',
        'rxjs',
        'rxjs/operators',
    ],
    plugins: [
        typescriptPlugin({
            typescript,
        }),
    ]
}
