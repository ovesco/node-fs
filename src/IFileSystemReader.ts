import { Readable } from 'stream';

interface IFileSystemReader {

    fileExists(location: string): Promise<boolean>;

    read(location: string): Promise<string>;

    readStream(location: string): Promise<Readable>;

    isDirectory(path: string): Promise<boolean>;

    listContents(location: string, deep: boolean, showDirectories: boolean): AsyncIterable<string>;

    lastModified(path: string): Promise<Date>;

    fileSize(path: string): Promise<number>;

    mimeType(path: string): Promise<string>;
}

export default IFileSystemReader;