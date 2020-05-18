import { Readable } from 'stream';
import * as nativeFs from 'fs';
import * as nativePath from 'path';

import FileSystem from '../../src/FileSystem';
import LocalAdapter from '../../src/Adapter/LocalAdapter';

const sleep = async () => new Promise((resolve) => {
    setTimeout(() => resolve(), 200);
});

describe('FileSystem API', () => {
    describe('Writing and reading', () => {

        const fs = new FileSystem(new LocalAdapter(__dirname));

        it('Should support writing a file', async () => {
            await fs.write('1.txt', 'file 1');
            await fs.write('2.txt', 'file 2');
        });

        it('Should support reading a file', async () => {
            expect(await fs.read('2.txt')).toBe('file 2');
            expect(await fs.read('1.txt')).toBe('file 1');
        });

        it('Should support writing a stream', async () => {
            try {
                await fs.writeStream('1stream.txt', Readable.from('file 1 stream'));
            } catch (e) {
                console.log(e);
            }
        });

        it('Should support reading a stream', async () => {
            const stream = await fs.readStream('1stream.txt');
            const chunks = [];
            stream.on('data', (c) => chunks.push(c.toString()));
            stream.on('error', (e) => expect(e).toBe(null));
            stream.on('end', () => expect(chunks.join('')).toBe('file 1 stream'));
        });

        it('Should support deleting files', async () => {
            await fs.delete('1.txt');
            await fs.delete('2.txt');
            await fs.delete('1stream.txt');

            await sleep();
            expect((await nativeFs.promises.readdir(__dirname)).length).toBe(1);
        });

        it('Should support creating directories', async () => {
            await fs.createDirectory('test1');
            await fs.createDirectory('test1/test2');
        });

        it('Should support writing in sub directories', async () => {
            await fs.write('test1/file1.txt', 'File in test 1');
            await fs.writeStream('test1/test2/file2.txt', Readable.from('File from stream in test 2'));
            expect(await fs.isDirectory('test1')).toBeTruthy();
            expect(await fs.isDirectory('test1/test2')).toBeTruthy();
            expect(await fs.isDirectory('test1/file1.txt')).toBeFalsy();
        });

        it('Should support moving files', async () => {
            await fs.move('test1/test2/file2.txt', 'test1/file3.txt');

            await sleep();
            expect((await nativeFs.promises.readdir(nativePath.join(__dirname, 'test1'))).length).toBe(3);
        });

        it('Should support copying files', async () => {
            await fs.copy('test1/file1.txt', 'test1/test2/file1copy.txt');
            expect(await fs.read('test1/test2/file1copy.txt')).toBe('File in test 1');
        });

        it('Should support saying if a file exists', async () => {
            expect(await fs.fileExists('test1/file1.txt')).toBeTruthy();
            expect(await fs.fileExists('test1/test2/file2.txt')).toBeFalsy();
        });

        it('Should support returning mime type and file size', async () => {
            expect(await fs.mimeType('test1/file1.txt')).toBe('text/plain');
            expect(await fs.fileSize('test1/file1.txt')).toBe(14);
        });

        it('Should support listing directory content', async () => {
            let ln = 0;
            for await (const it of fs.listContents('test1')) {
                expect(['test1/file1.txt', 'test1/file3.txt', 'test1/test2']).toContain(it);
                ln += 1;
            }

            expect(ln).toBe(3);
        });

        it('Should support listing directory content deeply', async () => {
            let ln = 0;
            for await (const it of fs.listContents('test1', true)) {
                expect(['test1/file1.txt', 'test1/file3.txt', 'test1/test2', 'test1/test2/file1copy.txt']).toContain(it);
                ln += 1;
            }

            expect(ln).toBe(4);
        });

        it('Should support deleting a directory', async () => {
            await fs.deleteDirectory('test1/test2');
            await sleep();

            expect((await nativeFs.promises.readdir(nativePath.join(__dirname, 'test1'))).length).toBe(2);

            await fs.createDirectory('test1/test3');
            await fs.write('test1/test3/aFile.txt', 'some content');
            await fs.deleteDirectory('test1');

            await sleep();
            expect((await nativeFs.promises.readdir(__dirname)).length).toBe(1);
        });
    });
});
