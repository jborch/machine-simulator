using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class UnloadingStation : IStation
{
    public string Name => "Unloading";

    public void Process(ICarrier carrier)
    {
        Console.WriteLine($"[{Name}] Processing carrier {carrier.Id}");
    }
}
