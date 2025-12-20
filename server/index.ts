import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer as createHttpServer, type Server as HttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import fs from "fs";

const app = express();
const port = parseInt(process.env.PORT || "5000", 10);

// HTTPS on 443 (or any port) when SSL_* env vars are provided.
// For Cloudflare Origin Certificates set:
// SSL_CERT_PATH=/path/to/origin.pem
// SSL_KEY_PATH=/path/to/origin.key
// (optional) SSL_CA_PATH=/path/to/ca.pem
let httpServer: HttpServer;

const certPath = process.env.SSL_CERT_PATH;
const keyPath = process.env.SSL_KEY_PATH;
const caPath = process.env.SSL_CA_PATH;

if (certPath && keyPath) {
  const options: any = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  };
  if (caPath) options.ca = fs.readFileSync(caPath);
  httpServer = createHttpsServer(options, app) as unknown as HttpServer;
} else {
  httpServer = createHttpServer(app);
}


declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  httpServer.listen(port, "0.0.0.0", () => {
  log(`serving on port ${port}`);
});
})();

