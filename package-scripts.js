const {
    concurrent,
    series
} = require('nps-utils')

module.exports = {
    scripts: {
        default: {
            description: 'run and watch the example',
            script: series.nps(
                'styleguide.prepare',
                'styleguide.watch'
            ),
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
            default: {
                description: 'build the library',
                script: series.nps(
                    'build.prepare',
                    'build.production'
                ),
            },
            prepare: {
                description: 'clean dist dir',
                script: series(
                    'rimraf dist -r',
                    'mkdir dist'
                ),
            },
            production: {
                description: 'build for production',
                script: 'NODE_ENV=production webpack',
            },
            watch: {
                description: 'build ts app and watch for changes',
                script: 'NODE_ENV=production webpack --watch'
            }
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
            script: 'semantic-release pre && npm publish && semantic-release post'
        },
        styleguide: {
            default: {
                description: 'build the styleguide (documentation)',
                script: 'styleguidist build'
            },
            prepare: {
                description: 'clean the directory of the styleguide',
                script: 'rimraf docs'
            },
            watch: {
                description: 'serve the styleguide and watch for changes (dev mode)',
                script: 'styleguidist server'
            }
        }
    },
}
