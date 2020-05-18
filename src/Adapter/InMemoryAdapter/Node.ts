class Node {

    public readonly children: Map<string, Node> = new Map();

    public readonly files: Map<string, { data: string, date: Date }> = new Map();

    constructor(private name: string) {
    }

    navigate(path: string[], autocreate: boolean = false): Node {

        if (path.length === 0) return this;
        const [key, ...rest] = path;

        if (!this.children.has(key)) {
            this.children.set(key, new Node(key));
        }

        return this.children.get(key).navigate(rest);
    }

    getFile(name: string) {
        return this.files.has(name) ? this.files.get(name) : null;
    }

    setFile(name: string, data: string) {
        this.files.set(name, { data, date: new Date()});
    }

    removeFile(name: string) {
        this.files.delete(name);
    }

    removeDirectory(name: string) {
        this.children.delete(name);
    }
}

export default Node;