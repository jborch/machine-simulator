using MachineSimulator.Backend.Models;
using MachineSimulator.Backend.Stations;

namespace MachineSimulator.Backend.Services;

public class Simulator
{
    private readonly List<IStation> _stations = new();
    private readonly List<ICarrier> _carriers = new();

    public void AddStation(IStation station)
    {
        _stations.Add(station);
        Console.WriteLine($"Station added: {station.Name}");
    }

    public void AddCarrier(ICarrier carrier)
    {
        _carriers.Add(carrier);
        Console.WriteLine($"Carrier added: {carrier.Id}");
    }

    public void Run()
    {
        Console.WriteLine($"Simulator running with {_stations.Count} stations and {_carriers.Count} carriers.");

        foreach (var carrier in _carriers)
        {
            foreach (var station in _stations)
            {
                station.Process(carrier);
            }
        }

        Console.WriteLine("Simulator run complete.");
    }
}
