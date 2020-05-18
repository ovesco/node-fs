import { normalize } from 'path';

import IPathNormalizer from '../IPathNormalizer';

class WhitespaceNormalizer implements IPathNormalizer {

    normalizePath(path: string) {
        return normalize(path);
    }
}

export default WhitespaceNormalizer;