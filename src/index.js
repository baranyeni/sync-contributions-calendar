require('dotenv').config()
const { GitHelper } = require('./git-helper')
const { getGitlabCalendar } = require('./gitlab-calendar')

main().then(gitHelper => gitHelper.deleteLocalRepoFolder())

async function main () {
  console.log('💫 Starting...')

  const gitlabCalendar = await getGitlabCalendar(process.env.GITLAB_USERNAME)
  const gitlabCommitDays = Object.keys(gitlabCalendar)

  let whereChangesMade = false
  for (const day of gitlabCommitDays) {
    const gitlabCommitsCount = gitlabCalendar[day]

      whereChangesMade = true
      console.log(`💫 Generating ${gitlabCommitsCount} commits for day ${day}`)
      const dayTimestamp = Math.floor(new Date(`${day} 12:00`).getTime() / 1000)

      while (gitlabCommitsCount > 0) {
        await gitHelper.generateCommit({
          username: process.env.GIT_USERNAME,
          email: process.env.GIT_EMAIL,
          timestamp: dayTimestamp
        })
        gitlabCommitsCount--
    }
  }

  if (whereChangesMade) {
    // Push to remote
    console.log('💫 Pushing to remote')
    await gitHelper.push()
  }

  // All done!
  console.log('💫 All done!')

  return gitHelper
}
