import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import rimraf from 'rimraf';
import mime from 'mime-types';

import IAdapter from '../IAdapter';

interface LocalConfig {
    permission: number;
}

class LocalAdapter implements IAdapter {

    constructor(private location: string) {

    }

    fileExists(path: string) {
        return new Promise<boolean>((resolve) => {
            fs.exists(this.getPath(path), (res) => resolve(res));
        });
    }

    write(path: string, content: string, config: Object = {}) {
        return fs.promises.writeFile(this.getPath(path), content);
    }

    writeStream(path: string, content: Readable, config: Object = {}) {
        return new Promise<void>((resolve, reject) => {
            const writable = fs.createWriteStream(this.getPath(path));
            content.pipe(writable);

            writable.on('error', (err) => reject(err));
            content.on('end', () => resolve());
        });
    }

    isDirectory(path: string) {
        return fs.promises.stat(this.getPath(path)).then((s) => s.isDirectory());
    }
    
    read(path: string, config = {}) {
        return fs.promises.readFile(this.getPath(path), config).then((data) => data.toString());
    }

    readStream(path: string) {
        return new Promise<Readable>((resolve) => {
            resolve(fs.createReadStream(this.getPath(path)));
        });
    }
 
    delete(path: string) {
        return fs.promises.unlink(this.getPath(path));
    }

    
    deleteDirectory(path: string) {
        return new Promise<void>((resolve, reject) => {
            rimraf(this.getPath(path), (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    createDirectory(path: string, config: {}) {
        return fs.promises.mkdir(this.getPath(path), config);
    }

    
    mimeType(path: string) {
        return new Promise<string>((resolve) => {
            resolve(mime.lookup(this.getPath(path)) || 'application/octet-stream');
        });
    }

    
    lastModified(path: string) {
        return fs.promises.stat(this.getPath(path)).then((s) => s.mtime);
    }

    fileSize(path: string) {
        return fs.promises.stat(this.getPath(path)).then((s) => s.size);
    }
    
    listContents(location: string, deep: boolean, showDirectories: boolean): AsyncIterable<string> {

        const format = (str: string) => str.replace('\\', '/').replace(path.sep, '/');
        async function* recursive(dir: string, prev: string = location) {
            const listdir = await fs.promises.readdir(dir, { withFileTypes: true });
            for (const item of listdir) {
                const fsPath = format(path.join(prev, item.name));
                const res = path.resolve(dir, item.name);
                if (item.isDirectory()) {
                    yield* recursive(res, fsPath);
                    if (showDirectories) yield fsPath;
                }
                else yield fsPath;
            }
        }

        async function* notRecursive(dir: string) {
            const listdir = await fs.promises.readdir(dir, { withFileTypes: true });
            for (const item of listdir) {
                if (item.isDirectory() && showDirectories) yield format(path.join(location, item.name));
                else if (!item.isDirectory()) yield format(path.join(location, item.name));
            };
        }

        return deep ? recursive(this.getPath(location)) : notRecursive(this.getPath(location));
    }

    
    move(source: string, destination: string, config: Object = {}) {
        return fs.promises.rename(this.getPath(source), this.getPath(destination));
    }

    async copy(source: string, destination: string, config: Object = {}) {
        await this.writeStream(destination, await this.readStream(source));
    }

    private getPath(pathDef: string): string {
        return path.join(this.location, pathDef);
    }
}

export default LocalAdapter;