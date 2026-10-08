import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Cinegold API',
      version: '1.0.0',
      description: 'Documentación oficial de la API de Cinegold.',
    },
    servers: [{ url: 'http://localhost:5000' }],
    tags: [{ name: 'Auth' }, { name: 'Catalog' }, { name: 'Checkout' }, { name: 'Admin' }, { name: 'Uploads' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['correo', 'password'],
          properties: {
            correo: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        RegisterClientRequest: {
          type: 'object',
          required: ['nombre', 'correo', 'password'],
          properties: {
            identificacion: { type: 'string', nullable: true },
            nombre: { type: 'string' },
            apellido: { type: 'string', nullable: true },
            nickname: { type: 'string', nullable: true },
            correo: { type: 'string', format: 'email' },
            telefono: { type: 'string', nullable: true },
            password: { type: 'string' },
            idTipoCliente: { type: 'integer', nullable: true },
          },
        },
        CheckoutRequest: {
          type: 'object',
          required: ['idFuncion', 'idAsiento', 'idCine', 'idMetodoPago', 'precioBoleto'],
          properties: {
            idFuncion: { type: 'integer' },
            idAsiento: { type: 'integer' },
            idCliente: { type: 'integer', nullable: true },
            idUsuario: { type: 'integer', nullable: true },
            idCine: { type: 'integer' },
            idMetodoPago: { type: 'integer' },
            precioBoleto: { type: 'number' },
          },
        },
      },
    },
  },
  apis: [],
});
