# Android emulator setup and recovery

This guide uses Windows PowerShell, Android Studio, and Expo SDK 55. The development machine has `Pixel_7` and `Medium_Phone_API_37.0` AVDs. Start one emulator at a time while troubleshooting.

## Start the app on an emulator

1. Open Android Studio's Device Manager. On the welcome screen, use More Actions -> Virtual Device Manager; inside a project, open the Device Manager tool window.
2. Launch Pixel 7 or another configured device and wait until Android's Home screen appears.
3. In PowerShell, confirm the SDK tools can see the device:

```powershell
adb devices -l
```

Expected device state, with the serial number varying by emulator:

```text
List of devices attached
emulator-5554    device
```

The `device` state means ADB is connected. Also confirm that Android has finished booting and that the Home screen responds. See [ADB device states](https://developer.android.com/tools/adb#devicestatus).

From the project root, start Expo and press `a`:

```powershell
npx expo start
```

Keep the emulator open while testing. Follow [Expo's emulator setup](https://docs.expo.dev/workflow/android-studio-emulator/) for Android Studio and SDK installation.

## Port 5554 connection refused or emulator offline

Errors such as `could not connect to TCP port 5554` mean Expo cannot reach the emulator's console. An `offline` entry in `adb devices` means ADB cannot communicate normally with the device.

1. Stop Expo with Ctrl+C.
2. In Device Manager, choose Stop from the running device's menu. Wait for the emulator process to exit.
3. Reset ADB in PowerShell:

```powershell
adb kill-server
adb start-server
```

4. Open the device's menu and choose Cold Boot Now. Wait for Android's Home screen. Cold boot starts the device without loading its saved boot snapshot. See [AVD boot options](https://developer.android.com/studio/run/managing-avds#avdproperties).
5. Check `adb devices -l` again. Proceed when it reports `device` and the emulator responds.
6. Restart Expo from the project root, then press `a`:

```powershell
npx expo start --clear
```

Restarting ADB is a supported step when ADB stops responding. See [Stopping the ADB server](https://developer.android.com/tools/adb#stopping).

## Android Studio says the emulator is already running

An error such as `Pixel 7 is already running as process 5460` can remain when the emulator process is stuck in the background. Try Device Manager -> Stop first.

If it will not stop, read the process ID in the current popup. Process IDs change between launches; `5460` was the ID in one troubleshooting session and should not be reused automatically.

In PowerShell, enter the current ID and inspect the process:

```powershell
$stuckEmulatorPid = [int](Read-Host "Process ID shown in the emulator popup")
$stuckEmulatorProcess = Get-Process -Id $stuckEmulatorPid -ErrorAction Stop
$stuckEmulatorProcess | Select-Object Id, ProcessName, Path
```

Confirm that this is the Android SDK's emulator process. In this workspace it was `qemu-system-x86_64`, with a path under `Android\Sdk\emulator\qemu\`. Stop that inspected instance with a check on its name and path:

```powershell
if (
  $stuckEmulatorProcess.ProcessName -like 'qemu-system-*' -and
  $stuckEmulatorProcess.Path -like '*\emulator\qemu\*'
) {
  $stuckEmulatorProcess | Stop-Process -Force
} else {
  throw "The selected process is not the expected Android emulator. Check its ID and path."
}
```

This ends that emulator instance. See [PowerShell Stop-Process](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/stop-process).

Reset ADB with the two commands above, then use Device Manager -> Pixel 7 -> Cold Boot Now. Wait for a responsive Android Home screen, check `adb devices`, and retry Expo.

## ADB tools are not found

Check their installation and available AVDs:

```powershell
Get-Command adb, emulator
adb version
emulator -list-avds
```

The usual Windows SDK location is `%LOCALAPPDATA%\Android\Sdk`. `adb.exe` is in `platform-tools`, and `emulator.exe` is in `emulator`. Follow the [Expo Windows instructions](https://docs.expo.dev/workflow/android-studio-emulator/) to configure the SDK and PATH.

## The emulator opens but login cannot reach the API

Run `npm run dev` in a separate terminal inside `backend/`. On the computer, check:

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/health'
```

Then open Chrome inside the emulator and visit `http://10.0.2.2:3000/health`. Both should report `database: "connected"`. The root `.env.local` needs:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

Restart Expo after editing that variable. The emulator uses `10.0.2.2` to reach the computer's local API. See [Android emulator addresses](https://developer.android.com/studio/run/emulator-networking-address).

Expo, the API, PostgreSQL, and the emulator all need to remain running for login tests. Use the [login checklist](login.md#10-run-the-checks-and-test) after connectivity works.
