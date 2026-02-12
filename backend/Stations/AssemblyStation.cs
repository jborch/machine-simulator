using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class AssemblyStation : IStation
{
    public string Name => "Assembly";

    public void Process(ICarrier carrier)
    {
        Console.WriteLine($"[{Name}] Processing carrier {carrier.Id}");
    }
}
