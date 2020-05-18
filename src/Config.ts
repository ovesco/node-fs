import { ProvidedConfig } from './Types';

class Config {
    constructor(config: ProvidedConfig) {
    }

    extend(config: ProvidedConfig): Config {

        return this;
    }
}

export default Config;