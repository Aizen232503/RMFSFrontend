import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer';
import index from '../mock/index.ts';

export function setupProdMockServer() {
    createProdMockServer(index);
}