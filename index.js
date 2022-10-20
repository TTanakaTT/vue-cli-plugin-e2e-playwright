const { info, execa } = require('@vue/cli-shared-utils')

function store (url, args) {
  process.env.VUE_DEV_SERVER_URL = url
  process.env.VUE_BROWSER_ENGINE = args.browser || 'chromium'
}

module.exports = (api, options) => {
  async function handler (args, rawArgs) {
    const { server, url } = args.url
      ? { url: args.url }
      : await api.service.run('serve')

    store(url, args)
    info('Running Playwright E2E tests...')

    const runner = execa('npx playwright test', ['--timeout',
      30000, ...rawArgs], {
      stdio: 'inherit'
    })

    if (server) {
      runner.on('exit', () => server.stop())
      runner.on('error', () => server.stop())
    }

    if (process.env.VUE_CLI_TEST) {
      runner.on('exit', (code) => {
        process.exit(code)
      })
    }

    return runner
  }

  api.registerCommand(
    'test:e2e',
    {
      description: 'Run e2e tests with Playwright',
      usage: 'vue-cli-service test:e2e',
      options: {
        '--timeout <timeout>':
          'Specify test timeout threshold in milliseconds, zero for unlimited (default: 30000)',
        '--browser <browser>':
          'Browser to use for tests, one of "all", "chromium", "firefox" or "webkit" (default: "chromium")'
      }
    },
    handler
  )
}
