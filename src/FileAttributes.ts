class FileAttributes {

    lastModified(): Date {

        return new Date();
    }

    fileSize(): number {
        return 0;
    }

    mimeType(): string {
        return '';
    }
}

export default FileAttributes;