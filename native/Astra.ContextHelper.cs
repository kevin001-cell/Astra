using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

internal static class Program
{
    [StructLayout(LayoutKind.Sequential)]
    private struct SystemPowerStatus
    {
        public byte ACLineStatus;
        public byte BatteryFlag;
        public byte BatteryLifePercent;
        public byte Reserved;
        public int BatteryLifeTime;
        public int BatteryFullLifeTime;
    }
    [StructLayout(LayoutKind.Sequential)]
    private struct Rect
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    private struct MonitorInfo
    {
        public int Size;
        public Rect Monitor;
        public Rect Work;
        public int Flags;
    }

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern bool GetWindowRect(IntPtr window, out Rect rect);

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr window, out uint processId);

    [DllImport("user32.dll")]
    private static extern IntPtr MonitorFromWindow(IntPtr window, uint flags);

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    private static extern bool GetMonitorInfo(IntPtr monitor, ref MonitorInfo info);

    [DllImport("kernel32.dll")]
    private static extern bool GetSystemPowerStatus(out SystemPowerStatus status);

    private static string Escape(string value)
    {
        return (value ?? string.Empty).Replace("\\", "\\\\").Replace("\"", "\\\"");
    }

    private static int Main()
    {
        try
        {
            var window = GetForegroundWindow();
            if (window == IntPtr.Zero) throw new InvalidOperationException("No foreground window");
            Rect rect;
            if (!GetWindowRect(window, out rect)) throw new InvalidOperationException("Cannot read foreground bounds");
            uint processId;
            GetWindowThreadProcessId(window, out processId);
            var processName = string.Empty;
            try { processName = Process.GetProcessById((int)processId).ProcessName + ".exe"; } catch { }
            var monitor = MonitorFromWindow(window, 2);
            var info = new MonitorInfo { Size = Marshal.SizeOf(typeof(MonitorInfo)) };
            if (!GetMonitorInfo(monitor, ref info)) throw new InvalidOperationException("Cannot read monitor bounds");
            var tolerance = 3;
            var fullScreen = Math.Abs(rect.Left - info.Monitor.Left) <= tolerance
                && Math.Abs(rect.Top - info.Monitor.Top) <= tolerance
                && Math.Abs(rect.Right - info.Monitor.Right) <= tolerance
                && Math.Abs(rect.Bottom - info.Monitor.Bottom) <= tolerance
                && !processName.Equals("explorer.exe", StringComparison.OrdinalIgnoreCase);
            SystemPowerStatus power;
            var hasPower = GetSystemPowerStatus(out power);
            var batteryPercent = hasPower && power.BatteryLifePercent <= 100 ? power.BatteryLifePercent : -1;
            var charging = hasPower && power.ACLineStatus == 1;
            Console.WriteLine("{\"processName\":\"" + Escape(processName) + "\",\"fullScreen\":" + fullScreen.ToString().ToLowerInvariant() + ",\"batteryPercent\":" + batteryPercent + ",\"charging\":" + charging.ToString().ToLowerInvariant() + "}");
            return 0;
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error.Message);
            return 1;
        }
    }
}
