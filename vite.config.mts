import { defineConfig } from "vite";

export default defineConfig({
    define: {
        __RESOURCE_VERSION__: JSON.stringify(Date.now().toString())
    }
});
