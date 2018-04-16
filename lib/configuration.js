const yaml = require('js-yaml')

class Configuration {
  constructor (settings) {
    if (settings === undefined) {
      this.settings = {}
    } else {
      this.settings = yaml.safeLoad(settings)
      if (this.settings.mergeable === undefined) { throw new Error(Configuration.ERROR_INVALID_YML) }
    }

    this.loadDefaults()
  }

  loadDefaults () {
    if (this.settings.mergeable == null) this.settings.mergeable = {}

    for (let key in Configuration.DEFAULTS) {
      if (this.settings.mergeable[key] === undefined) {
        this.settings.mergeable[key] = Configuration.DEFAULTS[key]
      }
    }
  }

  static instanceWithContext (context) {
    let github = context.github
    let repo = context.repo()

    return github.repos.getContent({
      owner: repo.owner,
      repo: repo.repo,
      path: Configuration.FILE_NAME
    }).then(res => {
      let content = Buffer.from(res.data.content, 'base64').toString()
      return new Configuration(content)
    }).catch(error => {
      if (error.code === 404) return new Configuration()
    })
  }
}

Configuration.FILE_NAME = '.github/mergeable.yml'
Configuration.ERROR_INVALID_YML = 'Invalid mergeable YML file format. Root mergeable node is missing.'
Configuration.DEFAULTS = {
  label: 'wip|do not merge|work in progress|experimental',
  title: 'wip|do not merge|poc',
  approvals: 1
}

module.exports = Configuration