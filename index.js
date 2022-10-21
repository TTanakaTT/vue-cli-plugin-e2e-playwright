const path = require('path')

module.exports = (api) => {
  const { info, execa, resolveModule } = require('@vue/cli-shared-utils')

  api.registerCommand('test:e2e', {
    description: 'Run e2e tests with Playwright',    usage: 'vue-cli-service test:e2e [options]',
    options: {
      '--timeout <timeout>':
        'Specify test timeout threshold in milliseconds, zero for unlimited (default: 30000)',
      '--browser <browser>':
        'Browser to use for tests, one of "all", "chromium", "firefox" or "webkit" (default: "chromium")'
    }
  }, async (args, rawArgs) => {
    removeArg(rawArgs, 'url')

    info('Starting e2e tests...')

    const { url, server } = args.url
      ? { url: args.url }
      : await api.service.run('serve')

    const configs = typeof args.config === 'string' ? args.config.split(',') : []
    const pwArgs = [
      'test', ...configs,
      ...rawArgs
    ]

    // Use loadModule to allow users to customize their playwright dependency version.
    const playwrightPackageJsonPath =
      resolveModule('@playwright/test/package.json', api.getCwd()) ||
      resolveModule('@playwright/test/package.json', __dirname)
    const playwrightPkg = require(playwrightPackageJsonPath)
    const playwrightBinPath = path.resolve(
      playwrightPackageJsonPath,
      '../',
      playwrightPkg.bin.playwright
    )

    const runner = execa(playwrightBinPath, pwArgs, { stdio: 'inherit' })
    if (server) {
      runner.on('exit', () => server.stop())
      runner.on('error', () => server.stop())
    }

    if (process.env.VUE_CLI_TEST) {
      runner.on('exit', code => {
        process.exit(code)
      })
    }

    return runner
  })
}

module.exports.defaultModes = {
  'test:e2e': 'production'
}

function removeArg (rawArgs, argToRemove, offset = 1) {
  const matchRE = new RegExp(`^--${argToRemove}$`)
  const equalRE = new RegExp(`^--${argToRemove}=`)

  const i = rawArgs.findIndex(arg => matchRE.test(arg) || equalRE.test(arg))
  if (i > -1) {
    rawArgs.splice(i, offset + (equalRE.test(rawArgs[i]) ? 0 : 1))
  }
}
