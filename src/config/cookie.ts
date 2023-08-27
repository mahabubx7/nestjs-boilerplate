import { envVars } from './constants';

export const cookieOptions = { httpOnly: true, expires: envVars?.expires?.cookie };
