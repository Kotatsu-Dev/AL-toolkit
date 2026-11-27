#!/usr/bin/env python3
"""Builds AL-toolkit's userscript without make or m4 (standard library only).

Usage: python build_al_toolkit.py [path to the AL-toolkit folder]

Without a path, the current folder is built (it must contain src/al-toolkit.m4).
A path given on the command line is always used instead, and the current folder is not checked then.

Does what `make -C src` does for the userscript:
- concatenates src/modules/* into src/build/userModules.js
- expands the m4 macros src/al-toolkit.m4 uses (m4_include, the version define, divert/dnl)
- writes src/build/al-toolkit.user.js
"""
import os
import re
import sys
import time


def read(path):
    with open(path, encoding="utf8", newline="") as f:
        return f.read()


def write(path, text):
    with open(path, "w", encoding="utf8", newline="") as f:
        f.write(text)


def main():
    if len(sys.argv) > 2:
        print("Usage: python build_al_toolkit.py [path to the AL-toolkit folder]")
        return 1
    if len(sys.argv) == 2:
        folder = os.path.abspath(sys.argv[1])
    else:
        folder = os.getcwd()
    src = os.path.join(folder, "src")
    if not os.path.isfile(os.path.join(src, "al-toolkit.m4")):
        print("Can't find src/al-toolkit.m4 in " + folder + ", is that the AL-toolkit folder?")
        return 1
    build_dir = os.path.join(src, "build")
    os.makedirs(build_dir, exist_ok=True)

    # build/userModules.js, same format as the makefile's loop
    # (plain code point order, like the makefile's glob in the C locale)
    user_modules = ""
    for name in sorted(os.listdir(os.path.join(src, "modules"))):
        path = "modules/" + name
        code = read(os.path.join(src, path))
        if not code.endswith("\n"):
            code += "\n"
        user_modules += "//begin " + path + "\n" + code + "//end " + path + "\n"
    write(os.path.join(build_dir, "userModules.js"), user_modules)

    defines = {}

    def expand(text, depth=0):
        if depth > 20:
            raise RuntimeError("m4_include nested too deeply")

        def include(match):
            path = match.group(1).strip()
            if path == "build/userModules.js":
                content = user_modules
            else:
                content = read(os.path.join(src, path))
            return expand(content, depth + 1)

        text = re.sub(r"m4_include\(([^)]+)\)", include, text)
        return re.sub(r"\b[A-Z][A-Z0-9_]*\b", lambda m: defines.get(m.group(0), m.group(0)), text)

    main_text = read(os.path.join(src, "al-toolkit.m4"))
    # header: m4_divert(-1) ... m4_divert(0)m4_dnl, only the defines are used
    header = re.match(r"m4_divert\(-1\)[\s\S]*?m4_divert\(0\)m4_dnl\r?\n", main_text)
    if header:
        for name, value in re.findall(r"m4_define\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*,\s*([^)]*)\)", header.group(0)):
            defines[name] = value.strip()
        main_text = main_text[header.end():]
    output = expand(main_text)
    outside_modules = re.sub(r"//begin modules[\s\S]*?//end modules/[^\n]*\n", "", output)
    if re.search(r"m4_[a-z]", outside_modules):
        print("Warning: some m4 macros were left unexpanded")
    output += "//AL-toolkit built at " + str(int(time.time())) + "\n"
    target = os.path.join(build_dir, "al-toolkit.user.js")
    write(target, output)
    print("Built " + target)
    return 0


if __name__ == "__main__":
    sys.exit(main())