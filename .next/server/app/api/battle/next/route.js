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
exports.id = "app/api/battle/next/route";
exports.ids = ["app/api/battle/next/route"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fbattle%2Fnext%2Froute&page=%2Fapi%2Fbattle%2Fnext%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fbattle%2Fnext%2Froute.ts&appDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fbattle%2Fnext%2Froute&page=%2Fapi%2Fbattle%2Fnext%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fbattle%2Fnext%2Froute.ts&appDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_tim_Desktop_Windsurf_Projects_mixtape_battle_app_api_battle_next_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/battle/next/route.ts */ \"(rsc)/./app/api/battle/next/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/battle/next/route\",\n        pathname: \"/api/battle/next\",\n        filename: \"route\",\n        bundlePath: \"app/api/battle/next/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\tim\\\\Desktop\\\\Windsurf Projects\\\\mixtape-battle\\\\app\\\\api\\\\battle\\\\next\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_tim_Desktop_Windsurf_Projects_mixtape_battle_app_api_battle_next_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZiYXR0bGUlMkZuZXh0JTJGcm91dGUmcGFnZT0lMkZhcGklMkZiYXR0bGUlMkZuZXh0JTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYmF0dGxlJTJGbmV4dCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUN0aW0lNUNEZXNrdG9wJTVDV2luZHN1cmYlMjBQcm9qZWN0cyU1Q21peHRhcGUtYmF0dGxlJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUN0aW0lNUNEZXNrdG9wJTVDV2luZHN1cmYlMjBQcm9qZWN0cyU1Q21peHRhcGUtYmF0dGxlJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUM0QztBQUN6SDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcdGltXFxcXERlc2t0b3BcXFxcV2luZHN1cmYgUHJvamVjdHNcXFxcbWl4dGFwZS1iYXR0bGVcXFxcYXBwXFxcXGFwaVxcXFxiYXR0bGVcXFxcbmV4dFxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYmF0dGxlL25leHQvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9iYXR0bGUvbmV4dFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYmF0dGxlL25leHQvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFx0aW1cXFxcRGVza3RvcFxcXFxXaW5kc3VyZiBQcm9qZWN0c1xcXFxtaXh0YXBlLWJhdHRsZVxcXFxhcHBcXFxcYXBpXFxcXGJhdHRsZVxcXFxuZXh0XFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fbattle%2Fnext%2Froute&page=%2Fapi%2Fbattle%2Fnext%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fbattle%2Fnext%2Froute.ts&appDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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

/***/ "(rsc)/./app/api/battle/next/route.ts":
/*!**************************************!*\
  !*** ./app/api/battle/next/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\nasync function GET() {\n    // Return two random songs biased by similar elo (simple approach)\n    const songs = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.song.findMany({\n        take: 50,\n        orderBy: {\n            elo: \"desc\"\n        }\n    });\n    if (songs.length < 2) return new Response(null, {\n        status: 204\n    });\n    // pick a random pivot then find nearest by elo\n    const pivot = songs[Math.floor(Math.random() * songs.length)];\n    let candidate = songs.filter((s)=>s.id !== pivot.id).sort((a, b)=>Math.abs(a.elo - pivot.elo) - Math.abs(b.elo - pivot.elo))[0];\n    if (!candidate) candidate = songs.find((s)=>s.id !== pivot.id);\n    return new Response(JSON.stringify({\n        a: pivot,\n        b: candidate\n    }), {\n        headers: {\n            \"Content-Type\": \"application/json\"\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2JhdHRsZS9uZXh0L3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQWdEO0FBRXpDLGVBQWVDO0lBQ3BCLGtFQUFrRTtJQUNsRSxNQUFNQyxRQUFRLE1BQU1GLCtDQUFNQSxDQUFDRyxJQUFJLENBQUNDLFFBQVEsQ0FBQztRQUFFQyxNQUFNO1FBQUlDLFNBQVM7WUFBRUMsS0FBSztRQUFPO0lBQUU7SUFDOUUsSUFBSUwsTUFBTU0sTUFBTSxHQUFHLEdBQUcsT0FBTyxJQUFJQyxTQUFTLE1BQU07UUFBRUMsUUFBUTtJQUFJO0lBRTlELCtDQUErQztJQUMvQyxNQUFNQyxRQUFRVCxLQUFLLENBQUNVLEtBQUtDLEtBQUssQ0FBQ0QsS0FBS0UsTUFBTSxLQUFLWixNQUFNTSxNQUFNLEVBQUU7SUFDN0QsSUFBSU8sWUFBWWIsTUFDYmMsTUFBTSxDQUFDLENBQUNDLElBQU1BLEVBQUVDLEVBQUUsS0FBS1AsTUFBTU8sRUFBRSxFQUMvQkMsSUFBSSxDQUFDLENBQUNDLEdBQUdDLElBQU1ULEtBQUtVLEdBQUcsQ0FBQ0YsRUFBRWIsR0FBRyxHQUFHSSxNQUFNSixHQUFHLElBQUlLLEtBQUtVLEdBQUcsQ0FBQ0QsRUFBRWQsR0FBRyxHQUFHSSxNQUFNSixHQUFHLEVBQUUsQ0FBQyxFQUFFO0lBRS9FLElBQUksQ0FBQ1EsV0FBV0EsWUFBWWIsTUFBTXFCLElBQUksQ0FBQyxDQUFDTixJQUFNQSxFQUFFQyxFQUFFLEtBQUtQLE1BQU1PLEVBQUU7SUFFL0QsT0FBTyxJQUFJVCxTQUFTZSxLQUFLQyxTQUFTLENBQUM7UUFBRUwsR0FBR1Q7UUFBT1UsR0FBR047SUFBVSxJQUFJO1FBQzlEVyxTQUFTO1lBQUUsZ0JBQWdCO1FBQW1CO0lBQ2hEO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcdGltXFxEZXNrdG9wXFxXaW5kc3VyZiBQcm9qZWN0c1xcbWl4dGFwZS1iYXR0bGVcXGFwcFxcYXBpXFxiYXR0bGVcXG5leHRcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHByaXNtYSB9IGZyb20gXCIuLi8uLi8uLi8uLi9saWIvcHJpc21hXCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xyXG4gIC8vIFJldHVybiB0d28gcmFuZG9tIHNvbmdzIGJpYXNlZCBieSBzaW1pbGFyIGVsbyAoc2ltcGxlIGFwcHJvYWNoKVxyXG4gIGNvbnN0IHNvbmdzID0gYXdhaXQgcHJpc21hLnNvbmcuZmluZE1hbnkoeyB0YWtlOiA1MCwgb3JkZXJCeTogeyBlbG86IFwiZGVzY1wiIH0gfSk7XHJcbiAgaWYgKHNvbmdzLmxlbmd0aCA8IDIpIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwgeyBzdGF0dXM6IDIwNCB9KTtcclxuXHJcbiAgLy8gcGljayBhIHJhbmRvbSBwaXZvdCB0aGVuIGZpbmQgbmVhcmVzdCBieSBlbG9cclxuICBjb25zdCBwaXZvdCA9IHNvbmdzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHNvbmdzLmxlbmd0aCldO1xyXG4gIGxldCBjYW5kaWRhdGUgPSBzb25nc1xyXG4gICAgLmZpbHRlcigocykgPT4gcy5pZCAhPT0gcGl2b3QuaWQpXHJcbiAgICAuc29ydCgoYSwgYikgPT4gTWF0aC5hYnMoYS5lbG8gLSBwaXZvdC5lbG8pIC0gTWF0aC5hYnMoYi5lbG8gLSBwaXZvdC5lbG8pKVswXTtcclxuXHJcbiAgaWYgKCFjYW5kaWRhdGUpIGNhbmRpZGF0ZSA9IHNvbmdzLmZpbmQoKHMpID0+IHMuaWQgIT09IHBpdm90LmlkKSE7XHJcblxyXG4gIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBhOiBwaXZvdCwgYjogY2FuZGlkYXRlIH0pLCB7XHJcbiAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXHJcbiAgfSk7XHJcbn1cclxuIl0sIm5hbWVzIjpbInByaXNtYSIsIkdFVCIsInNvbmdzIiwic29uZyIsImZpbmRNYW55IiwidGFrZSIsIm9yZGVyQnkiLCJlbG8iLCJsZW5ndGgiLCJSZXNwb25zZSIsInN0YXR1cyIsInBpdm90IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiY2FuZGlkYXRlIiwiZmlsdGVyIiwicyIsImlkIiwic29ydCIsImEiLCJiIiwiYWJzIiwiZmluZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJoZWFkZXJzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/battle/next/route.ts\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fbattle%2Fnext%2Froute&page=%2Fapi%2Fbattle%2Fnext%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fbattle%2Fnext%2Froute.ts&appDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Ctim%5CDesktop%5CWindsurf%20Projects%5Cmixtape-battle&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();