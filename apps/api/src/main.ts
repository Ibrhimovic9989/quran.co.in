import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Same URL shape as the old Next.js routes: /api/quran/..., /api/search/...
  app.setGlobalPrefix('api');

  // CSP disabled: this service serves JSON + the Swagger UI (which needs
  // inline scripts); browser content is served by the Next.js frontend.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // OpenAPI — UI at /api/docs, spec at /api/docs-json (Flutter codegen source:
  //   openapi-generator generate -i http://localhost:3001/api/docs-json -g dart-dio)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Quran.co.in API')
    .setDescription(
      'REST API serving the quran.co.in web app and mobile clients. ' +
        'Auth: Google OAuth issues an httpOnly cookie (web) or a Bearer JWT via POST /api/auth/google/mobile (mobile). ' +
        'Third-party developers: the Qurʾān read endpoints are public; register an app under /api/developer/keys ' +
        'and pass your key as the X-API-Key header for a higher, identified rate tier.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .addOAuth2(
      {
        type: 'oauth2',
        description: 'Third-party apps: register at developers.quran.co.in, then use the OAuth2 Authorization Code + PKCE flow (hosted by Logto) to act on a user\'s behalf.',
        flows: {
          authorizationCode: {
            authorizationUrl: `${(process.env.LOGTO_ENDPOINT ?? 'https://2jytqm.logto.app').replace(/\/$/, '')}/oidc/auth`,
            tokenUrl: `${(process.env.LOGTO_ENDPOINT ?? 'https://2jytqm.logto.app').replace(/\/$/, '')}/oidc/token`,
            scopes: {
              'bookmarks:read': 'Read your bookmarks',
              'bookmarks:write': 'Add and remove your bookmarks',
              'history:read': 'Read your reading history',
              'history:write': 'Update your reading history',
              'profile:read': 'Read your basic profile',
            },
          },
        },
      },
      'oauth2',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'api/docs-json' });

  // Web frontend origin(s); credentials enabled for the Phase 2 cookie auth.
  const origins = (process.env.WEB_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins, credentials: true });

  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port);
  console.log(`[api] listening on :${port} (origins: ${origins.join(', ')})`);
}

bootstrap();
