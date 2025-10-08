import { createBackend } from '@backstage/backend-defaults';
import authPlugin from '@backstage/plugin-auth-backend';
import authModuleFoobarProvider from '../src/index';

const backend = createBackend();
backend.add(authPlugin);
backend.add(authModuleFoobarProvider);
backend.start();