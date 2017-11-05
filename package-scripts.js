const {
    concurrent,
    series
} = require('nps-utils')

module.exports = {
  scripts: {
    default: {
        description: 'run and watch the example',
        script: series.nps(
            'build.prepare',
            'build.watch'
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
        script: 'tslint "src/**/*.ts"',
    },
    prettier: {
        description: 'format the code using prettier',
        script: 'prettier --write \"src/**/*(*.ts|*.tsx)\"',
    },
    validate: {
        description: 'lint the code, run the test and build',
        script: concurrent.nps('lint', 'test', 'build'),
    },
    release: {
        default: {
            description: 'create a new tag depending on the last commits and update changelog accordingly, create a tag',
            script: 'standard-version --no-verify',
        },
        first: {
            description: 'first release usualy 0.0.0',
            script: 'standard-version --no-verify --first-release',
        }
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
        watch: {
            description: 'build and watch for changes',
            script: 'NODE_ENV=development webpack-dev-server --config webpack.example.js',
        },
        production: {
            description: 'build for production',
            script: 'NODE_ENV=production webpack',
        },
    },
    example: {
        default: {
            description: 'build the example app',
            script: series(
                'nps example.prepare',
                'NODE_ENV=production tsc -p example'
            )
        },
        prepare: {
            description: 'clean the build dir',
            script: series(
                'rimraf build -r',
                'mkdir build'
            ),
        },
        watch: {
            description: 'build the example app and watch for sources',
            script: series(
                'nps example.prepare',
                'NODE_ENV=development tsc --watch -p example'
            )
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
  },
}
