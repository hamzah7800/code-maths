export default async function handler(req, res) {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  try {
    const response = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`);
    const text = await response.text();

    // Try to extract first valid URL
    const match = text.match(/https?:\/\/[^\s"]+/);
    const url = match ? match[0] : `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;

    res.status(200).json({ result: url });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch search results." });
  }
}
