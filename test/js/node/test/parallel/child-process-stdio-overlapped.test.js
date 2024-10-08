//#FILE: test-child-process-stdio-overlapped.js
//#SHA1: 20ead82f2ea74983af7bead33605fe8f33fccf6d
//-----------------
// Test for "overlapped" stdio option. This test uses the "overlapped-checker"
// helper program which basically a specialized echo program.
//
// The test has two goals:
//
// - Verify that overlapped I/O works on windows. The test program will deadlock
//   if stdin doesn't have the FILE_FLAG_OVERLAPPED flag set on startup (see
//   test/overlapped-checker/main_win.c for more details).
// - Verify that "overlapped" stdio option works transparently as a pipe (on
//   unix/windows)
//
// This is how the test works:
//
// - This script assumes only numeric strings are written to the test program
//   stdout.
// - The test program will be spawned with "overlapped" set on stdin and "pipe"
//   set on stdout/stderr and at startup writes a number to its stdout
// - When this script receives some data, it will parse the number, add 50 and
//   write to the test program's stdin.
// - The test program will then echo the number back to us which will repeat the
//   cycle until the number reaches 200, at which point we send the "exit"
//   string, which causes the test program to exit.
// - Extra assertion: Every time the test program writes a string to its stdout,
//   it will write the number of bytes written to stderr.
// - If overlapped I/O is not setup correctly, this test is going to hang.
"use strict";
const path = require("path");
const child_process = require("child_process");
const fs = require("fs");

const exeExtension = process.platform === "win32" ? ".exe" : "";
const exe = "overlapped-checker" + exeExtension;
const exePath = path.join(path.dirname(process.execPath), exe);

test("overlapped stdio option", async () => {
  if (!fs.existsSync(exePath)) {
    console.log(exe + " binary is not available");
    return;
  }

  const child = child_process.spawn(exePath, [], {
    stdio: ["overlapped", "pipe", "pipe"],
  });

  child.stdin.setEncoding("utf8");
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");

  function writeNext(n) {
    child.stdin.write((n + 50).toString());
  }

  child.stdout.on("data", s => {
    const n = Number(s);
    if (n >= 200) {
      child.stdin.write("exit");
      return;
    }
    writeNext(n);
  });

  let stderr = "";
  child.stderr.on("data", s => {
    stderr += s;
  });

  await new Promise(resolve => {
    child.stderr.on("end", resolve);
  });

  // This is the sequence of numbers sent to us:
  // - 0 (1 byte written)
  // - 50 (2 bytes written)
  // - 100 (3 bytes written)
  // - 150 (3 bytes written)
  // - 200 (3 bytes written)
  expect(stderr).toBe("12333");

  const exitPromise = new Promise(resolve => {
    child.on("exit", resolve);
  });

  const status = await exitPromise;
  // The test program will return the number of writes as status code.
  expect(status).toBe(0);
});

//<#END_FILE: test-child-process-stdio-overlapped.js
