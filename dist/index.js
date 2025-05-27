"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLayout = exports.addPage = exports.createProject = void 0;
// Main exports for the CLI package
var create_1 = require("./commands/create");
Object.defineProperty(exports, "createProject", { enumerable: true, get: function () { return create_1.createProject; } });
var add_page_1 = require("./commands/add-page");
Object.defineProperty(exports, "addPage", { enumerable: true, get: function () { return add_page_1.addPage; } });
var add_layout_1 = require("./commands/add-layout");
Object.defineProperty(exports, "addLayout", { enumerable: true, get: function () { return add_layout_1.addLayout; } });
//# sourceMappingURL=index.js.map