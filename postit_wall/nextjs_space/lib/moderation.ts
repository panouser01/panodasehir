// Kapsamlı Küfür, Argo ve Pornografi Filtresi
const BANNED_WORDS = [
  'amk', 'aq', 'siktir', 'orospu', 'piç', 'pic', 'kahpe', 'yavşak', 'yavsak', 'amcık', 'amcik',
  'yarrak', 'yarak', 'sik', 'sikiş', 'sokuk', 'sikerim', 'sokarım', 'ibne', 'göt', 'got',
  'porno', 'porn', 'seks', 'sex', 'pezevenk', 'gavat', 'oç', 'oc', 'fuck', 'shit', 'bitch',
  'whore', 'slut', 'dick', 'pussy', 'çük', 'vajina', 'penis', 'ensest', 'ensest', 'meme', 
  'boşal', 'sakso', 'anal', 'escort', 'eskort', 'fuckbuddy',
  'sikeyim', 'siktiğim', 'siktiğimin', 'siktimin', 'siktigimin', 'soktuğum', 'soktugum', 'amına', 'amina', 
  'aminakoyim', 'amkoyim', 'götten', 'götveren', 'şerefsiz', 'serefsiz', 'pezeveng', 'yarak', 'yarag', 'yarağ', 'yarakk',
  'siki', 'sikik', 'siktirgit', 'siktirgit'
];

export async function moderateContent(content: string): Promise<{ isApproved: boolean; reason?: string }> {
  try {
    if (!content) return { isApproved: true };

    const lowerContent = content.toLocaleLowerCase('tr-TR');
    
    // 1. Yerel filtre (Hızlandırılmış ve kesin çözüm)
    // Kelime bazlı kontrol
    const words = lowerContent.split(/[^a-z0-9çğıöşü]+/i);
    for (const word of words) {
      if (BANNED_WORDS.includes(word)) {
        return { isApproved: false, reason: `Uygunsuz kelime kullanımı tespit edildi.` };
      }
    }

    // Ekstra substring kontrolü (arada boşluk vs varsa veya kelime içindeyse)
    // "sik" kökü çok tehlikelidir (klasik vs) o yüzden net küfürleri alt dize olarak arıyoruz
    const extremelyBadSubstrings = [
      'porno', 'sikiş', 'siktir', 'yarrak', 'sikeyim', 'siktiğ', 'siktig', 'siktim',
      'amcık', 'amcik', 'orospu', 'amkoyim', 'aminakoy', 'götveren', 'pezevenk'
    ];
    for (const sub of extremelyBadSubstrings) {
      if (lowerContent.includes(sub)) {
        return { isApproved: false, reason: 'İçerik sistem politikalarına aykırı ibareler barındırıyor.' };
      }
    }

    // 2. Yapay Zeka ile İkincil Denetim
    // Eğer Abacus AI API Key tanımlıysa çalışır
    if (process.env.ABACUSAI_API_KEY) {
      const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Assuming standard models for external proxy APIs
          messages: [
            {
              role: 'system',
              content: 'You are a content moderator for a Turkish social platform. Analyze the given text and determine if it contains: profanity (küfür), offensive language (argo), pornographic content (pornografi), hate speech, or threats. Respond ONLY in JSON format: {"approved": true/false, "reason": "brief explanation in Turkish if not approved"}. Be strict but fair.'
            },
            {
              role: 'user',
              content: `Analyze this content: "${content}"`
            }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 200,
        }),
      })

      if (!response.ok) {
        console.error('Moderation API error:', response.statusText)
        return { isApproved: true }
      }

      const data = await response.json()
      const result = JSON.parse(data?.choices?.[0]?.message?.content ?? '{"approved": true}')

      return {
        isApproved: result?.approved === true,
        reason: result?.reason
      }
    }

    // API Yoksa ve yerel filtre temizse onay ver.
    return { isApproved: true };

  } catch (error) {
    console.error('Moderation error:', error)
    // Default to approved on error to not block user ops
    return { isApproved: true }
  }
}

