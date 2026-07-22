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
        'Auth: Google OAuth issues an httpOnly cookie (web) or a Bearer JWT via POST /api/auth/google/mobile (mobile).',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
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
