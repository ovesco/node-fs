import { Readable } from 'stream';

import IAdapter from '../../IAdapter';
import Node from './Node';

class InMemoryAdapter implements IAdapter {

    private root: Node = new Node('');

    constructor(private separator: string = '/') {
    }

    async fileExists(path: string) {
        const [pathData, filename] = this.extractLast(path);
        const lastNode = this.root.navigate(pathData);
        return lastNode === null ? false : lastNode.getFile(filename) !== null;
    }

    async write(path: string, content: string, config: Object = {}) {
        const [pathData, filename] = this.extractLast(path);
        this.root.navigate(pathData, true).setFile(filename, content);
    }

    writeStream(path: string, content: Readable, config: Object = {}) {
        return new Promise<void>((resolve, reject) => {
            const chunks = [];
            content.on('data', (chunk) => chunks.push(chunk));
            content.on('error', reject);
            content.on('end', () => {
                this.write(path, chunks.join('')).then(() => resolve());
            });
        });
    }

    async isDirectory(path: string) {
        const [pathData, name] = this.extractLast(path);
        const lastNode = this.root.navigate(pathData);
        return lastNode === null ? false : lastNode.getFile(name).data === null;
    }
    
    async read(path: string, config = {}) {
        const [pathData, name] = this.extractLast(path);
        const lastNode = this.root.navigate(pathData);
        return lastNode === null ? null : lastNode.getFile(name).data;
    }

    async readStream(path: string) {
        return Readable.from(await this.read(path));
    }
 
    async delete(path: string) {
        const [pathData, name] = this.extractLast(path);
        const lastNode = this.root.navigate(pathData);
        if (lastNode) lastNode.removeFile(name);
    }

    
    async deleteDirectory(path: string) {
        const [pathData, name] = this.extractLast(path);
        const lastNode = this.root.navigate(pathData);
        if (lastNode) lastNode.removeDirectory(name);
    }

    async createDirectory(path: string) {
        this.root.navigate(this.getPath(path), true);
    }

    
    async mimeType(path: string) {
        return 'application/octet-stream';
    }

    
    async lastModified(path: string) {
        const fileInfo = this.getFile(path);
        return fileInfo ? fileInfo.date : null;
    }

    async fileSize(path: string) {
        const fileInfo = this.getFile(path);
        return fileInfo ? fileInfo.data.length : null;
    }
    
    listContents(location: string, deep: boolean): AsyncIterator<string> {

        const node = this.root.navigate(this.getPath(location));
        if (node === null) return null;

        async function* iterate(curPath: string, node: Node) {
            curPath += this.separator;
            for (const [key] of node.files) yield `${curPath}${key}`;
            if (deep) {
                for (const [key, nextNode] of node.children) yield* iterate(curPath + key, nextNode);
            }
        }

        return iterate(location, node);
    }

    
    async move(source: string, destination: string, config: Object = {}) {
        await this.copy(source, destination, config);
        const [oldPathData, oldName] = this.extractLast(source);
        const oldNode = this.root.navigate(oldPathData);
        if (oldNode) oldNode.removeFile(oldName);
    }

    async copy(source: string, destination: string, config: Object = {}) {
        const [oldPathData, oldName] = this.extractLast(source);
        const [newPathData, newName] = this.extractLast(destination);
        const oldNode = this.root.navigate(oldPathData);
        if (!oldNode) return;
        const newNode = this.root.navigate(newPathData, true);
        const content = oldNode.getFile(oldName);
        if (!content) return;
        newNode.setFile(newName, content.data);
    }

    private getPath(pathDef: string): string[] {
        return pathDef.split(this.separator);
    }

    private extractLast(pathDef: string): [string[], string] {
        const pathData = this.getPath(pathDef);
        const last = pathData.pop();
        return [pathData, last];
    }

    private getFile(pathDef: string) {
        const [pathData, name] = this.extractLast(pathDef);
        const node = this.root.navigate(pathData);
        return node.getFile(name);
    }
}

export default InMemoryAdapter;