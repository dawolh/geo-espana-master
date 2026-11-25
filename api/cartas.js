// Función de Vercel: consulta tu perfil de Clash Royale a través del proxy de RoyaleAPI.
// La clave NO está aquí: se guarda en Vercel como variable de entorno CR_TOKEN.
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const tag = String(req.query.tag || '').toUpperCase().replace(/^#/, '').replace(/[^0-9A-Z]/g, '');
  if (!tag) return res.status(400).json({ error: 'Falta la etiqueta del jugador' });
  if (!process.env.CR_TOKEN) return res.status(500).json({ error: 'Falta la variable CR_TOKEN en Vercel' });
  try {
    const r = await fetch(`https://proxy.royaleapi.dev/v1/players/%23${tag}`, {
      headers: { Authorization: `Bearer ${process.env.CR_TOKEN}` }
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message || d.reason || 'Error de la API' });
    res.status(200).json({
      name: d.name,
      cards: (d.cards || []).map(c => ({
        name: c.name, level: c.level, maxLevel: c.maxLevel,
        evo: (c.evolutionLevel || 0) > 0,
        // AÑADIDO: URL de la imagen oficial de la carta
        image: c.iconUrls ? c.iconUrls.medium : null
      }))
    });
  } catch (e) {
    res.status(502).json({ error: 'No se pudo contactar con el proxy' });
  }
};
