import { queryDatabase } from '../db/request.js';
import { mapDatabaseError } from '../utils/dbErrors.js';
import { sendSmtpMail } from './mailerService.js';

export const contactService = {
  async create(payload) {
    try {
      const result = await queryDatabase(
        `
          INSERT INTO Contacto (NombreRemitente, CorreoRemitente, CorreoDestino, Mensaje)
          OUTPUT INSERTED.IdContacto AS idContacto
          VALUES (@NombreRemitente, @CorreoRemitente, @CorreoDestino, @Mensaje)
        `,
        {
          NombreRemitente: { type: 'varchar', length: 255, value: payload.nombreRemitente },
          CorreoRemitente: { type: 'varchar', length: 100, value: payload.correoRemitente },
          CorreoDestino: { type: 'varchar', length: 100, value: 'cinegoldnic@gmail.com' },
          Mensaje: { type: 'varchar', value: payload.mensaje },
        },
      );

      let correoEnviado = false;
      try {
        const mailResult = await sendSmtpMail({
          to: 'cinegoldnic@gmail.com',
          subject: `Nuevo mensaje de contacto: ${payload.nombreRemitente}`,
          text: `Nombre: ${payload.nombreRemitente}\nCorreo: ${payload.correoRemitente}\n\n${payload.mensaje}`,
          html: `
            <h2>Nuevo mensaje de contacto</h2>
            <p><strong>Nombre:</strong> ${payload.nombreRemitente}</p>
            <p><strong>Correo:</strong> ${payload.correoRemitente}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${String(payload.mensaje).replace(/\n/g, '<br />')}</p>
          `,
        });
        correoEnviado = !mailResult.skipped;
      } catch {
        correoEnviado = false;
      }

      return {
        idContacto: result.recordset?.[0]?.idContacto || null,
        estado: 'Pendiente',
        correoEnviado,
      };
    } catch (error) {
      throw mapDatabaseError(error);
    }
  },
};
