import { createApp } from '../src/app.js';
import { assertProductionSecrets } from '../src/config/env.js';

assertProductionSecrets();

export default createApp();
