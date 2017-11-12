const {
    concurrent,
    series
} = require('nps-utils')

module.exports = {
    scripts: {
        default: {
            description: 'run and watch the example',
            script: 'styleguidist server',            
        },
        commit: {
            description: 'commit using conventionnal changelog',
            script: 'git-cz',
        },
        coveralls: {
            description: 'upload coverage info to coverall.io',
            script: 'cat ./coverage/coverage.lcov | ./node_modules/coveralls/bin/coveralls.js',
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
            script: concurrent.nps('lint', 'test.cover', 'build'),
        },
        build: {
            description: 'build the library',
            script: series(
                'rimraf dist -r',
                'mkdir dist',
                'NODE_ENV=production webpack',
            ),
        },
        release: {
            description: 'do the semantic-release stuff',
            script: series(
                'semantic-release pre',
                'npm publish',
                'semantic-release post'   
            ),
        },
        styleguide: {
            description: 'build the styleguide (documentation)',
            script: series(
                'rimraf docs',
                'styleguidist build'
            ),
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
    },
}
