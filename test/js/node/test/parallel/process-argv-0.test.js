//#FILE: test-process-argv-0.js
//#SHA1: 849d017b5c8496f1927b0618a55a688f4a7aa982
//-----------------
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

"use strict";
const path = require("path");
const { spawn } = require("child_process");

if (process.argv[2] !== "child") {
  test("process.argv[0] in child process", async () => {
    const child = spawn(process.execPath, [__filename, "child"], {
      cwd: path.dirname(process.execPath),
    });

    let childArgv0 = "";
    for await (const chunk of child.stdout) {
      childArgv0 += chunk;
    }

    expect(childArgv0).toBe(process.execPath);
  });
} else {
  process.stdout.write(process.argv[0]);
}

//<#END_FILE: test-process-argv-0.js
