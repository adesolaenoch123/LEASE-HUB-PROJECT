const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
};

http.createServer((request, response) => {
    const requestedPath = decodeURIComponent(request.url.split("?")[0]);
    const relativePath = requestedPath === "/" ? "/index.html" : requestedPath;
    const filePath = path.resolve(root, `.${relativePath}`);

    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        response.writeHead(404);
        response.end("Not found");
        return;
    }

    response.writeHead(200, {
        "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    fs.createReadStream(filePath).pipe(response);
}).listen(4173, "127.0.0.1");
