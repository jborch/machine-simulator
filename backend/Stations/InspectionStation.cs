using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class InspectionStation : IStation
{
    public string Name => "Inspection";

    public void Process(ICarrier carrier)
    {
        Console.WriteLine($"[{Name}] Processing carrier {carrier.Id}");
    }
}
