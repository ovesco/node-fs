import { Readable } from 'stream';

import Config from './Config';

interface IAdapter {

    fileExists: (path: string) => Promise<boolean>;

    write(path: string, content: string, config: Config): Promise<void>;

    writeStream(path: string, content: Readable, config: Config): Promise<void>;

    isDirectory(path: string): Promise<boolean>;

    read(path: string): Promise<string>;

    readStream(path: string): Promise<Readable>;

    delete(path: string): Promise<void>;

    deleteDirectory(path: string): Promise<void>;

    createDirectory(path: string, config: Config): Promise<void>;

    mimeType(path: string): Promise<string>;

    lastModified(path: string): Promise<Date>;

    fileSize(path: string): Promise<number>;

    listContents(path: string, deep: boolean, showDirectories: boolean): AsyncIterable<string>;

    move(source: string, destination: string, config: Config): Promise<void>;

    copy(source: string, destination: string, config: Config): Promise<void>;
}

export default IAdapter;