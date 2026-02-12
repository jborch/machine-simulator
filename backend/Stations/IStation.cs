using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public interface IStation
{
    string Name { get; }
    void Process(ICarrier carrier);
}
