export async function moderateContent(content: string): Promise<{ isApproved: boolean; reason?: string }> {
  try {
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
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
      // Default to approved on API failure
      return { isApproved: true }
    }

    const data = await response.json()
    const result = JSON.parse(data?.choices?.[0]?.message?.content ?? '{"approved": true}')

    return {
      isApproved: result?.approved === true,
      reason: result?.reason
    }
  } catch (error) {
    console.error('Moderation error:', error)
    // Default to approved on error
    return { isApproved: true }
  }
}
