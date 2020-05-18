import { Readable } from 'stream';

import IFileSystemWriter from './IFileSystemWriter';
import IFileSystemReader from './IFileSystemReader';
import IAdapter from './IAdapter';
import IPathNormalizer from './IPathNormalizer';
import Config from './Config';
import { ProvidedConfig } from './Types';
import WhitespaceNormalizer from './PathNormalizer/WhitespaceNormalizer';

class FileSystem implements IFileSystemWriter, IFileSystemReader {

    private config: Config;

    private pathNormalizer: IPathNormalizer;

    constructor(private adapter: IAdapter, pathNormalizer: IPathNormalizer | null = null, config: ProvidedConfig = {}) {
        this.pathNormalizer = pathNormalizer || new WhitespaceNormalizer();
        this.config = new Config(config);
    }

    fileExists(location: string) {
        return this.adapter.fileExists(this.pathNormalizer.normalizePath(location));
    }

    write(location: string, content: string, config: ProvidedConfig = {}) {
        return this.adapter.write(this.pathNormalizer.normalizePath(location), content, this.config.extend(config));
    }

    writeStream(location: string, content: Readable, config: ProvidedConfig = {}) {
        return this.adapter.writeStream(this.pathNormalizer.normalizePath(location), content, this.config.extend(config));
    }

    read(location: string) {
        return this.adapter.read(this.pathNormalizer.normalizePath(location));
    }

    readStream(location: string) {
        return this.adapter.readStream(this.pathNormalizer.normalizePath(location));
    }

    isDirectory(path: string) {
        return this.adapter.isDirectory(this.pathNormalizer.normalizePath(path));
    }

    delete(location: string) {
        return this.adapter.delete(this.pathNormalizer.normalizePath(location));
    }

    deleteDirectory(location: string) {
        return this.adapter.deleteDirectory(this.pathNormalizer.normalizePath(location));
    }

    createDirectory(location: string, config: ProvidedConfig = {}) {
        return this.adapter.createDirectory(this.pathNormalizer.normalizePath(location), this.config.extend(config));
    }

    listContents(location: string, deep: boolean = false, showDirectories: boolean = true) {
        return this.adapter.listContents(this.pathNormalizer.normalizePath(location), deep, showDirectories);
    }

    move(source: string, destination: string, config: ProvidedConfig = {}) {
        return this.adapter.move(this.pathNormalizer.normalizePath(source), this.pathNormalizer.normalizePath(destination), this.config.extend(config));
    }

    copy(source: string, destination: string, config: ProvidedConfig = {}) {
        return this.adapter.copy(this.pathNormalizer.normalizePath(source), this.pathNormalizer.normalizePath(destination), this.config.extend(config));
    }

    async lastModified(path: string) {
        return (await this.adapter.lastModified(this.pathNormalizer.normalizePath(path)));
    }

    async fileSize(path: string) {
        return (await this.adapter.fileSize(this.pathNormalizer.normalizePath(path)));
    }

    async mimeType(path: string) {
        return (await this.adapter.mimeType(this.pathNormalizer.normalizePath(path)));
    }
}

export default FileSystem;