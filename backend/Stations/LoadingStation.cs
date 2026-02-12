using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class LoadingStation : IStation
{
    public string Name => "Loading";

    public void Process(ICarrier carrier)
    {
        Console.WriteLine($"[{Name}] Processing carrier {carrier.Id}");
    }
}
