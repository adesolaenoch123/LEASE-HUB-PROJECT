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
    ".webp": "image/webp",
    ".mp4": "video/mp4"
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

    const fileSize = fs.statSync(filePath).size;
    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    const range = request.headers.range;
    if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match) {
            response.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
            response.end();
            return;
        }
        const start = match[1] ? Number(match[1]) : Math.max(0, fileSize - Number(match[2]));
        const end = match[1] ? Math.min(Number(match[2]) || fileSize - 1, fileSize - 1) : fileSize - 1;
        if (!Number.isSafeInteger(start) || start < 0 || start >= fileSize || start > end) {
            response.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
            response.end();
            return;
        }
        response.writeHead(206, {
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Content-Type": contentType
        });
        fs.createReadStream(filePath, { start, end }).pipe(response);
        return;
    }
    response.writeHead(200, {
        "Accept-Ranges": "bytes",
        "Content-Length": fileSize,
        "Content-Type": contentType
    });
    fs.createReadStream(filePath).pipe(response);
}).listen(4173, "127.0.0.1");
