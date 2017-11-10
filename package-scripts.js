const {
    concurrent,
    series
} = require('nps-utils')

module.exports = {
    scripts: {
        default: {
            description: 'run and watch the example',
            script: 'styleguide.watch',            
        },
        commit: {
            description: 'commit using conventionnal changelog',
            script: 'git-cz',
        },
        clean: {
            description: 'clean useless temporary directories',
            script: concurrent({
                cleanTemp: 'rimraf .temp -rf',
                cleanBuild: 'rimraf dist -rf',
                cleanCoverage: 'rimraf coverage -rf'
            }),
        },
        lint: {
            description: 'lint the code with tslint',
            script: 'tslint "src/**/*.ts" -p tsconfig.json --fix',
        },
        prettier: {
            description: 'format the code using prettier',
            script: 'prettier --write \"src/**/*(*.ts|*.tsx)\"',
        },
        validate: {
            description: 'lint the code, run the test and build',
            script: concurrent.nps('lint', 'test', 'build'),
        },
        build: {
            description: 'build the library',
            scripts: series(
                'rimraf dist -r',
                'mkdir dist',
                'NODE_ENV=production webpack',
            )
        },
        test: {
            default: {
                description: 'run all the test once',
                script: 'NODE_ENV=test jest',
            },
            watch: {
                description: 'run in the amazingly intelligent Jest watch mode',
                script: 'NODE_ENV=test jest --watch',            
            },
            cover: {
                description: 'run test with istanbul test coverage',
                script: series(
                    'NODE_ENV=test jest --coverage',
                    'node _scripts_/test/remap-coverage',
                    'rimraf .temp -r'
                ),
            },
        },
        release: {
            description: 'do the semantic-release stuff',
            script: series(
                'semantic-release pre',
                'npm publish',
                'semantic-release post'   
            )
        },
        styleguide: {
            default: {
                description: 'build the styleguide (documentation)',
                script: series(
                    'rimraf docs',
                    'styleguidist build'
                )
            },
            watch: {
                description: 'serve the styleguide and watch for changes (dev mode)',
                script: 'styleguidist server'
            }
        }
    },
}
