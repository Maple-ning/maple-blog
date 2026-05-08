
// Windows temporarily needs this file, https://github.com/module-federation/vite/issues/68

    import {loadShare} from "@module-federation/runtime";
    const importMap = {
      
        "vue": async () => {
          let pkg = await import("__mf__virtual/blogFront__prebuild__vue__prebuild__.js");
            return pkg;
        }
      
    }
      const usedShared = {
      
          "vue": {
            name: "vue",
            version: "3.5.30",
            scope: ["default"],
            loaded: false,
            from: "blogFront",
            async get () {
              if (false) {
                throw new Error(`[Module Federation] Shared module '${"vue"}' must be provided by host`);
              }
              usedShared["vue"].loaded = true
              const {"vue": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = false && "vue" === "react"
                ? (res?.default ?? res)
                : {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: false,
              requiredVersion: "^3.5.30",
              
            }
          }
        
    }
      const usedRemotes = [
                {
                  entryGlobalName: "mapleShares",
                  name: "mapleShares",
                  type: "module",
                  entry: "/maple-shares/remote/remoteEntry.js",
                  shareScope: "default",
                }
          
      ]
      export {
        usedShared,
        usedRemotes
      }
      