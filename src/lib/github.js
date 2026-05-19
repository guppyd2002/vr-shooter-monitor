// 從 GitHub API 取得 vr-shooter repo 資料（build time fetch）
const REPO = 'guppyd2002/vr-shooter'
const API = 'https://api.github.com'

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
}

// 取得檔案內容（base64 decode）
async function fetchFile(path) {
  const res = await fetch(`${API}/repos/${REPO}/contents/${path}`, { headers, cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json()
  return Buffer.from(data.content, 'base64').toString('utf-8')
}

// 取得 GitHub Releases（版本歷程）
async function fetchReleases() {
  const res = await fetch(`${API}/repos/${REPO}/releases?per_page=20`, { headers, cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

// 取得最近 commits（補充版本資訊）
async function fetchCommits(perPage = 10) {
  const res = await fetch(`${API}/repos/${REPO}/commits?per_page=${perPage}`, { headers, cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

// 取得 monitor-data.json（結構化資料：roadmap, tech, qa, art）
async function fetchMonitorData() {
  const content = await fetchFile('docs/monitor-data.json')
  if (!content) return null
  try { return JSON.parse(content) } catch { return null }
}

// 取得故事腳本
async function fetchStory() {
  return fetchFile('docs/story/VR_SHOOTER_STORY_SCRIPT.md')
}

// 主要資料取得函式
export async function fetchAllData() {
  const [releases, commits, monitorData, storyMd] = await Promise.all([
    fetchReleases(),
    fetchCommits(20),
    fetchMonitorData(),
    fetchStory()
  ])
  return { releases, commits, monitorData, storyMd }
}
