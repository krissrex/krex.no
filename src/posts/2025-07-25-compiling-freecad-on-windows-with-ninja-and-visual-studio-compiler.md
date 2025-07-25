---
title: Compiling FreeCAD on Windows with Ninja and Visual Studio compiler
description: 
date: 2025-07-25 16:40:11
---

<p style="font-size: 0.8em">
<i>License: Public Domain. You can copy, steal, reproduce this text as your own and never mention me.</i>
</p>

Compiling FreeCAD can take a long time, especially without parallell compilation and precompiled headers.
In this post, I describe how to successfully compile FreeCAD for 64bit intel (`amd64`) in `Release` or `RelWithDebInfo` on Windows 10 using Visual Studio Community 2022.
The editor I use is CLion from Jetbrains on a free community license.


**Note: you need lots of free disk space for this. Visual Studio needs over 4GB, and FreeCAD needs about 3GB. Compiling FreeCAD with *precompiled headers* will use over 35GB!**
The `.obj` files take about 13GB, and the `.pch` files need 9GB.


**Note: if your C-drive is nearly full, compilation may fail as temporary files using up to 20GB are put on the C drive, regardless of where the source code is!**
They are deleted afterwards, but your compiler or linker will throw strange error messages.


## Installing prerequisites

> If you want to use [winGet](https://docs.microsoft.com/en-us/windows/package-manager/winget) to install some of the tools, install this now.
> The WinGet command line tool is only supported on Windows 10 version 1809 (build 17763) or later. 


**Note:** I put the files on my large D: drive. You can freely chose what location you want.


### 1) Git

We need `git` to clone FreeCAD in the next section. Start by installing [git-bash](https://git-scm.com/downloads/win). Make sure `git` is added to PATH.
  - `winget install --id Git.Git -e --source winget `

### 2) Visual Studio

Install [Visual Studio 2022 Community Edition](https://visualstudio.microsoft.com/downloads/). This has the compiler (`cl.exe`) that we need. The program you download here is not Visual Studio, but the *Visual Studio Installer*. Inside, we have to select `Visual Studio Community 2022`. 

If you absolutely want to skip installing the IDE, you can instead select the `Visual Studio Build Tools 2022`. I will select the IDE here. 

The installer will ask for a "workload", and you should select *Desktop development with C++*. In the list of optional packages on the right, make sure *MSVC v143 - VS 2022 C++ x64/x86 build tools* are enabled. The version (`v143`) corresponds with what the [FreeCAD-LibPack](https://github.com/FreeCAD/FreeCAD-LibPack) says in its readme. If the readme changes, go back and modify your Visual Studio Installer installation to match. The other packages are optional and can be unselected. You can come back later if you want to use Visual Studio IDE more.

### 3) CCache

This one is optional. 
CCache can be installed from [ccache.dev](https://ccache.dev/download.html).
  - `winget install --id=Ccache.Ccache -e`

### 4) FreeCAD LibPack

Download the [FreeCAD LibPack](https://github.com/FreeCAD/FreeCAD-LibPack/releases). If you are planning to work on the latest version of FreeCAD, download the newest release of LibPack. The LibPack is a bundle of dependencies (like python, QT, Boost) that are pre-compiled in `Release` mode. (Thus, you can't use this to build FreeCAD in `Debug` mode!). Extract the file to a suitable location. I chose `D:/dev/LibPack-1.1.0-v3.1.1.3-Release` .

### 5) Ninja

Install the [ninja](https://github.com/ninja-build/ninja/releases) build tool. This will execute the compiler on all the files, and replaces the Visual Studio solution (`.sln`) approach. The point of `ninja` is to be fast.
  - `winget install --id=Ninja-build.Ninja -e`

### 6) CMake

Install [CMake](https://cmake.org/download/). I got the *Windows x64 Installer* binary distrubution for the *Latest Release* (4.0.3 at the time). CMake is a meta build system. It builds the build system files. In our case: CMake generates the `ninja.build` and related files. We are mainly going to use `cmake-gui.exe` to configure and generate, and then `ninja.exe` to build afterwards. If the repository changes on a `git pull` or you update the `LibPack`, you may have to use CMake again to re-generate.
  - `winget install --id=Kitware.CMake -e`

At this point, we have installed several executables and added them to the PATH. To ensure the changes to PATH take effect, **you should reboot your computer now**.

## Cloning FreeCAD

Open the file explorer in a folder you want to clone FreeCAD to. I chose `D:/dev/`, as a `FreeCAD` folder will automatically be created in the next step.
Right click in the explorer, and select `Open Git Bash here`. If you don't have this option, search the start menu for `Git Bash` and type `cd D:/dev` or where you are going to put the FreeCAD source code.

Now, download the FreeCAD source code: `git clone --recurse-submodules https://github.com/FreeCAD/FreeCAD.git` .
You could have tried `--depth 1` to save some time, but a script used by FreeCAD to generate versions will fail during compilation if you do.
This will download about 2GB of files.

**Tip:** you can save some space by doing `cd FreeCAD` and then `git gc --aggressive`. This may take a few minutes, but it will reduce the size of a `pack` file from 2GB down to 1GB.

## Configuring CMake

This step is important, and without attention to details, it may fail your compilation an hour later. Pay attention here!

> Why CMake GUI and not CLion Cmake profiles? Well I tried, but had issues where LibPack was not being copied over.

First, the most important step, is to open your start menu and find **x64 Native Tools Command Prompt for VS 2022** . If you do not use this terminal, **CMake will not find your compiler** and fail to create a ninja build. It would only work with a visual studio generator to create `.sln` because CMake knows how to find the compiler in this case.
Essentially, this is a shell where Visual Studio `cl.exe` is set as the default compiler, and in 64-bit mode.

Next, open CMake by typing `cmake-gui` in this terminal.
For *Where is the source code*, I select the FreeCAD repo: `D:/dev/FreeCAD`.
You can chose anything in *Where to build the binaries*, I go with `D:/dev/FreeCAD/cmake-build-release-ninja-msvc` and let it create the folder if it doesn't exist.
I do not select a preset, and leave it at `<custom>`.


**Note:** If CMake is already preloaded with settings and a visual studio generator from your previous attempts, select *File* and *Delete Cache*. This will **delete** the `CMakeCache.txt` and **any settings you entered before will be lost**.

Now, click *Configure* at the bottom. The generator in the dropdown should say `Ninja`. The radio button with `Use default native compilers` should be checked, and if the **x64 Native Tools Command Prompt for VS 2022** did its thing, this should be Visual Studio 22 with its `cl.exe`.
When you click *Finish*, text should appear at the bottom followed by an Error dialog claiming *"Error in configuration process, [...]"*. 
Click *OK*, it just means we have more to configure.

How CMake works, is that options in the CMake GUI show up as it learns about new options. The new options appear red untill you click *Configure* again.

Check the *Grouped* and *Advanced* checkboxes near the top of CMake GUI.
Expand the `CMAKE` group, and verify that it shows file paths like `Microsoft Visual Studio`, `Hostx64`, and `lib.exe`, `cl.exe` and so on. This means CMake found our *default native compiler*.

Change the value of `CMAKE_BUILD_TYPE` from `Debug` to `RelWithDebInfo` (or `Release`). This makes `ninja` build a *release with debug info*, and the debug info can be handy in case of bugs or crashes later.

Change the `CMAKE_INSTALL_PREFIX` to a folder you want to place the finished FreeCAD program in. Using `ninja install` later is optional, and creates a 3GB large folder of the `FreeCAD.exe` and any libraries it needs. We will also configure CMake to copy the LibPack to the build, so this `install` step is not neccesary to do.
I chose `D:/dev/FreeCAD/cmake-build-install-ninja-msvc`. (The name `cmake-build-` will make git ignore the folder, which is why I chose this name. The folder could also be outside of the repo, like `D:/my-freecad`).


Expand the `Ungrouped Entries` and set `CCACHE_PROGRAM` to your `ccache.exe` path. If you used `winget`, open a terminal and type `where ccache` and copy the full path.
It may look something like `C:\Users\Kristian\AppData\Local\Microsoft\WinGet\Packages\Ccache ... \ccache.exe` .


Now expand the `FREECAD` group and set the `FREECAD_LIBPACK_DIR` to your extracted LibPack folder. I chose `D:/dev/LibPack-1.1.0-v3.1.1.3-Release` .

As I said before, new options will show up as CMake learns about them. Hit *Configure* and the LibPack should cause new settings to appear.
Ensure the text at the bottom says `Found Libpack` near the beginning. It should also say `Compiling with Qt 6`. and `Found Python3`.
Ignore the other warnings like *"Could NOT find Doxygen"*, this is fine,
After printing out a long list of `.cpp` files, you should se an overview of the new settings, in sections like `System`, `Config` and `Libraries`.
We will now edit some of these.

### Configuring FreeCAD in CMAKE to our liking

The first and most important change, is enabling copy of the LibPack into the build folder. If we skip this step, FreeCAD will only execute after `ninja install` and from the folder set as `CMAKE_INSTALL_PREFIX`.
Start by expanding the new, red group called `FREECAD`. (There will be 2 `FREECAD` in CMake now, where any newly discovered options are red).

Ensure that all the following are checked:

* `FREECAD_COPY_DEPEND_DIRS_TO_BUILD`
* `FREECAD_COPY_LIBPACK_BIN_TO_BUILD`
* `FREECAD_COPY_PLUGINS_BIN_TO_BUILD`

You can find this list in the readme for FreeCAD-LibPack on github as well.


> If you want to configure the [Vulkan SDK](https://vulkan.lunarg.com/), it should be set now under `Vulkan`. But I doubt it has any effect, because QT is already compiled in LibPack, and Pyside is compiled with the Vulkan SDK set to `None` in LibPack. 
> 
> Point the `Vulkan_GLSLANG_VALIDATOR_EXECUTABLE` to `D:/dev/VulkanSDK/1.4.321.1/Bin/glslangValidator.exe` (again, I used my D: drive for Vulkan SDK), the `Vulkan_GLSLC_EXECUTABLE` to `D:/dev/VulkanSDK/1.4.321.1/Bin/glslc.exe`, `Vulkan_INCLUDE_DIR` to `D:/dev/VulkanSDK/1.4.321.1/include` and `Vulkan_LIBRARY` to `D:/dev/VulkanSDK/1.4.321.1/Lib/vulkan-1.lib` . 
> 
> *I cannot verify that all these settings are correct.* Please verify on your own, if you need this.


Now to the final, and optional step: Removing compilation units for modules you do not want.
By default, FreeCAD will build a lot of modules and workbenches. We can save some time by disabling the ones you don't need.
Expand the group `BUILD`, and disable a few components. Note that some depend on other, and you will get a warning in the next *Configure* step if this happens.
I disable the following:

* `BUILD_BIM`
* `BUILD_CAM`
* `BUILD_FEM`
* `BUILD_FEM_NETGEN`
* `BUILD_OPENSCAD`
* `BUILD_REVERSEENGINEERING`
* `BUILD_ROBOT`

Now click *Configure* for the last time.  
This time, the configuration will take considerable longer time because of the LibPack copying. The text output will say `Copying LibPack [...]` for quite a while.
Let it work, it is not finished even if no more text shows up. When the copy is done, a lot more text will appear.
Patience!

After about 5 minutes, you should see `Configuring done`.
Now we click *Generate*, and this is what creates the files for `ninja`.
This only takes about 10 seconds, and ends with the message `Generating done`. You can now close CMake GUI.

## Building FreeCAD

This part is easy, but slow.
Open the **x64 Native Tools Command Prompt for VS 2022**, and `D:` then `cd dev/FreeCAD`.
You have two options here:

1. `ninja -C cmake-build-release-ninja-msvc` or `ninja -C cmake-build-release-ninja-msvc install` (for a build followed by a copy to the install folder).
2. `cd cmake-build-release-ninja-msvc` followed by simply `ninja` or `ninja install` .

If everything is correct, you should see messages like `Compiling`, `Building` and `Copying` from ninja.
The compilation will use quite a bit of disk space now, about 13GB.
If precompiled headers are turned on (`FREECAD_USE_PCH`), this will create an additional 9GB of `.pch` files.


### Troubleshooting

If you see an error like `fatal error C1083: Cannot open include file: 'string': No such file or directory`, the visual studio environment variables are not set.
Use the Native Tools developer shell again.
Normally you run `vcvars64.bat` by typing (with quotes included):

```text
"C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"
```

**Note:** But this doesn't help if you are in `bash` (like `git-bash`), and you must open `cmd.exe` instead.
The `vcvars64.bat` is unable to export environment variables to `bash`.


You can clean up with `ninja clean`.
Any files in `data/Gui/PreferencePacks/*` must be manually deleted, and cause ninja to abort the clean.
`del /S /Q "data/Gui/PreferencePacks/"` .


If you see an error like `LINK : fatal error LNK1104: cannot open file 'python312.lib'`,
you may have accidentally changed a setting in CMake.
Go back to CMake and make sure `BUILD_DYNAMIC_LINK_PYTHON` is checked. If you changed the value now, click *Configure* and then *Generate* again.

## Opening the project with CLion

This is the easiest part.
Start CLion, select *Open* from the Launcher (or *File* then *Open* if you already have a project opened).
Browse to the root of the FreeCAD repo: `D:\dev\FreeCAD` for me.

> It may ask about CMake profiles in CLion, but I had trouble getting these to work. Just close the dialog.
> 
> What you are supposed to do, is select *Manage toolchains...*, create a new one (if Visual Studio is not detected), click *Add environment* and chose the `vcvars64.bat` file I mentioned above.
> Then go back to the CLion CMake window, select this toolchain, select `ninja` as *Generator*, and alter the *CMake options* to set the LIBPACK dir and copy flags, the install prefix path, and so on.
> Set the *Build directory*, and optionally *Build options* like `-j 8` (not really relevant for ninja).
> 
> I originally spent some time trying to make this work, but it failed. That's how I ended up with CMake GUI. Generation and compilation would work, but then the `FreeCAD.exe` would be missing files and failed to start.

CLion may take some time to index the code base. You should see a progress bar at the bottom right.
You can work while CLion indexes, but it may be a bit sluggish.

## Next steps

That's it. Now you should be able to modify the `cpp` and `h` files, and recompile with `ninja`.
The LibPack `bin/designer.exe` can open QT's `.ui` files, and you should also be able to find a `cmake-build-release-ninja-msvc/bin/designer.exe` in your build.

You should go back to GitHub and fork the FreeCAD repository, so you can create your own branches and modifications there.
Then, set your fork as a remote in `git` with `git remote add <fork-name> <my-fork-url.git>`.
When you have solved an issue on the FreeCAD repo, you create a Pull-Request from your branch in the fork repo to the `master` of the original FreeCAD repo.

Visit the [FreeCAD wiki > Developer Hub](https://wiki.freecad.org/Developer_hub) and read the sections under *Modifying FreeCAD*, *Module developer's guide* and *Build Support Tools*.
Also check out the forum at [FreeCAD forum > Users > Install / Compile and Run](https://forum.freecad.org/viewforum.php?f=4) and 
[FreeCAD forum > Development](https://forum.freecad.org/viewforum.php?f=6).

**Tip:** If you get the hang of FreeCAD development, look for [Bounties in Github](https://github.com/FreeCAD/FreeCAD/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22%3Adart%3A%20Bounty%22) to make some money!

