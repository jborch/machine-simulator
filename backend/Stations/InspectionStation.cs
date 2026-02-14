using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class InspectionStation : IStation
{
    public string Name => "Inspection";
    public string State { get; private set; } = "Idle";

    public void Process(ICarrier carrier)
    {
        Console.WriteLine($"[{Name}] Processing carrier {carrier.Id}");
    }

    public void Tick()
    {
        Console.WriteLine($"[{Name}] Tick - State: {State}");
    }
}
