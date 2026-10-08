import { queryDatabase } from '../src/db/request.js';

const result = await queryDatabase(`
  SELECT TOP 50
    IdPelicula,
    Titulo,
    TrailerYouTubeId
  FROM Peliculas
  WHERE NULLIF(LTRIM(RTRIM(TrailerYouTubeId)), '') IS NOT NULL
  ORDER BY IdPelicula DESC
`);

console.table(result.recordset || []);
