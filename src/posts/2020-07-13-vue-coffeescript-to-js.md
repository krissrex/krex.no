---
title: Converting Vue from coffeescript to javascript
description: 
date: 2020-07-13 14:57:00
---

This script will extract the coffee from the `.vue`-files, convert it with
[decaffeinate](https://www.npmjs.com/package/decaffeinate)
and then insert the javascript back into the `.vue`-file.


```py
#!python

"""
Prerequisites: `npm install -g decaffeinate`.
Run from: inside `src/` folder.
Run with: `find . -type f -name '*.vue' -print0 | xargs -0 -n1 ./bulk-vue-decaf.py`
then: `npm run lint -- --fix`
"""

import os
from sys import argv
import subprocess

def get_coffee_scripttag_bounds(vue_code: str, vue_file_path: str) -> tuple:
  tag_open = '<script lang="coffee">'
  tag_count = vue_code.count(tag_open)
  if tag_count != 1:
    print("ERR: " + vue_file_path + " - number of coffee tags is not 1: " + str(tag_count))
    exit(1)

  start = vue_code.index(tag_open) + len(tag_open)
  end = vue_code.index("</script>", start)
  if start == -1 or end < start:
    print("ERR: " + vue_file_path + " - (start, end) range invalid: " + start + ', ' + end)
    exit(1)
  
  return (start, end)

def extract_coffee_from_vue(vue_file_path: str) -> str:
  """:return: resulting out file"""
  with open(vue_file_path, "r", encoding="utf-8") as f:
    code: str = f.read()
  
  start, end = get_coffee_scripttag_bounds(code, vue_file_path)

  coffeescript = code[start: end]
  if len(coffeescript) == 0:
    print("ERR: " + vue_file_path + " - no code!")
    exit(1)
  
  out_file = vue_file_path + ".coffee"
  if os.path.exists(out_file):
    print("ERR: " + out_file + " exists!")
    exit(1)
  
  with open(out_file, "w+", encoding="utf-8") as out:
    out.write(coffeescript)
  
  return out_file

def run_decaffeinate(coffee_file_path: str) -> str:
  """:return: the new js file"""
  result = subprocess.run(["decaffeinate", "--use-cs2", "--use-js-modules", "--loose-js-modules", coffee_file_path], shell=True, check=True, capture_output=True)
  if result.returncode != 0:
    print("ERR: " + coffee_file_path + " - decaffeinate gave an error. Exit code " + result.returncode)
    print(result.stderr)
    print(result.stdout)
    exit(1)
  else:
    print("INFO: " + coffee_file_path + " - decaffeinated: " + result.stdout.decode("utf-8"))

  return coffee_file_path.replace(".coffee", ".js", 1)

def replace_coffee_with_js_inside_vue(vue_file: str, converted_js_file: str) -> None:
  with open(vue_file, "r", encoding="utf-8") as original:
    code = original.read()
  
  start, end = get_coffee_scripttag_bounds(code, vue_file)

  with open(converted_js_file, "r", encoding="utf-8") as pure_js:
    js_code = pure_js.read()
  
  patched_vue_code = code[0:start] + "\n" + js_code + "\n" + code[end:]
  patched_vue_code = patched_vue_code.replace('<script lang="coffee">', "<script>")

  out_file = vue_file.replace(".vue", ".decaf.vue")
  with open(out_file, "w+", encoding="utf-8") as out:
    out.write(patched_vue_code)
  return out_file

if __name__ == '__main__':
  if len(argv) != 2:
    print("Usage: " + argv[0] + " src/App.vue")
    exit(0)
  
  vue_file = argv[1]
  if not os.path.exists(vue_file):
    print("ERR: invalid file " + vue_file)
    exit(1)
  
  print("INFO: converting " + vue_file + " ...")

  coffee_file = extract_coffee_from_vue(vue_file)
  assert os.path.exists(coffee_file)
  js_file = run_decaffeinate(coffee_file)
  assert os.path.exists(js_file)
  end_result_file = replace_coffee_with_js_inside_vue(vue_file, js_file)
  assert os.path.exists(end_result_file)

  os.unlink(coffee_file)
  os.unlink(js_file)

  os.unlink(vue_file)
  os.rename(end_result_file, vue_file)

  print("Done with " + vue_file)
```
    
## Converting `import/export` to `require/module.exports`
    
See the [GitHub gist with jscodeshift code](https://gist.github.com/krissrex/97dbbfdf1f906d797ab5c8cc7ae67384).
