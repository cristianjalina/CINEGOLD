import { queryDatabase } from '../src/db/request.js';
import { checkoutService } from '../src/services/checkoutService.js';

try {
  const context = await queryDatabase(`
    SELECT TOP 1
      f.IdFuncion AS idFuncion,
      a.IdAsiento AS idAsiento,
      c.IdCine AS idCine,
      mp.IdMetodoPago AS idMetodoPago,
      cl.IdCliente AS idCliente,
      p.IdProducto AS idProducto,
      cb.IdCombo AS idCombo
    FROM dbo.Funciones f
    INNER JOIN dbo.Salas s ON s.IdSala = f.IdSala
    INNER JOIN dbo.Cines c ON c.IdCine = s.IdCine
    INNER JOIN dbo.Asientos a ON a.IdSala = s.IdSala
    CROSS APPLY (SELECT TOP 1 IdMetodoPago FROM dbo.MetodoPago ORDER BY IdMetodoPago) mp
    OUTER APPLY (SELECT TOP 1 IdCliente FROM dbo.Cliente WHERE Correo = 'cliente.demo@cinegold.local') cl
    OUTER APPLY (SELECT TOP 1 IdProducto FROM dbo.Producto ORDER BY IdProducto) p
    OUTER APPLY (SELECT TOP 1 IdCombo FROM dbo.Combo WHERE Estado = 1 ORDER BY IdCombo) cb
    WHERE f.Fecha >= CAST(GETDATE() AS DATE)
      AND NOT EXISTS (
        SELECT 1 FROM dbo.Boletos b
        WHERE b.IdFuncion = f.IdFuncion AND b.IdAsiento = a.IdAsiento
      )
    ORDER BY f.Fecha, f.Hora, a.Fila, a.Numero
  `);

  const row = context.recordset?.[0];
  if (!row) {
    throw new Error('No hay funcion/asiento libre para validar compra.');
  }

  const result = await checkoutService.processTicketPurchase({
    idFuncion: row.idFuncion,
    asientos: [{ idAsiento: row.idAsiento }],
    dulceria: [
      ...(row.idProducto ? [{ tipo: 'producto', idReferencia: row.idProducto, cantidad: 1 }] : []),
      ...(row.idCombo ? [{ tipo: 'combo', idReferencia: row.idCombo, cantidad: 1 }] : []),
    ],
    idCliente: row.idCliente || null,
    idCine: row.idCine,
    idMetodoPago: row.idMetodoPago,
    precioBoleto: 180,
    correo: 'cliente.demo@cinegold.local',
    pago: {
      titularTarjeta: 'CLIENTE DEMO',
      numeroTarjeta: '4242424242424242',
      fechaVencimiento: '12/30',
    },
  });

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
