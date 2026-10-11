export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { uid } = req.query;

  // Validate UID format: 6-12 digits
  if (!uid || !/^\d{6,12}$/.test(uid)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid UID format. Must be 6-12 digits.' 
    });
  }

  try {
    const apiResponse = await fetch(`https://s.xysushi.in/ff/?uid=${uid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!apiResponse.ok) {
      return res.status(502).json({ 
        success: false, 
        message: 'Upstream API error' 
      });
    }

    const data = await apiResponse.json();

    // Check for basicinfo in various possible structures
    const info = data.basicinfo || data.basicInfo || (data.data && data.data.basicInfo);

    if (!info || !info.nickname) {
      return res.status(404).json({ 
        success: false, 
        message: 'UID not found. Please check and try again.' 
      });
    }

    return res.status(200).json({
      success: true,
      player: {
        nickname: info.nickname || '—',
        uid: info.accountId || uid,
        level: info.level || '—',
        region: info.region || '—',
        likes: info.liked || 0,
        clan: (data.clanbasicinfo && data.clanbasicinfo.clanname) || '—'
      }
    });

  } catch (error) {
    console.error('Verify API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
}
