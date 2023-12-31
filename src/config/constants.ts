interface EnvVars {
  appPort?: number;
  jwtSecret?: string;
  jwtExpires?: string;
  secret?: {
    jwt?: string;
    app?: string;
  };
  expires?: {
    cookie?: Date;
    jwt?: string;
  };
  mail?: {
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  };
}

export const envVars: EnvVars = {
  appPort: Number(+process.env.APP_PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpires: process.env.JWT_EXPIRES || '1d',
  secret: {
    jwt: process.env.JWT_SECRET || 'secret',
    app: process.env.APP_SECRET || 'secret',
  },
  expires: {
    cookie: new Date(Date.now() + 1000 * 3600 * 24), // default: 24h or 1d
    jwt: process.env.JWT_EXPIRES || '15s',
  },
  mail: {
    secure: Boolean(process.env.MAIL_AUTH_HTTPS) || false,
    auth: {
      user: process.env.MAIL_AUTH_USER || 'mx7.app.test@gmail.com',
      pass: process.env.MAIL_AUTH_PASS || 'avdr pngu wszz tnoc',
    },
  },
};
