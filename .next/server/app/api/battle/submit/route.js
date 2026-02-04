/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/battle/submit/route";
exports.ids = ["app/api/battle/submit/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fbattle%2Fsubmit%2Froute&page=%2Fapi%2Fbattle%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fbattle%2Fsubmit%2Froute.ts&appDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fbattle%2Fsubmit%2Froute&page=%2Fapi%2Fbattle%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fbattle%2Fsubmit%2Froute.ts&appDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_tim_Desktop_Windsurf_Projects_mixtape_battle_app_api_battle_submit_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/battle/submit/route.ts */ \"(rsc)/./app/api/battle/submit/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/battle/submit/route\",\n        pathname: \"/api/battle/submit\",\n        filename: \"route\",\n        bundlePath: \"app/api/battle/submit/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\tim\\\\Desktop\\\\Windsurf Projects\\\\mixtape-battle\\\\app\\\\api\\\\battle\\\\submit\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_tim_Desktop_Windsurf_Projects_mixtape_battle_app_api_battle_submit_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZiYXR0bGUlMkZzdWJtaXQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmJhdHRsZSUyRnN1Ym1pdCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmJhdHRsZSUyRnN1Ym1pdCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUN0aW0lNUNEZXNrdG9wJTVDV2luZHN1cmYlMjBQcm9qZWN0cyU1Q21peHRhcGUtYmF0dGxlJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUN0aW0lNUNEZXNrdG9wJTVDV2luZHN1cmYlMjBQcm9qZWN0cyU1Q21peHRhcGUtYmF0dGxlJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUM4QztBQUMzSDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcdGltXFxcXERlc2t0b3BcXFxcV2luZHN1cmYgUHJvamVjdHNcXFxcbWl4dGFwZS1iYXR0bGVcXFxcYXBwXFxcXGFwaVxcXFxiYXR0bGVcXFxcc3VibWl0XFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9iYXR0bGUvc3VibWl0L3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYmF0dGxlL3N1Ym1pdFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYmF0dGxlL3N1Ym1pdC9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXHRpbVxcXFxEZXNrdG9wXFxcXFdpbmRzdXJmIFByb2plY3RzXFxcXG1peHRhcGUtYmF0dGxlXFxcXGFwcFxcXFxhcGlcXFxcYmF0dGxlXFxcXHN1Ym1pdFxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fbattle%2Fsubmit%2Froute&page=%2Fapi%2Fbattle%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fbattle%2Fsubmit%2Froute.ts&appDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./app/api/battle/submit/route.ts":
/*!****************************************!*\
  !*** ./app/api/battle/submit/route.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n/* harmony import */ var _lib_elo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../lib/elo */ \"(rsc)/./lib/elo.ts\");\n\n\nasync function POST(request) {\n    const body = await request.json();\n    const { winnerId, loserId, skipped } = body;\n    if (skipped) {\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.battleVote.create({\n            data: {\n                songA: winnerId,\n                songB: loserId,\n                winner: null\n            }\n        });\n        return new Response(JSON.stringify({\n            ok: true\n        }));\n    }\n    const winner = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.song.findUnique({\n        where: {\n            id: winnerId\n        }\n    });\n    const loser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.song.findUnique({\n        where: {\n            id: loserId\n        }\n    });\n    if (!winner || !loser) return new Response(null, {\n        status: 400\n    });\n    const expectedW = (0,_lib_elo__WEBPACK_IMPORTED_MODULE_1__.expectedScore)(winner.elo, loser.elo);\n    const expectedL = (0,_lib_elo__WEBPACK_IMPORTED_MODULE_1__.expectedScore)(loser.elo, winner.elo);\n    const kW = (0,_lib_elo__WEBPACK_IMPORTED_MODULE_1__.kFactor)(winner.elo);\n    const kL = (0,_lib_elo__WEBPACK_IMPORTED_MODULE_1__.kFactor)(loser.elo);\n    const newW = (0,_lib_elo__WEBPACK_IMPORTED_MODULE_1__.newRating)(winner.elo, expectedW, 1, kW);\n    const newL = (0,_lib_elo__WEBPACK_IMPORTED_MODULE_1__.newRating)(loser.elo, expectedL, 0, kL);\n    await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.$transaction([\n        _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.song.update({\n            where: {\n                id: winner.id\n            },\n            data: {\n                elo: newW\n            }\n        }),\n        _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.song.update({\n            where: {\n                id: loser.id\n            },\n            data: {\n                elo: newL\n            }\n        }),\n        _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.battleVote.create({\n            data: {\n                songA: winnerId,\n                songB: loserId,\n                winner: winnerId\n            }\n        })\n    ]);\n    return new Response(JSON.stringify({\n        ok: true\n    }));\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2JhdHRsZS9zdWJtaXQvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQWdEO0FBQ3dCO0FBRWpFLGVBQWVJLEtBQUtDLE9BQWdCO0lBQ3pDLE1BQU1DLE9BQU8sTUFBTUQsUUFBUUUsSUFBSTtJQUMvQixNQUFNLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxPQUFPLEVBQUUsR0FBR0o7SUFFdkMsSUFBSUksU0FBUztRQUNYLE1BQU1WLCtDQUFNQSxDQUFDVyxVQUFVLENBQUNDLE1BQU0sQ0FBQztZQUFFQyxNQUFNO2dCQUFFQyxPQUFPTjtnQkFBVU8sT0FBT047Z0JBQVNPLFFBQVE7WUFBSztRQUFFO1FBQ3pGLE9BQU8sSUFBSUMsU0FBU0MsS0FBS0MsU0FBUyxDQUFDO1lBQUVDLElBQUk7UUFBSztJQUNoRDtJQUVBLE1BQU1KLFNBQVMsTUFBTWhCLCtDQUFNQSxDQUFDcUIsSUFBSSxDQUFDQyxVQUFVLENBQUM7UUFBRUMsT0FBTztZQUFFQyxJQUFJaEI7UUFBUztJQUFFO0lBQ3RFLE1BQU1pQixRQUFRLE1BQU16QiwrQ0FBTUEsQ0FBQ3FCLElBQUksQ0FBQ0MsVUFBVSxDQUFDO1FBQUVDLE9BQU87WUFBRUMsSUFBSWY7UUFBUTtJQUFFO0lBQ3BFLElBQUksQ0FBQ08sVUFBVSxDQUFDUyxPQUFPLE9BQU8sSUFBSVIsU0FBUyxNQUFNO1FBQUVTLFFBQVE7SUFBSTtJQUUvRCxNQUFNQyxZQUFZMUIsdURBQWFBLENBQUNlLE9BQU9ZLEdBQUcsRUFBRUgsTUFBTUcsR0FBRztJQUNyRCxNQUFNQyxZQUFZNUIsdURBQWFBLENBQUN3QixNQUFNRyxHQUFHLEVBQUVaLE9BQU9ZLEdBQUc7SUFFckQsTUFBTUUsS0FBSzNCLGlEQUFPQSxDQUFDYSxPQUFPWSxHQUFHO0lBQzdCLE1BQU1HLEtBQUs1QixpREFBT0EsQ0FBQ3NCLE1BQU1HLEdBQUc7SUFFNUIsTUFBTUksT0FBTzlCLG1EQUFTQSxDQUFDYyxPQUFPWSxHQUFHLEVBQUVELFdBQVcsR0FBR0c7SUFDakQsTUFBTUcsT0FBTy9CLG1EQUFTQSxDQUFDdUIsTUFBTUcsR0FBRyxFQUFFQyxXQUFXLEdBQUdFO0lBRWhELE1BQU0vQiwrQ0FBTUEsQ0FBQ2tDLFlBQVksQ0FBQztRQUN4QmxDLCtDQUFNQSxDQUFDcUIsSUFBSSxDQUFDYyxNQUFNLENBQUM7WUFBRVosT0FBTztnQkFBRUMsSUFBSVIsT0FBT1EsRUFBRTtZQUFDO1lBQUdYLE1BQU07Z0JBQUVlLEtBQUtJO1lBQUs7UUFBRTtRQUNuRWhDLCtDQUFNQSxDQUFDcUIsSUFBSSxDQUFDYyxNQUFNLENBQUM7WUFBRVosT0FBTztnQkFBRUMsSUFBSUMsTUFBTUQsRUFBRTtZQUFDO1lBQUdYLE1BQU07Z0JBQUVlLEtBQUtLO1lBQUs7UUFBRTtRQUNsRWpDLCtDQUFNQSxDQUFDVyxVQUFVLENBQUNDLE1BQU0sQ0FBQztZQUFFQyxNQUFNO2dCQUFFQyxPQUFPTjtnQkFBVU8sT0FBT047Z0JBQVNPLFFBQVFSO1lBQVM7UUFBRTtLQUN4RjtJQUVELE9BQU8sSUFBSVMsU0FBU0MsS0FBS0MsU0FBUyxDQUFDO1FBQUVDLElBQUk7SUFBSztBQUNoRCIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFx0aW1cXERlc2t0b3BcXFdpbmRzdXJmIFByb2plY3RzXFxtaXh0YXBlLWJhdHRsZVxcYXBwXFxhcGlcXGJhdHRsZVxcc3VibWl0XFxyb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbGliL3ByaXNtYVwiO1xyXG5pbXBvcnQgeyBleHBlY3RlZFNjb3JlLCBuZXdSYXRpbmcsIGtGYWN0b3IgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbGliL2Vsb1wiO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkge1xyXG4gIGNvbnN0IGJvZHkgPSBhd2FpdCByZXF1ZXN0Lmpzb24oKTtcclxuICBjb25zdCB7IHdpbm5lcklkLCBsb3NlcklkLCBza2lwcGVkIH0gPSBib2R5O1xyXG5cclxuICBpZiAoc2tpcHBlZCkge1xyXG4gICAgYXdhaXQgcHJpc21hLmJhdHRsZVZvdGUuY3JlYXRlKHsgZGF0YTogeyBzb25nQTogd2lubmVySWQsIHNvbmdCOiBsb3NlcklkLCB3aW5uZXI6IG51bGwgfSB9KTtcclxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBvazogdHJ1ZSB9KSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCB3aW5uZXIgPSBhd2FpdCBwcmlzbWEuc29uZy5maW5kVW5pcXVlKHsgd2hlcmU6IHsgaWQ6IHdpbm5lcklkIH0gfSk7XHJcbiAgY29uc3QgbG9zZXIgPSBhd2FpdCBwcmlzbWEuc29uZy5maW5kVW5pcXVlKHsgd2hlcmU6IHsgaWQ6IGxvc2VySWQgfSB9KTtcclxuICBpZiAoIXdpbm5lciB8fCAhbG9zZXIpIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwgeyBzdGF0dXM6IDQwMCB9KTtcclxuXHJcbiAgY29uc3QgZXhwZWN0ZWRXID0gZXhwZWN0ZWRTY29yZSh3aW5uZXIuZWxvLCBsb3Nlci5lbG8pO1xyXG4gIGNvbnN0IGV4cGVjdGVkTCA9IGV4cGVjdGVkU2NvcmUobG9zZXIuZWxvLCB3aW5uZXIuZWxvKTtcclxuXHJcbiAgY29uc3Qga1cgPSBrRmFjdG9yKHdpbm5lci5lbG8pO1xyXG4gIGNvbnN0IGtMID0ga0ZhY3Rvcihsb3Nlci5lbG8pO1xyXG5cclxuICBjb25zdCBuZXdXID0gbmV3UmF0aW5nKHdpbm5lci5lbG8sIGV4cGVjdGVkVywgMSwga1cpO1xyXG4gIGNvbnN0IG5ld0wgPSBuZXdSYXRpbmcobG9zZXIuZWxvLCBleHBlY3RlZEwsIDAsIGtMKTtcclxuXHJcbiAgYXdhaXQgcHJpc21hLiR0cmFuc2FjdGlvbihbXHJcbiAgICBwcmlzbWEuc29uZy51cGRhdGUoeyB3aGVyZTogeyBpZDogd2lubmVyLmlkIH0sIGRhdGE6IHsgZWxvOiBuZXdXIH0gfSksXHJcbiAgICBwcmlzbWEuc29uZy51cGRhdGUoeyB3aGVyZTogeyBpZDogbG9zZXIuaWQgfSwgZGF0YTogeyBlbG86IG5ld0wgfSB9KSxcclxuICAgIHByaXNtYS5iYXR0bGVWb3RlLmNyZWF0ZSh7IGRhdGE6IHsgc29uZ0E6IHdpbm5lcklkLCBzb25nQjogbG9zZXJJZCwgd2lubmVyOiB3aW5uZXJJZCB9IH0pLFxyXG4gIF0pO1xyXG5cclxuICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgb2s6IHRydWUgfSkpO1xyXG59XHJcbiJdLCJuYW1lcyI6WyJwcmlzbWEiLCJleHBlY3RlZFNjb3JlIiwibmV3UmF0aW5nIiwia0ZhY3RvciIsIlBPU1QiLCJyZXF1ZXN0IiwiYm9keSIsImpzb24iLCJ3aW5uZXJJZCIsImxvc2VySWQiLCJza2lwcGVkIiwiYmF0dGxlVm90ZSIsImNyZWF0ZSIsImRhdGEiLCJzb25nQSIsInNvbmdCIiwid2lubmVyIiwiUmVzcG9uc2UiLCJKU09OIiwic3RyaW5naWZ5Iiwib2siLCJzb25nIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaWQiLCJsb3NlciIsInN0YXR1cyIsImV4cGVjdGVkVyIsImVsbyIsImV4cGVjdGVkTCIsImtXIiwia0wiLCJuZXdXIiwibmV3TCIsIiR0cmFuc2FjdGlvbiIsInVwZGF0ZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/battle/submit/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/elo.ts":
/*!********************!*\
  !*** ./lib/elo.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   expectedScore: () => (/* binding */ expectedScore),\n/* harmony export */   kFactor: () => (/* binding */ kFactor),\n/* harmony export */   newRating: () => (/* binding */ newRating)\n/* harmony export */ });\nfunction expectedScore(ratingA, ratingB) {\n    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));\n}\nfunction kFactor(rating, gamesPlayed = 0) {\n    if (rating < 2100) return 32;\n    if (rating >= 2100 && rating < 2400) return 24;\n    return 16;\n}\nfunction newRating(oldRating, expected, score, k = 32) {\n    return oldRating + k * (score - expected);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZWxvLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLFNBQVNBLGNBQWNDLE9BQWUsRUFBRUMsT0FBZTtJQUM1RCxPQUFPLElBQUssS0FBSUMsS0FBS0MsR0FBRyxDQUFDLElBQUksQ0FBQ0YsVUFBVUQsT0FBTSxJQUFLLElBQUc7QUFDeEQ7QUFFTyxTQUFTSSxRQUFRQyxNQUFjLEVBQUVDLGNBQWMsQ0FBQztJQUNyRCxJQUFJRCxTQUFTLE1BQU0sT0FBTztJQUMxQixJQUFJQSxVQUFVLFFBQVFBLFNBQVMsTUFBTSxPQUFPO0lBQzVDLE9BQU87QUFDVDtBQUVPLFNBQVNFLFVBQVVDLFNBQWlCLEVBQUVDLFFBQWdCLEVBQUVDLEtBQWEsRUFBRUMsSUFBSSxFQUFFO0lBQ2xGLE9BQU9ILFlBQVlHLElBQUtELENBQUFBLFFBQVFELFFBQU87QUFDekMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcdGltXFxEZXNrdG9wXFxXaW5kc3VyZiBQcm9qZWN0c1xcbWl4dGFwZS1iYXR0bGVcXGxpYlxcZWxvLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBleHBlY3RlZFNjb3JlKHJhdGluZ0E6IG51bWJlciwgcmF0aW5nQjogbnVtYmVyKSB7XHJcbiAgcmV0dXJuIDEgLyAoMSArIE1hdGgucG93KDEwLCAocmF0aW5nQiAtIHJhdGluZ0EpIC8gNDAwKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBrRmFjdG9yKHJhdGluZzogbnVtYmVyLCBnYW1lc1BsYXllZCA9IDApIHtcclxuICBpZiAocmF0aW5nIDwgMjEwMCkgcmV0dXJuIDMyO1xyXG4gIGlmIChyYXRpbmcgPj0gMjEwMCAmJiByYXRpbmcgPCAyNDAwKSByZXR1cm4gMjQ7XHJcbiAgcmV0dXJuIDE2O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbmV3UmF0aW5nKG9sZFJhdGluZzogbnVtYmVyLCBleHBlY3RlZDogbnVtYmVyLCBzY29yZTogbnVtYmVyLCBrID0gMzIpIHtcclxuICByZXR1cm4gb2xkUmF0aW5nICsgayAqIChzY29yZSAtIGV4cGVjdGVkKTtcclxufVxyXG4iXSwibmFtZXMiOlsiZXhwZWN0ZWRTY29yZSIsInJhdGluZ0EiLCJyYXRpbmdCIiwiTWF0aCIsInBvdyIsImtGYWN0b3IiLCJyYXRpbmciLCJnYW1lc1BsYXllZCIsIm5ld1JhdGluZyIsIm9sZFJhdGluZyIsImV4cGVjdGVkIiwic2NvcmUiLCJrIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/elo.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log: [\n        \"error\"\n    ]\n});\nif (true) global.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE4QztBQU92QyxNQUFNQyxTQUNYQyxPQUFPRCxNQUFNLElBQ2IsSUFBSUQsd0RBQVlBLENBQUM7SUFDZkcsS0FBSztRQUFDO0tBQVE7QUFDaEIsR0FBRztBQUVMLElBQUlDLElBQXFDLEVBQUVGLE9BQU9ELE1BQU0sR0FBR0EiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcdGltXFxEZXNrdG9wXFxXaW5kc3VyZiBQcm9qZWN0c1xcbWl4dGFwZS1iYXR0bGVcXGxpYlxccHJpc21hLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gXCJAcHJpc21hL2NsaWVudFwiO1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby12YXJcclxuICB2YXIgcHJpc21hOiBQcmlzbWFDbGllbnQgfCB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBwcmlzbWEgPVxyXG4gIGdsb2JhbC5wcmlzbWEgfHxcclxuICBuZXcgUHJpc21hQ2xpZW50KHtcclxuICAgIGxvZzogW1wiZXJyb3JcIl0sXHJcbiAgfSk7XHJcblxyXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSBnbG9iYWwucHJpc21hID0gcHJpc21hO1xyXG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwicHJpc21hIiwiZ2xvYmFsIiwibG9nIiwicHJvY2VzcyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fbattle%2Fsubmit%2Froute&page=%2Fapi%2Fbattle%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fbattle%2Fsubmit%2Froute.ts&appDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();