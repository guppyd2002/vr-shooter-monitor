import { fetchAllData } from '../lib/github'

// 解析 story markdown 為結構化 acts
function parseStory(md) {
  if (!md) return { worldview: '', principle: '', prologue: '', acts: [] }
  const worldMatch = md.match(/## 世界觀\n([\s\S]*?)(?=\n\*\*設計原則)/)
  const principleMatch = md.match(/\*\*設計原則\*\*：(.+)/)
  const prologueMatch = md.match(/## 序幕[\s\S]*?\n([\s\S]*?)(?=\n---\n)/)
  const actRegex = /## (第.幕) — (.+?)（(.+?)）\n\*場景：(.+?)\*\n\*新機制：(.+?)\*/g
  const acts = []
  let m
  while ((m = actRegex.exec(md)) !== null) {
    acts.push({ num: m[1], name: m[2], subtitle: m[3], scene: m[4], mechanics: m[5] })
  }
  return {
    worldview: worldMatch ? worldMatch[1].trim() : '',
    principle: principleMatch ? principleMatch[1] : '',
    prologue: prologueMatch ? prologueMatch[1].trim() : '',
    acts
  }
}

// 狀態 badge 對應
function statusBadge(status) {
  const map = { 'done': ['完成', 'badge-green'], 'in-progress': ['進行中', 'badge-yellow'], 'planned': ['規劃中', 'badge-yellow'], 'todo': ['待開始', 'badge-red'] }
  const [label, cls] = map[status] || ['未知', 'badge-red']
  return <span className={`badge ${cls}`}>{label}</span>
}

function severityColor(s) {
  return s === 'warning' ? 'var(--yellow)' : s === 'error' ? 'var(--red)' : 'var(--muted)'
}

export default async function Page() {
  const { releases, commits, monitorData, storyMd } = await fetchAllData()
  const data = monitorData || {}
  const project = data.project || {}
  const roadmap = data.roadmap || {}
  const tech = data.tech || []
  const art = data.art || {}
  const qa = data.qa || {}
  const story = parseStory(storyMd)

  // 合併 releases + commits 為版本歷程
  const versions = releases.length > 0
    ? releases.map(r => ({
        tag: r.tag_name,
        date: r.published_at?.slice(0, 10) || '',
        name: r.name || '',
        body: r.body || ''
      }))
    : commits.slice(0, 8).map(c => ({
        tag: c.sha.slice(0, 7),
        date: c.commit.author.date?.slice(0, 10) || '',
        name: '',
        body: c.commit.message
      }))

  const buildTime = new Date().toISOString().slice(0, 16).replace('T', ' ')

  return (
    <div className="container">
      <header>
        <div className="logo">
          <div className="logo-icon">🔫</div>
          <div>
            <h1>{project.name || 'VR Shooter'} Monitor</h1>
            <div className="subtitle">{project.subtitle || ''}</div>
          </div>
        </div>
        <span className="version-badge">{project.version || ''}</span>
      </header>

      <nav className="nav">
        <a href="#versions">版本歷程</a>
        <a href="#roadmap">Roadmap</a>
        <a href="#story">故事設定</a>
        <a href="#art">美術設計</a>
        <a href="#tech">技術架構</a>
        <a href="#qa">QA 狀態</a>
      </nav>

      {/* 版本歷程 */}
      <div className="section" id="versions">
        <div className="section-title">版本歷程</div>
        <div className="data-source">資料來源：GitHub Releases (guppyd2002/vr-shooter)</div>
        <div className="version-list" style={{marginTop: 12}}>
          {versions.map((v, i) => (
            <div key={i} className={`version-item ${i === 0 ? 'latest' : ''}`}>
              <div><div className="version-tag">{v.tag}</div></div>
              <div>
                <div className="version-date">{v.date}{i === 0 ? ' · 最新版本' : ''}</div>
                <div className="version-changes">{v.body || v.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div className="section" id="roadmap">
        <div className="section-title">計劃 / Roadmap</div>
        <div className="data-source">資料來源：docs/monitor-data.json</div>
        {roadmap.gdd && (
          <div className="card" style={{marginTop: 12, marginBottom: 16}}>
            <div className="card-header">
              <div className="card-title">GDD 核心機制</div>
              <span className="badge badge-neon">設計文件</span>
            </div>
            <div className="gdd-list">
              {roadmap.gdd.map((g, i) => (
                <div key={i}><strong style={{color: 'var(--accent)'}}>{g.name}</strong> — {g.desc}</div>
              ))}
            </div>
          </div>
        )}
        <div className="milestone-grid">
          {(roadmap.milestones || []).map((m, i) => (
            <div key={i} className="milestone">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div className="milestone-name">{m.name}</div>
                {statusBadge(m.status)}
              </div>
              <div className="milestone-desc">{m.desc}</div>
              <div className="progress-bar"><div className="progress-fill" style={{width: `${m.progress}%`}}></div></div>
            </div>
          ))}
        </div>
      </div>

      {/* 故事設定 */}
      <div className="section" id="story">
        <div className="section-title">故事設定</div>
        <div className="data-source">資料來源：docs/story/VR_SHOOTER_STORY_SCRIPT.md</div>
        <div className="card" style={{marginTop: 12, marginBottom: 16}}>
          <div className="card-header">
            <div className="card-title">「The Impossible Task」</div>
            <span className="badge badge-neon">CEO 確認</span>
          </div>
          <div style={{fontSize:'12.5px',color:'#b0b2c0',lineHeight:'1.8'}}>
            <strong style={{color:'var(--accent)'}}>世界觀</strong><br/>
            {story.worldview}<br/><br/>
            <strong style={{color:'var(--muted)'}}>設計原則：{story.principle}</strong>
          </div>
        </div>
        {story.acts.length > 0 && (
          <div className="story-acts">
            {story.acts.map((act, i) => (
              <div key={i} className="milestone">
                <div className="milestone-name">{act.num} — {act.name}（{act.subtitle}）</div>
                <div className="milestone-desc">
                  場景：{act.scene}<br/>
                  機制：{act.mechanics}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="card" style={{marginTop: 14}}>
          <div className="card-title" style={{marginBottom: 8}}>劇情資源</div>
          <div style={{fontSize:'12.5px',color:'#b0b2c0',lineHeight:'1.8'}}>
            📄 <a href="https://github.com/guppyd2002/vr-shooter/blob/main/docs/story/VR_SHOOTER_STORY_SCRIPT.md" target="_blank">完整劇情腳本</a><br/>
            📄 <a href="https://github.com/guppyd2002/vr-shooter/blob/main/docs/story/ACT1_STORYBOARD.md" target="_blank">Act 1 分鏡文件</a><br/>
            🎨 <a href="https://github.com/guppyd2002/vr-shooter/tree/main/docs/story/act1_storyboard" target="_blank">Act 1 分鏡圖目錄</a>
          </div>
        </div>
      </div>

      {/* 美術設計 */}
      <div className="section" id="art">
        <div className="section-title">美術設計概念</div>
        <div className="data-source">資料來源：docs/monitor-data.json</div>
        <div className="art-section" style={{marginTop: 12}}>
          <div className="art-card">
            <h3>Low Polygon Style</h3>
            <p>{art.style || ''}</p>
          </div>
          <div className="art-card">
            <h3>Pop Art Neon 色彩</h3>
            <p>{art.colors?.desc || ''}</p>
            {art.colors?.palette && (
              <div className="color-swatches">
                {art.colors.palette.map((c, i) => (
                  <div key={i} className="swatch" style={{background: c}}></div>
                ))}
              </div>
            )}
          </div>
          {(art.scenes || []).map((s, i) => (
            <div key={i} className="art-card">
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 技術架構 */}
      <div className="section" id="tech">
        <div className="section-title">技術架構</div>
        <div className="data-source">資料來源：docs/monitor-data.json</div>
        <div className="tech-grid" style={{marginTop: 12}}>
          {tech.map((t, i) => (
            <div key={i} className="tech-item">
              <div className="tech-label">{t.label}</div>
              <div className="tech-value">{t.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QA 狀態 */}
      <div className="section" id="qa">
        <div className="section-title">QA 狀態</div>
        <div className="data-source">資料來源：docs/monitor-data.json</div>
        <div className="qa-summary" style={{marginTop: 12}}>
          <div className="qa-item"><div className="qa-number" style={{color:'var(--accent)'}}>{qa.latest_apk || '-'}</div><div className="qa-label">最新 APK</div></div>
          <div className="qa-item"><div className="qa-number" style={{color:'var(--green)'}}>{qa.qa_status || '-'}</div><div className="qa-label">QA 狀態</div></div>
          <div className="qa-item"><div className="qa-number" style={{color:'var(--green)'}}>{qa.art_status || '-'}</div><div className="qa-label">美術審查</div></div>
          <div className="qa-item"><div className="qa-number" style={{color:'var(--yellow)'}}>{qa.device_status || '-'}</div><div className="qa-label">Quest 3 實機</div></div>
        </div>
        {qa.issues && (
          <div className="card" style={{marginTop: 14}}>
            <div className="card-title" style={{marginBottom: 10}}>已知問題</div>
            <div className="issue-list">
              {qa.issues.map((issue, i) => (
                <div key={i} className="issue">
                  <div className="issue-dot" style={{background: severityColor(issue.severity)}}></div>
                  {issue.text}
                </div>
              ))}
            </div>
          </div>
        )}
        {qa.process && (
          <div className="card" style={{marginTop: 12}}>
            <div className="card-title" style={{marginBottom: 10}}>QA 流程</div>
            <div style={{fontSize:'12.5px',color:'#b0b2c0',lineHeight:'1.8'}}>
              {qa.process.map((p, i) => <div key={i}>{i+1}. {p}</div>)}
            </div>
          </div>
        )}
      </div>

      <footer>
        <span>VR Shooter Monitor · 罐頭製作所 · Build: {buildTime} UTC</span>
        <span><a href={project.repo || '#'} target="_blank">GitHub ↗</a></span>
      </footer>
    </div>
  )
}
