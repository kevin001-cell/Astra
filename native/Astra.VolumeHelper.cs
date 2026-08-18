using System;
using System.Runtime.InteropServices;

[ComImport, Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IAudioEndpointVolume
{
    int RegisterControlChangeNotify(IntPtr notify);
    int UnregisterControlChangeNotify(IntPtr notify);
    int GetChannelCount(out uint channelCount);
    int SetMasterVolumeLevel(float levelDb, Guid eventContext);
    int SetMasterVolumeLevelScalar(float level, Guid eventContext);
    int GetMasterVolumeLevel(out float levelDb);
    int GetMasterVolumeLevelScalar(out float level);
    int SetChannelVolumeLevel(uint channelNumber, float levelDb, Guid eventContext);
    int SetChannelVolumeLevelScalar(uint channelNumber, float level, Guid eventContext);
    int GetChannelVolumeLevel(uint channelNumber, out float levelDb);
    int GetChannelVolumeLevelScalar(uint channelNumber, out float level);
    int SetMute([MarshalAs(UnmanagedType.Bool)] bool mute, Guid eventContext);
    int GetMute(out bool mute);
    int GetVolumeStepInfo(out uint step, out uint stepCount);
    int VolumeStepUp(Guid eventContext);
    int VolumeStepDown(Guid eventContext);
    int QueryHardwareSupport(out uint hardwareSupportMask);
    int GetVolumeRange(out float volumeMinDb, out float volumeMaxDb, out float volumeIncrementDb);
}

[ComImport, Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IMMDevice
{
    int Activate(ref Guid interfaceId, int classContext, IntPtr activationParams, [MarshalAs(UnmanagedType.IUnknown)] out object interfacePointer);
}

[ComImport, Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
internal interface IMMDeviceEnumerator
{
    int EnumAudioEndpoints(int dataFlow, uint stateMask, out IntPtr devices);
    int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice endpoint);
}

[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
internal class MMDeviceEnumerator
{
}

internal static class AstraAudio
{
    private static IAudioEndpointVolume Endpoint()
    {
        var enumerator = (IMMDeviceEnumerator)new MMDeviceEnumerator();
        IMMDevice device;
        Marshal.ThrowExceptionForHR(enumerator.GetDefaultAudioEndpoint(0, 1, out device));
        var interfaceId = typeof(IAudioEndpointVolume).GUID;
        object endpoint;
        Marshal.ThrowExceptionForHR(device.Activate(ref interfaceId, 23, IntPtr.Zero, out endpoint));
        return (IAudioEndpointVolume)endpoint;
    }

    internal static int Volume
    {
        get
        {
            float value;
            Marshal.ThrowExceptionForHR(Endpoint().GetMasterVolumeLevelScalar(out value));
            return Math.Max(0, Math.Min(100, (int)Math.Round(value * 100)));
        }
        set
        {
            Marshal.ThrowExceptionForHR(Endpoint().SetMasterVolumeLevelScalar(Math.Max(0, Math.Min(100, value)) / 100f, Guid.Empty));
        }
    }

    internal static bool Muted
    {
        get
        {
            bool value;
            Marshal.ThrowExceptionForHR(Endpoint().GetMute(out value));
            return value;
        }
        set
        {
            Marshal.ThrowExceptionForHR(Endpoint().SetMute(value, Guid.Empty));
        }
    }
}

internal static class Program
{
    private static int Main(string[] args)
    {
        try
        {
            var action = args.Length > 0 ? args[0].ToLowerInvariant() : "get";
            if (action == "set")
            {
                int volume;
                if (args.Length < 2 || !int.TryParse(args[1], out volume)) throw new ArgumentException("Invalid volume");
                AstraAudio.Volume = volume;
                AstraAudio.Muted = false;
            }
            else if (action == "mute") AstraAudio.Muted = true;
            else if (action == "unmute") AstraAudio.Muted = false;
            else if (action == "toggle") AstraAudio.Muted = !AstraAudio.Muted;
            else if (action != "get") throw new ArgumentException("Unsupported action");

            Console.WriteLine("{\"volume\":" + AstraAudio.Volume + ",\"muted\":" + AstraAudio.Muted.ToString().ToLowerInvariant() + "}");
            return 0;
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error.Message);
            return 1;
        }
    }
}
