import { Readable } from 'stream';

interface IFileSystemWriter {

    write(location: string, content: string, config: Object): Promise<void>;

    writeStream(location: string, content: Readable, config: Object): Promise<void>;

    delete(location: string): Promise<void>;

    deleteDirectory(location: string): Promise<void>;

    createDirectory(location: string, config: Object): Promise<void>;

    move(source: string, destination: string, config: Object): Promise<void>;

    copy(source: string, destination: string, config: Object): Promise<void>;
}

export default IFileSystemWriter;