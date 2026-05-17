// vercel-website/api/pr/[id].js
// Endpoint: GET /api/pr/[id]
// Fetches PR entry from Supabase and returns rendered HTML page

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

function renderHTML(entry) {
  const DAYS   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'];

  const d      = new Date(entry.tanggal + 'T00:00:00');
  const tglStr = `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

  const aiTypeLabel = { ringkas: '📋 Ringkasan', jawab: '✅ Jawaban', catat: '📒 Catatan' };
  const typeLabel   = aiTypeLabel[entry.ai_type] || '🤖 AI';

  const rosterHtml = (entry.roster || [])
    .map((m, i) => `<div class="roster-item"><span class="num">${i+1}</span>${m}</div>`)
    .join('');

  const prHtml = Object.entries(entry.pr_data || {})
    .filter(([, v]) => v)
    .map(([k, v]) => `
      <div class="pr-item">
        <div class="pr-mapel">📚 ${k}</div>
        <div class="pr-isi">${v}</div>
      </div>`).join('') || '<p class="empty">Tidak ada PR hari ini 🎉</p>';

  // Jawaban: format newline jadi paragraf
  const jawabanHtml = entry.jawaban_ai
    ? entry.jawaban_ai
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          // Deteksi heading angka seperti "1. " atau "Soal 1"
          if (/^(\d+[\.\)]|Soal\s*\d+|No\s*\d+)/i.test(line)) {
            return `<div class="ans-heading">${line}</div>`;
          }
          return `<p>${line}</p>`;
        })
        .join('')
    : '<p class="empty">Jawaban tidak tersedia.</p>';

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="description" content="PR ${entry.kelas} — ${tglStr}"/>
<title>PR ${entry.kelas} — ${tglStr}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
<style>
:root{
  --bg:#060810;--bg2:#0d1017;--bg3:#131825;--bg4:#1b2133;
  --b1:rgba(255,255,255,.07);--b2:rgba(255,255,255,.13);
  --text:#dde3f0;--dim:#8b96b0;--mute:#3d4a63;
  --cyan:#22d3ee;--ca:rgba(34,211,238,.1);--cb:rgba(34,211,238,.2);
  --green:#4ade80;--ga:rgba(74,222,128,.1);
  --font:'DM Sans',sans-serif;--mono:'JetBrains Mono',monospace;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{background:var(--bg);min-height:100%}
body{font-family:var(--font);color:var(--text);-webkit-font-smoothing:antialiased;
  padding:24px 16px 60px;max-width:720px;margin:0 auto;}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:4px}

/* Header */
.header{text-align:center;padding:32px 0 24px}
.header-badge{
  display:inline-flex;align-items:center;gap:7px;
  background:var(--ca);border:1px solid var(--cb);
  border-radius:20px;padding:5px 14px;
  font-size:.75rem;color:var(--cyan);font-weight:600;
  margin-bottom:16px;letter-spacing:.03em;
}
.header h1{font-size:1.55rem;font-weight:700;color:#fff;margin-bottom:6px}
.header-meta{font-size:.85rem;color:var(--dim)}
.header-meta span{color:var(--text)}

/* Cards */
.card{
  background:var(--bg2);border:1px solid var(--b1);
  border-radius:14px;padding:20px;margin-bottom:14px;
}
.card-title{
  font-size:.72rem;font-weight:700;color:var(--dim);
  letter-spacing:.06em;text-transform:uppercase;
  margin-bottom:14px;display:flex;align-items:center;gap:7px;
}
.card-title::after{content:'';flex:1;height:1px;background:var(--b1)}

/* Roster */
.roster-item{
  display:flex;align-items:center;gap:10px;
  padding:8px 12px;background:var(--bg3);border-radius:8px;
  margin-bottom:7px;font-size:.88rem;
}
.roster-item:last-child{margin-bottom:0}
.num{
  width:24px;height:24px;border-radius:6px;
  background:var(--ca);color:var(--cyan);
  display:flex;align-items:center;justify-content:center;
  font-size:.72rem;font-weight:700;flex-shrink:0;
}

/* PR */
.pr-item{
  padding:12px 14px;background:var(--bg3);border-radius:8px;
  margin-bottom:8px;border-left:3px solid var(--cyan);
}
.pr-item:last-child{margin-bottom:0}
.pr-mapel{font-size:.75rem;font-weight:700;color:var(--cyan);
  text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}
.pr-isi{font-size:.9rem;color:var(--text);line-height:1.5}

/* Jawaban */
.ans-card{background:var(--bg2);border:1px solid var(--b1);
  border-radius:14px;padding:20px;margin-bottom:14px}
.ans-card p{font-size:.88rem;line-height:1.75;color:var(--text);
  margin-bottom:6px;padding-left:4px}
.ans-heading{
  font-size:.88rem;font-weight:700;color:var(--cyan);
  margin:16px 0 6px;padding:6px 12px;
  background:var(--ca);border-radius:6px;
  border-left:3px solid var(--cyan);
}
.ans-heading:first-child{margin-top:0}

.empty{color:var(--mute);font-style:italic;font-size:.88rem;padding:8px 0}

/* Footer */
.footer{text-align:center;margin-top:40px;padding-top:20px;
  border-top:1px solid var(--b1)}
.footer-logo{font-size:.75rem;color:var(--mute);margin-bottom:4px}
.footer-copy{font-size:.72rem;color:var(--mute)}
.footer-copy span{color:var(--cyan)}

/* Type badge */
.type-badge{
  display:inline-flex;align-items:center;gap:5px;
  font-size:.75rem;font-weight:600;padding:3px 10px;
  border-radius:20px;background:var(--ga);color:var(--green);
  border:1px solid rgba(74,222,128,.2);
}

@media(max-width:480px){
  .header h1{font-size:1.3rem}
  body{padding:16px 12px 50px}
}
</style>
</head>
<body>

<div class="header">
  <div class="header-badge">🤖 Simpatel Bot</div>
  <h1>PR ${escHtml(entry.kelas)}</h1>
  <div class="header-meta">
    📅 <span>${tglStr}</span> &nbsp;·&nbsp;
    👤 <span>${escHtml(entry.owner)}</span> &nbsp;·&nbsp;
    <span class="type-badge">${typeLabel}</span>
  </div>
</div>

<div class="card">
  <div class="card-title">📚 Roster Hari Ini</div>
  ${rosterHtml || '<p class="empty">Tidak ada roster.</p>'}
</div>

<div class="card">
  <div class="card-title">📝 PR / Tugas</div>
  ${prHtml}
</div>

<div class="ans-card">
  <div class="card-title">🤖 ${typeLabel} — Lengkap</div>
  ${jawabanHtml}
</div>

<div class="footer">
  <div class="footer-logo">🤖 Simpatel Bot</div>
  <div class="footer-copy">
    <span>© Simpatel Studios</span> — Jepri Parmonangan Tindaon
  </div>
</div>

</body>
</html>`;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = async (req, res) => {
  const { id } = req.query;

  if (!id || isNaN(id)) {
    return res.status(400).send('<h1>ID tidak valid</h1>');
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).send('<h1>Konfigurasi server belum diset</h1>');
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/pr_entries?id=eq.${id}&select=*`,
      {
        headers: {
          'apikey'       : SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const data = await response.json();
    if (!data || !data.length) {
      return res.status(404).send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>Tidak Ditemukan</title>
<style>body{font-family:sans-serif;background:#060810;color:#dde3f0;
display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}
h1{font-size:2rem;margin-bottom:8px}p{color:#8b96b0}</style></head>
<body><div><h1>404</h1><p>PR tidak ditemukan.</p></div></body></html>`);
    }

    const html = renderHTML(data[0]);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(html);

  } catch(e) {
    return res.status(500).send(`<h1>Server Error</h1><p>${escHtml(e.message)}</p>`);
  }
};
