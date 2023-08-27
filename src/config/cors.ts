export const corsOptions = {
  credentials: true,
  origin: ['http://localhost:3000', '*'], // '*' is for wildcard support
  methods: 'GET, HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
};
