module.exports = api => {
  api.describeTask({
    match: /vue-cli-service test:e2e/,
    description: 'org.vue.playwright.tasks.test.description',
    prompts: [
      {
        name: 'url',
        type: 'input',
        default: '',
        description: 'org.vue.playwright.tasks.test.url'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.url) args.push('--url=' + answers.url)
    }
  })
}
