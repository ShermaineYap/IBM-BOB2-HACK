import { exec, execFile } from 'node:child_process';
import path from 'node:path';
import { config } from '../config.js';

// Generates a preview image for an uploaded file.
export function makeThumbnail(fileName) {
  return new Promise((resolve, reject) => {
    const src = path.join(config.uploadDir, fileName);
    exec(`convert "${src}" -resize 200x200 "${src}.thumb.png"`, (err) => (err ? reject(err) : resolve()));
  });
}

// Reports disk usage of the upload directory for the admin dashboard.
export function uploadDirUsage() {
  return new Promise((resolve, reject) => {
    execFile('du', ['-sh', config.uploadDir], (err, stdout) => (err ? reject(err) : resolve(stdout.trim())));
  });
}
