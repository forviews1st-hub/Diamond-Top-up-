export default async function handler(req, res) {
    // CORS headers taaki frontend se call karne mein dikkat na aaye
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { uid } = req.query;

    // 1. Format check (6-12 digits)
    if (!uid || !/^\d{6,12}$/.test(uid)) {
        return res.status(400).json({ success: false, message: 'UID must be 6-12 digits' });
    }

    try {
        // 2. API call (Unofficial Free Fire API)
        const response = await fetch(`https://s.xysushi.in/ff/?uid=${encodeURIComponent(uid)}`);
        const data = await response.json();

        // 3. Check if valid player data exists
        if (data.basicInfo && data.basicInfo.nickname) {
            return res.status(200).json({
                success: true,
                player: {
                    nickname: data.basicInfo.nickname,
                    uid: data.basicInfo.accountId || uid,
                    level: data.basicInfo.level || 'N/A',
                    region: data.basicInfo.region || 'N/A',
                    likes: data.basicInfo.liked || 0,
                    clan: data.clanBasicInfo?.clanName || 'N/A'
                }
            });
        } else {
            return res.status(404).json({ success: false, message: 'UID not found. Please check and try again.' });
        }
    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
}
