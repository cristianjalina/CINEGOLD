import crypto from 'crypto';
import { poolPromise } from '../db/pool.js';
import sql from 'mssql';
import { ApiError } from '../utils/ApiError.js';
import { mapDatabaseError } from '../utils/dbErrors.js';
import { sendSmtpMail } from './mailerService.js';

const IVA_RATE = 0.15;
const DEFAULT_TICKET_PRICES = {
  VIP: 240,
  IMAX: 260,
  '4DX': 280,
  REGULAR: 180,
};

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function normalizeSeatIds(payload) {
  const seatIds = new Set((payload.asientos || []).map((seat) => Number(seat.idAsiento)));
  if (payload.idAsiento) {
    seatIds.add(Number(payload.idAsiento));
  }
  return Array.from(seatIds);
}

function maskCard(number) {
  const clean = String(number || '').replace(/\D/g, '');
  return `**** **** **** ${clean.slice(-4)}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getTicketPrice(tipoSala = '') {
  return DEFAULT_TICKET_PRICES[String(tipoSala).toUpperCase()] || DEFAULT_TICKET_PRICES.REGULAR;
}

async function getFunctionContext(transaction, payload) {
  if (payload.idFuncion) {
    const request = new sql.Request(transaction);
    request.input('IdFuncion', sql.Int, payload.idFuncion);
    const result = await request.query(`
      SELECT TOP 1
        f.IdFuncion,
        s.IdCine,
        s.TipoSala
      FROM Funciones f
      INNER JOIN Salas s ON s.IdSala = f.IdSala
      WHERE f.IdFuncion = @IdFuncion
    `);

    const record = result.recordset?.[0];
    if (!record) {
      throw new ApiError(404, 'La funcion seleccionada no existe.');
    }

    return {
      idFuncion: record.IdFuncion,
      precioBoleto: roundMoney(payload.precioBoleto || getTicketPrice(record.TipoSala)),
      idCine: payload.idCine || record.IdCine,
    };
  }

  const request = new sql.Request(transaction);
  if (payload.idCine) {
    request.input('IdCine', sql.Int, payload.idCine);
  }

  const result = await request.query(`
    SELECT TOP 1 IdCine
    FROM Cines
    WHERE Estado = 1 ${payload.idCine ? 'AND IdCine = @IdCine' : ''}
    ORDER BY IdCine ASC
  `);
  const record = result.recordset?.[0];
  if (!record) {
    throw new ApiError(400, 'No hay cine activo para procesar la compra.');
  }

  return {
    idFuncion: null,
    precioBoleto: 0,
    idCine: record.IdCine,
  };
}

async function getDefaultCineId(transaction, requestedIdCine = null) {
  const request = new sql.Request(transaction);
  if (requestedIdCine) {
    request.input('IdCine', sql.Int, requestedIdCine);
  }

  const result = await request.query(`
    SELECT TOP 1 IdCine
    FROM Cines
    WHERE Estado = 1 ${requestedIdCine ? 'AND IdCine = @IdCine' : ''}
    ORDER BY IdCine ASC
  `);

  return result.recordset?.[0]?.IdCine || null;
}

async function loadCandyLine(transaction, item, index) {
  if (!item?.idReferencia || !item?.tipo || !item?.cantidad) {
    throw new ApiError(400, 'Datos de dulceria invalidos.');
  }
  const request = new sql.Request(transaction);
  request.input(`IdReferencia${index}`, sql.Int, item.idReferencia);

  const result =
    item.tipo === 'producto'
      ? await request.query(`
          SELECT
            IdProducto AS idReferencia,
            NombreProducto AS nombre,
            PrecioActual AS precio
          FROM Producto
          WHERE IdProducto = @IdReferencia${index}
        `)
      : await request.query(`
          SELECT
            IdCombo AS idReferencia,
            NombreCombo AS nombre,
            PrecioFijo AS precio
          FROM Combo
          WHERE IdCombo = @IdReferencia${index} AND Estado = 1
        `);

  const record = result.recordset?.[0];
  if (!record) {
    throw new ApiError(404, `No se encontro el item de dulceria ${item.tipo}:${item.idReferencia}.`);
  }

  const quantity = Number(item.cantidad);
  const unitPrice = roundMoney(record.precio);

  return {
    ...item,
    nombre: record.nombre,
    precioUnitario: unitPrice,
    subtotalLinea: roundMoney(unitPrice * quantity),
  };
}

export const checkoutService = {
  async processTicketPurchase(payload) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

      const seatIds = normalizeSeatIds(payload);
      const hasTickets = seatIds.length > 0 || Boolean(payload.idFuncion);
      const context = hasTickets
        ? await getFunctionContext(transaction, payload)
        : { idFuncion: null, precioBoleto: 0, idCine: await getDefaultCineId(transaction, payload.idCine) };

      if (hasTickets) {
        for (const [index, idAsiento] of seatIds.entries()) {
          const request = new sql.Request(transaction);
          request.input(`IdFuncion${index}`, sql.Int, context.idFuncion);
          request.input(`IdAsiento${index}`, sql.Int, idAsiento);
          const result = await request.query(`
            SELECT 1 AS ocupado
            FROM Boletos
            WHERE IdFuncion = @IdFuncion${index} AND IdAsiento = @IdAsiento${index}
          `);

          if (result.recordset?.length) {
            throw new ApiError(409, 'Uno de los asientos seleccionados ya fue reservado.');
          }
        }
      }

      const candyLines = [];
      for (const [index, item] of (payload.dulceria || []).entries()) {
        candyLines.push(await loadCandyLine(transaction, item, index));
      }

      const subtotalBoletos = roundMoney(seatIds.length * context.precioBoleto);
      const subtotalDulceria = roundMoney(candyLines.reduce((sum, item) => sum + item.subtotalLinea, 0));
      const subtotal = roundMoney(subtotalBoletos + subtotalDulceria);
      const impuestos = roundMoney(subtotal * IVA_RATE);
      const total = roundMoney(subtotal + impuestos);
      const codigoReservaWeb = `CG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

      const invoiceRequest = new sql.Request(transaction);
      invoiceRequest.input('CodigoReservaWeb', sql.VarChar(100), codigoReservaWeb);
      invoiceRequest.input('IdCliente', sql.Int, payload.idCliente || null);
      invoiceRequest.input('IdUsuario', sql.Int, payload.idUsuario || null);
      invoiceRequest.input('IdCine', sql.Int, context.idCine || (await getDefaultCineId(transaction, payload.idCine)));
      invoiceRequest.input('IdMetodoPago', sql.Int, payload.idMetodoPago || 1);
      invoiceRequest.input('Subtotal', sql.Decimal(12, 2), subtotal);
      invoiceRequest.input('Impuestos', sql.Decimal(12, 2), impuestos);
      invoiceRequest.input('Total', sql.Decimal(12, 2), total);
      const invoice = await invoiceRequest.query(`
        INSERT INTO Factura
          (CodigoReservaWeb, IdCliente, IdUsuario, IdCine, IdMetodoPago, Subtotal, Impuestos, Total, Estado)
        OUTPUT INSERTED.IdFactura, INSERTED.CodigoReservaWeb, INSERTED.CodigoFacturaElectronica
        VALUES
          (@CodigoReservaWeb, @IdCliente, @IdUsuario, @IdCine, @IdMetodoPago, @Subtotal, @Impuestos, @Total, 'Emitida')
      `);

      const idFactura = invoice.recordset[0].IdFactura;

      if (hasTickets) {
        for (const [index, idAsiento] of seatIds.entries()) {
          const request = new sql.Request(transaction);
          request.input(`IdFuncion${index}`, sql.Int, context.idFuncion);
          request.input(`IdAsiento${index}`, sql.Int, idAsiento);
          request.input(`IdFactura${index}`, sql.Int, idFactura);
          request.input(`PrecioUnitario${index}`, sql.Decimal(10, 2), context.precioBoleto);
          await request.query(`
            INSERT INTO Boletos (IdFuncion, IdAsiento, IdFactura, PrecioUnitario)
            VALUES (@IdFuncion${index}, @IdAsiento${index}, @IdFactura${index}, @PrecioUnitario${index})
          `);
        }
      }

      for (const [index, item] of candyLines.entries()) {
        const request = new sql.Request(transaction);
        request.input(`IdFactura${index}`, sql.Int, idFactura);
        request.input(`IdProducto${index}`, sql.Int, item.tipo === 'producto' ? item.idReferencia : null);
        request.input(`IdCombo${index}`, sql.Int, item.tipo === 'combo' ? item.idReferencia : null);
        request.input(`Cantidad${index}`, sql.Int, item.cantidad);
        request.input(`PrecioUnitario${index}`, sql.Decimal(10, 2), item.precioUnitario);
        request.input(`SubtotalLinea${index}`, sql.Decimal(12, 2), item.subtotalLinea);
        await request.query(`
          INSERT INTO DetalleFactura
            (IdFactura, IdProducto, IdCombo, Cantidad, PrecioUnitario, SubtotalLinea)
          VALUES
            (@IdFactura${index}, @IdProducto${index}, @IdCombo${index}, @Cantidad${index}, @PrecioUnitario${index}, @SubtotalLinea${index})
        `);
      }

      if (payload.idCliente) {
        const request = new sql.Request(transaction);
        request.input('IdCliente', sql.Int, payload.idCliente);
        request.input('Puntos', sql.Int, Math.max(10, Math.round(total)));
        await request.query(`
          UPDATE Cliente
          SET PuntosAcumulados = PuntosAcumulados + @Puntos
          WHERE IdCliente = @IdCliente
        `);
      }

      if (payload.pago?.numeroTarjeta) {
        const request = new sql.Request(transaction);
        request.input('IdFactura', sql.Int, idFactura);
        request.input('TitularTarjeta', sql.VarChar(255), payload.pago.titularTarjeta);
        request.input('NumeroEnmascarado', sql.VarChar(19), maskCard(payload.pago.numeroTarjeta));
        request.input('FechaVencimiento', sql.VarChar(5), payload.pago.fechaVencimiento);
        await request.query(`
          INSERT INTO PagoWeb_Tarjeta (IdFactura, TitularTarjeta, NumeroEnmascarado, FechaVencimiento)
          VALUES (@IdFactura, @TitularTarjeta, @NumeroEnmascarado, @FechaVencimiento)
        `);
      }

      await transaction.commit();

      let correoEnviado = false;
      if (payload.correo) {
        try {
          const mailResult = await sendSmtpMail({
            to: payload.correo,
            subject: `Confirmacion Cinegold ${codigoReservaWeb}`,
            text: `Tu compra fue procesada. Reserva: ${codigoReservaWeb}. Total: C$ ${total.toFixed(2)}.`,
            html: `
              <div style="font-family:Arial,sans-serif;background:#050505;color:#ffffff;padding:24px">
                <h1 style="color:#d4af37;margin:0 0 16px">Cinegold</h1>
                <p>Tu compra fue procesada correctamente.</p>
                <p><strong>Reserva:</strong> ${escapeHtml(codigoReservaWeb)}</p>
                <p><strong>Factura:</strong> #${escapeHtml(idFactura)}</p>
                <p><strong>Total:</strong> C$ ${escapeHtml(total.toFixed(2))}</p>
                <p>Presenta este codigo en el cine para validar tu compra.</p>
              </div>
            `,
          });
          correoEnviado = !mailResult.skipped;
        } catch {
          correoEnviado = false;
        }
      }

      return {
        processed: true,
        idFactura,
        codigoReservaWeb,
        subtotal,
        impuestos,
        total,
        correoEnviado,
      };
    } catch (error) {
      if (transaction._aborted !== true) {
        try {
          await transaction.rollback();
        } catch {
          // The original error is more useful for the API response.
        }
      }

      throw error instanceof ApiError ? error : mapDatabaseError(error);
    }
  },
};
