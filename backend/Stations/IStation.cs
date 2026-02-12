using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public interface IStation
{
    string Name { get; }
    string State { get; }
    void Process(ICarrier carrier);
    void Tick();
}
